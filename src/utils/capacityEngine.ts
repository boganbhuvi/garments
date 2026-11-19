import { Order, GarmentQuantityItem, GarmentSpecification, OrderPriority } from '../types/order';

export interface GarmentWorkloadPointsConfig {
  category: string;
  defaultPoints: number;
  designerMultiplier: number; // For bridal / heavy aari / complex designs
}

export interface DepartmentCapacityConfig {
  cuttingDailyLimitPoints: number; // e.g. 25 points / day
  stitchingDailyLimitPoints: number; // e.g. 20 points / day
  qcDailyLimitPoints: number; // e.g. 30 points / day
  dispatchDailyLimitPoints: number; // e.g. 40 points / day
  maxExpressSlotsPerDay: number; // e.g. 2 express orders
  maxUrgentSlotsPerDay: number; // e.g. 6 urgent orders
}

export interface CapacityOverrideRecord {
  isOverridden: boolean;
  reason: string;
  authorizedBy: string; // Master / Supervisor Name
  authorizedRole: string; // 'Production Master' | 'Shop Manager' | 'Owner'
  timestamp: string;
  notes?: string;
}

export interface CapacityCheckResult {
  isOverbooked: boolean;
  totalOrderWorkloadPoints: number;
  dueDate: string;
  priority: OrderPriority;
  departments: {
    cutting: { booked: number; limit: number; remaining: number; pctUsed: number; exceeded: boolean };
    stitching: { booked: number; limit: number; remaining: number; pctUsed: number; exceeded: boolean };
    qc: { booked: number; limit: number; remaining: number; pctUsed: number; exceeded: boolean };
    dispatch: { booked: number; limit: number; remaining: number; pctUsed: number; exceeded: boolean };
  };
  prioritySlots: {
    bookedExpressCount: number;
    maxExpressSlots: number;
    bookedUrgentCount: number;
    maxUrgentSlots: number;
    expressAvailable: boolean;
    urgentAvailable: boolean;
  };
  warningMessages: string[];
  suggestedNextSafeDate?: string;
}

export const DEFAULT_GARMENT_POINTS: Record<string, GarmentWorkloadPointsConfig> = {
  'Blouse': { category: 'Blouse', defaultPoints: 1, designerMultiplier: 2 },
  'Tamil Bridal Blouse': { category: 'Tamil Bridal Blouse', defaultPoints: 2, designerMultiplier: 2.5 },
  'Kurti': { category: 'Kurti', defaultPoints: 2, designerMultiplier: 1.5 },
  'Salwar / Churidar': { category: 'Salwar / Churidar', defaultPoints: 2, designerMultiplier: 1.5 },
  'Bottom': { category: 'Bottom', defaultPoints: 1, designerMultiplier: 1.2 },
  'Saree / Falls': { category: 'Saree / Falls', defaultPoints: 0.5, designerMultiplier: 1 },
  'Lehenga / Anarkali': { category: 'Lehenga / Anarkali', defaultPoints: 3, designerMultiplier: 2 },
  'Other': { category: 'Other', defaultPoints: 1.5, designerMultiplier: 1.5 },
};

export const DEFAULT_DEPARTMENT_CAPACITIES: DepartmentCapacityConfig = {
  cuttingDailyLimitPoints: 25,
  stitchingDailyLimitPoints: 20,
  qcDailyLimitPoints: 30,
  dispatchDailyLimitPoints: 40,
  maxExpressSlotsPerDay: 2,
  maxUrgentSlotsPerDay: 6,
};

const WORKLOAD_CONFIG_KEY = 'giriraj_workload_points_config';
const DEPT_CAPACITY_CONFIG_KEY = 'giriraj_department_capacity_config';

export function getGarmentPointsConfig(): Record<string, GarmentWorkloadPointsConfig> {
  try {
    const saved = localStorage.getItem(WORKLOAD_CONFIG_KEY);
    if (saved) return { ...DEFAULT_GARMENT_POINTS, ...JSON.parse(saved) };
  } catch (e) {
    console.error('Failed reading workload points config', e);
  }
  return DEFAULT_GARMENT_POINTS;
}

export function getDepartmentCapacities(): DepartmentCapacityConfig {
  try {
    const saved = localStorage.getItem(DEPT_CAPACITY_CONFIG_KEY);
    if (saved) return { ...DEFAULT_DEPARTMENT_CAPACITIES, ...JSON.parse(saved) };
  } catch (e) {
    console.error('Failed reading dept capacity config', e);
  }
  return DEFAULT_DEPARTMENT_CAPACITIES;
}

/**
 * Calculates total workload points for an order based on garment items and design details.
 */
export function calculateOrderWorkloadPoints(
  quantities: GarmentQuantityItem[],
  specs?: GarmentSpecification[]
): number {
  const pointsConfig = getGarmentPointsConfig();
  let totalPoints = 0;

  if (specs && specs.length > 0) {
    // Piece-level calculation
    for (const spec of specs) {
      const catKey = Object.keys(pointsConfig).find(k => spec.category.toLowerCase().includes(k.toLowerCase())) || 'Other';
      const config = pointsConfig[catKey] || { category: spec.category, defaultPoints: 1.5, designerMultiplier: 1.5 };
      
      const isDesigner = 
        spec.regionalStyle?.toLowerCase().includes('bridal') || 
        spec.regionalStyle?.toLowerCase().includes('aari') ||
        spec.neckType === 'Design' || 
        spec.specialDesignNotes?.length > 10;
      
      const pts = isDesigner ? config.defaultPoints * config.designerMultiplier : config.defaultPoints;
      totalPoints += pts;
    }
  } else {
    // Fallback to garment quantities
    for (const item of quantities) {
      if (item.quantity <= 0) continue;
      const catKey = Object.keys(pointsConfig).find(k => item.label.toLowerCase().includes(k.toLowerCase()) || item.category.toLowerCase().includes(k.toLowerCase())) || 'Other';
      const config = pointsConfig[catKey] || { category: item.label, defaultPoints: 1.5, designerMultiplier: 1.5 };
      totalPoints += config.defaultPoints * item.quantity;
    }
  }

  return Math.round(totalPoints * 10) / 10;
}

/**
 * Evaluates production capacity across Cutting, Stitching, QC, and Dispatch for a target due date.
 */
export function checkProductionCapacity(
  targetDueDate: string,
  targetPriority: OrderPriority,
  newOrderWorkloadPoints: number,
  existingOrders: Order[],
  currentOrderId?: string
): CapacityCheckResult {
  const capacities = getDepartmentCapacities();
  const warningMessages: string[] = [];

  // Filter existing active orders on the target due date (excluding cancelled or delivered, and excluding self)
  const activeSameDateOrders = existingOrders.filter(ord => {
    if (currentOrderId && ord.id === currentOrderId) return false;
    if (ord.status === 'DELIVERED') return false;
    return ord.billing.dueDate === targetDueDate;
  });

  // Calculate already booked workload points for this due date
  let bookedCutting = 0;
  let bookedStitching = 0;
  let bookedQC = 0;
  let bookedDispatch = 0;
  let expressCount = 0;
  let urgentCount = 0;

  for (const ord of activeSameDateOrders) {
    const pts = calculateOrderWorkloadPoints(ord.garmentQuantities, ord.garmentSpecs);
    bookedCutting += pts;
    bookedStitching += pts;
    bookedQC += pts;
    bookedDispatch += pts;

    if (ord.billing.priority === 'Express') expressCount++;
    if (ord.billing.priority === 'Urgent') urgentCount++;
  }

  // Check additions
  const totalCutting = bookedCutting + newOrderWorkloadPoints;
  const totalStitching = bookedStitching + newOrderWorkloadPoints;
  const totalQC = bookedQC + newOrderWorkloadPoints;
  const totalDispatch = bookedDispatch + newOrderWorkloadPoints;

  const cuttingExceeded = totalCutting > capacities.cuttingDailyLimitPoints;
  const stitchingExceeded = totalStitching > capacities.stitchingDailyLimitPoints;
  const qcExceeded = totalQC > capacities.qcDailyLimitPoints;
  const dispatchExceeded = totalDispatch > capacities.dispatchDailyLimitPoints;

  if (cuttingExceeded) {
    warningMessages.push(`Cutting Department overloaded: Booked ${totalCutting.toFixed(1)} pts vs ${capacities.cuttingDailyLimitPoints} max daily capacity.`);
  }
  if (stitchingExceeded) {
    warningMessages.push(`Stitching Department overloaded: Booked ${totalStitching.toFixed(1)} pts vs ${capacities.stitchingDailyLimitPoints} max daily capacity.`);
  }
  if (qcExceeded) {
    warningMessages.push(`QC Inspection queue overloaded: Booked ${totalQC.toFixed(1)} pts vs ${capacities.qcDailyLimitPoints} max.`);
  }
  if (dispatchExceeded) {
    warningMessages.push(`Dispatch/Counter capacity overloaded: Booked ${totalDispatch.toFixed(1)} pts vs ${capacities.dispatchDailyLimitPoints} max.`);
  }

  // Priority slot limits
  let expressAvailable = true;
  let urgentAvailable = true;

  if (targetPriority === 'Express') {
    if (expressCount >= capacities.maxExpressSlotsPerDay) {
      expressAvailable = false;
      warningMessages.push(`Maximum daily Express VIP slots (${capacities.maxExpressSlotsPerDay}) already filled for ${targetDueDate}!`);
    }
  }

  if (targetPriority === 'Urgent') {
    if (urgentCount >= capacities.maxUrgentSlotsPerDay) {
      urgentAvailable = false;
      warningMessages.push(`Urgent priority capacity (${capacities.maxUrgentSlotsPerDay}) reached for ${targetDueDate}.`);
    }
  }

  const isOverbooked = cuttingExceeded || stitchingExceeded || qcExceeded || dispatchExceeded || !expressAvailable || !urgentAvailable;

  // Find next safe date if overbooked
  let suggestedNextSafeDate: string | undefined = undefined;
  if (isOverbooked && targetDueDate) {
    let checkDate = new Date(targetDueDate);
    for (let i = 1; i <= 14; i++) {
      checkDate.setDate(checkDate.getDate() + 1);
      const nextDateStr = checkDate.toISOString().split('T')[0];
      const nextDateOrders = existingOrders.filter(o => o.billing.dueDate === nextDateStr && o.status !== 'DELIVERED');
      let sumPts = 0;
      let nextExpCount = 0;
      for (const o of nextDateOrders) {
        sumPts += calculateOrderWorkloadPoints(o.garmentQuantities, o.garmentSpecs);
        if (o.billing.priority === 'Express') nextExpCount++;
      }
      if (
        sumPts + newOrderWorkloadPoints <= capacities.stitchingDailyLimitPoints &&
        (targetPriority !== 'Express' || nextExpCount < capacities.maxExpressSlotsPerDay)
      ) {
        suggestedNextSafeDate = nextDateStr;
        break;
      }
    }
  }

  return {
    isOverbooked,
    totalOrderWorkloadPoints: newOrderWorkloadPoints,
    dueDate: targetDueDate,
    priority: targetPriority,
    departments: {
      cutting: {
        booked: bookedCutting,
        limit: capacities.cuttingDailyLimitPoints,
        remaining: Math.max(0, capacities.cuttingDailyLimitPoints - bookedCutting),
        pctUsed: Math.min(100, Math.round((totalCutting / capacities.cuttingDailyLimitPoints) * 100)),
        exceeded: cuttingExceeded,
      },
      stitching: {
        booked: bookedStitching,
        limit: capacities.stitchingDailyLimitPoints,
        remaining: Math.max(0, capacities.stitchingDailyLimitPoints - bookedStitching),
        pctUsed: Math.min(100, Math.round((totalStitching / capacities.stitchingDailyLimitPoints) * 100)),
        exceeded: stitchingExceeded,
      },
      qc: {
        booked: bookedQC,
        limit: capacities.qcDailyLimitPoints,
        remaining: Math.max(0, capacities.qcDailyLimitPoints - bookedQC),
        pctUsed: Math.min(100, Math.round((totalQC / capacities.qcDailyLimitPoints) * 100)),
        exceeded: qcExceeded,
      },
      dispatch: {
        booked: bookedDispatch,
        limit: capacities.dispatchDailyLimitPoints,
        remaining: Math.max(0, capacities.dispatchDailyLimitPoints - bookedDispatch),
        pctUsed: Math.min(100, Math.round((totalDispatch / capacities.dispatchDailyLimitPoints) * 100)),
        exceeded: dispatchExceeded,
      },
    },
    prioritySlots: {
      bookedExpressCount: expressCount,
      maxExpressSlots: capacities.maxExpressSlotsPerDay,
      bookedUrgentCount: urgentCount,
      maxUrgentSlots: capacities.maxUrgentSlotsPerDay,
      expressAvailable,
      urgentAvailable,
    },
    warningMessages,
    suggestedNextSafeDate,
  };
}

/**
 * Priority queue sorting function: Express > Urgent > Normal, then Due Date, then Creation/Entry Date.
 */
export function sortProductionQueue<T extends { billing: { dueDate: string; priority: OrderPriority }; createdAt: string }>(
  items: T[]
): T[] {
  const priorityRank: Record<OrderPriority, number> = {
    Express: 1,
    Urgent: 2,
    Normal: 3,
  };

  return [...items].sort((a, b) => {
    const rankA = priorityRank[a.billing.priority] || 3;
    const rankB = priorityRank[b.billing.priority] || 3;
    if (rankA !== rankB) return rankA - rankB;

    // Next compare due date (earliest due first)
    const dateA = new Date(a.billing.dueDate).getTime() || 0;
    const dateB = new Date(b.billing.dueDate).getTime() || 0;
    if (dateA !== dateB) return dateA - dateB;

    // Finally compare creation date (FIFO)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}
