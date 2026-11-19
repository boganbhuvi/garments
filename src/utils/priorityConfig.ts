import { OrderPriority } from '../types/order';

export interface PriorityTierConfig {
  tier: OrderPriority;
  label: string;
  enabled: boolean;
  surchargeType: 'percentage' | 'fixed';
  surchargeValue: number; // e.g. 0 for Normal, 20 (%) or 300 (fixed) for Urgent, 40 (%) or 600 (fixed) for Express
  expectedTurnaroundDays: number; // e.g. 7 for Normal, 3 for Urgent, 1 for Express
  maxDailyOrders: number; // Max capacity limit per day
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  accentColor: string;
  description: string;
}

export interface PrioritySnapshot {
  tier: OrderPriority;
  tierLabel: string;
  surchargeType: 'percentage' | 'fixed';
  surchargeValue: number;
  calculatedFee: number;
  expectedTurnaroundDays: number;
  snapshotAt: string;
}

export const DEFAULT_PRIORITY_CONFIGS: Record<OrderPriority, PriorityTierConfig> = {
  Normal: {
    tier: 'Normal',
    label: 'Normal Delivery',
    enabled: true,
    surchargeType: 'fixed',
    surchargeValue: 0,
    expectedTurnaroundDays: 7,
    maxDailyOrders: 50,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    borderColor: 'border-slate-300',
    accentColor: '#475569',
    description: 'Standard 7-day workshop processing with regular queue sequencing.',
  },
  Urgent: {
    tier: 'Urgent',
    label: 'Urgent Priority',
    enabled: true,
    surchargeType: 'fixed',
    surchargeValue: 300,
    expectedTurnaroundDays: 3,
    maxDailyOrders: 6,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    borderColor: 'border-amber-400',
    accentColor: '#D97706',
    description: 'Fast-track 3-day delivery. Advanced cutting queue allocation.',
  },
  Express: {
    tier: 'Express',
    label: 'Express VIP',
    enabled: true,
    surchargeType: 'percentage',
    surchargeValue: 30, // 30% surcharge or ₹600 equivalent
    expectedTurnaroundDays: 1,
    maxDailyOrders: 2,
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    borderColor: 'border-purple-400',
    accentColor: '#9333EA',
    description: 'Top-tier 24h to 48h emergency turnaround. Dedicated master tailor allocation.',
  },
};

const STORAGE_KEY = 'giriraj_priority_configs_v1';

export function getPriorityConfigs(): Record<OrderPriority, PriorityTierConfig> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PRIORITY_CONFIGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse priority configs from storage', e);
  }
  return DEFAULT_PRIORITY_CONFIGS;
}

export function savePriorityConfigs(configs: Record<OrderPriority, PriorityTierConfig>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (e) {
    console.error('Failed to save priority configs to storage', e);
  }
}

/**
 * Calculates additional priority surcharge amount given a subtotal and priority tier.
 */
export function calculatePrioritySurcharge(
  subtotal: number,
  tier: OrderPriority,
  configs?: Record<OrderPriority, PriorityTierConfig>
): number {
  const cfg = (configs || getPriorityConfigs())[tier];
  if (!cfg || !cfg.enabled || cfg.surchargeValue <= 0) {
    return 0;
  }
  if (cfg.surchargeType === 'percentage') {
    return Math.round((subtotal * cfg.surchargeValue) / 100);
  }
  return Math.round(cfg.surchargeValue);
}

/**
 * Generates an immutable snapshot of priority fee details to preserve historical integrity.
 */
export function createPrioritySnapshot(
  subtotal: number,
  tier: OrderPriority,
  configs?: Record<OrderPriority, PriorityTierConfig>
): PrioritySnapshot {
  const cfg = (configs || getPriorityConfigs())[tier];
  const calculatedFee = calculatePrioritySurcharge(subtotal, tier, configs);
  return {
    tier,
    tierLabel: cfg ? cfg.label : tier,
    surchargeType: cfg ? cfg.surchargeType : 'fixed',
    surchargeValue: cfg ? cfg.surchargeValue : 0,
    calculatedFee,
    expectedTurnaroundDays: cfg ? cfg.expectedTurnaroundDays : 7,
    snapshotAt: new Date().toISOString(),
  };
}

/**
 * Calculates suggested delivery date string (YYYY-MM-DD) based on priority turnaround days.
 */
export function getSuggestedDueDate(tier: OrderPriority, baseDateStr?: string): string {
  const configs = getPriorityConfigs();
  const days = configs[tier]?.expectedTurnaroundDays || 7;
  const base = baseDateStr ? new Date(baseDateStr) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
}
