import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Order,
  CustomerDetails,
  GarmentQuantityItem,
  MeasurementRecord,
  GarmentSpecification,
  BillingLineItem,
  AdditionalCharges,
  BillingDetails,
  CuttingStatus,
  CuttingMaterialCheck,
  CuttingOrderDetails,
  QCInspectionRecord,
  DispatchRecord
} from '../types/order';
import {
  TailorProfile,
  TailorWageEntry,
  TailorPaymentRecord,
  TailorWageSummary,
  StitchingStatus
} from '../types/stitching';
import { CapacityOverrideRecord } from '../utils/capacityEngine';
import { createPrioritySnapshot } from '../utils/priorityConfig';
import { SAMPLE_ORDERS } from '../data/sampleData';
import { INITIAL_TAILORS } from '../data/sampleTailors';
import { INITIAL_GARMENT_CATEGORIES, EMPTY_MEASUREMENTS } from '../data/defaultTemplates';
import { api, DatabaseStatus } from '../services/api';

export type AppModule = 
  | 'OVERVIEW' 
  | 'FRONT_DESK' 
  | 'CUTTING_DEPT' 
  | 'STITCHING_DEPT' 
  | 'QC_DEPT' 
  | 'DISPATCH_DEPT'
  | 'ORDERS'
  | 'CUSTOMERS'
  | 'TAILORS'
  | 'REPORTS'
  | 'SETTINGS';

interface OrderContextType {
  order: Order;
  savedOrders: Order[];
  currentStep: number;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  dbStatus: DatabaseStatus | null;
  isSyncing: boolean;
  activeModule: AppModule;
  selectedCuttingOrderId: string | null;
  selectedDetailOrder: Order | null;
  setActiveModule: (module: AppModule) => void;
  setSelectedCuttingOrderId: (id: string | null) => void;
  setSelectedDetailOrder: (order: Order | null) => void;
  loadDemoData: () => void;
  setCurrentStep: (step: number) => void;
  setMeasurementUnit: (targetUnit: 'in' | 'cm') => void;
  recordNotificationLog: (orderId: string, record: import('../types/order').WhatsAppNotificationRecord) => void;
  whatsAppModalOrder: Order | null;
  whatsAppDefaultTemplate?: import('../services/whatsappService').WhatsAppTemplateId;
  openWhatsAppModal: (order: Order, defaultTemplate?: import('../services/whatsappService').WhatsAppTemplateId) => void;
  closeWhatsAppModal: () => void;
  syncStatus: 'SAVING' | 'SAVED_LOCALLY' | 'SYNCED_WITH_DATABASE' | 'SYNC_FAILED';
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  defaultWorkshopUnit: 'in' | 'cm';
  setDefaultWorkshopUnit: (unit: 'in' | 'cm') => void;
  abbreviationCodes: Record<string, { label: string; confirmed: boolean }>;
  updateAbbreviationCode: (code: string, label: string) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  saveDraft: () => Promise<void>;
  submitOrder: () => Promise<void>;
  createNewOrder: () => void;
  clearOrder: () => void;
  loadOrder: (orderId: string) => void;
  deleteOrder: (orderId: string) => Promise<void>;
  updateCustomer: (fields: Partial<CustomerDetails>) => void;
  searchCustomers: (query: string) => Order[];
  selectCustomerFromHistory: (order: Order) => void;
  updateGarmentQuantity: (id: string, quantity: number) => void;
  addCustomGarmentCategory: (label: string) => void;
  updateMeasurementField: (field: keyof MeasurementRecord, value: number | '' | string) => void;
  updateCustomMeasurementField: (id: string, value: number | '') => void;
  addCustomMeasurementField: (code: string, label: string) => void;
  toggleMeasurementUnit: () => void;
  updateGarmentSpec: (index: number, fields: Partial<GarmentSpecification>) => void;
  addGarmentSpec: (category?: string) => void;
  removeGarmentSpec: (index: number) => void;
  duplicateGarmentSpec: (fromIndex: number, toIndex?: number) => void;
  updateBillingItem: (id: string, fields: Partial<BillingLineItem>) => void;
  addBillingItem: () => void;
  removeBillingItem: (id: string) => void;
  updateAdditionalCharges: (fields: Partial<AdditionalCharges>) => void;
  updateBillingMeta: (fields: Partial<BillingDetails>) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
  syncGarmentSpecsFromQuantities: () => void;
  syncToMongoDB: () => Promise<void>;
  checkDbHealth: () => Promise<void>;
  updateCuttingStatus: (
    orderId: string,
    status: CuttingStatus,
    remarks?: string,
    holdReason?: string,
    actualQuantityCut?: number
  ) => Promise<void>;
  updateGarmentCuttingStatus: (
    orderId: string,
    garmentIndex: number,
    status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold',
    remarks?: string
  ) => Promise<void>;
  updateMaterialCheck: (
    orderId: string,
    materialsCheck: CuttingMaterialCheck
  ) => Promise<void>;

  // Phase 2: Stitching & Tailor Allocation
  tailors: TailorProfile[];
  wageEntries: TailorWageEntry[];
  paymentRecords: TailorPaymentRecord[];
  addTailor: (tailor: Omit<TailorProfile, 'id' | 'createdAt'>) => Promise<void>;
  updateTailor: (id: string, fields: Partial<TailorProfile>) => Promise<void>;
  deleteTailor: (id: string) => Promise<void>;
  allocateMultipleGarmentsToTailor: (
    orderId: string,
    garmentIndices: number[],
    allocation: { tailorId: string; pieceRate: number; expectedDate?: string; instructions?: string }
  ) => Promise<void>;
  updateGarmentStitchingStatus: (
    orderId: string,
    garmentIndex: number,
    status: StitchingStatus,
    remarks?: string,
    reworkNotes?: string
  ) => Promise<void>;
  recordTailorPayment: (payment: Omit<TailorPaymentRecord, 'id'>) => Promise<void>;
  getTailorWageSummary: () => TailorWageSummary[];

  // Phase 3: QC & Alterations, Dispatch & Overrides
  updateQCStatus: (
    orderId: string,
    garmentIndex: number,
    qcRecord: QCInspectionRecord,
    orderRemarks?: string
  ) => Promise<void>;
  recordDispatch: (
    orderId: string,
    dispatchRecord: DispatchRecord
  ) => Promise<void>;
  recordCapacityOverride: (
    orderId: string,
    overrideRecord: CapacityOverrideRecord
  ) => Promise<void>;
}

const STORAGE_KEY = 'giriraj_garments_orders_v4';
const CURRENT_ORDER_KEY = 'giriraj_garments_current_order_v2';
const TAILORS_STORAGE_KEY = 'giriraj_garments_tailors_v1';
const WAGES_STORAGE_KEY = 'giriraj_garments_wages_v1';
const PAYMENTS_STORAGE_KEY = 'giriraj_garments_payments_v1';

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

function generateNextBillNumber(count: number): string {
  const num = 840 + count + 1;
  return `GG-2025-${num.toString().padStart(4, '0')}`;
}

function generateNextCustId(count: number): string {
  const num = 840 + count + 1;
  return `CUST-${num}`;
}

function createBlankOrder(orderCount: number, defaultUnit: 'in' | 'cm' = 'in'): Order {
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const formattedDueDate = dueDate.toISOString().split('T')[0];
  const billNo = generateNextBillNumber(orderCount);

  return {
    id: billNo,
    serialNumber: `SR-${(orderCount + 95).toString().padStart(3, '0')}`,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 1,
    customer: {
      customerId: generateNextCustId(orderCount),
      billNumber: billNo,
      date: today,
      customerName: '',
      relationshipType: 'D/O',
      fatherName: '',
      husbandName: '',
      primaryPhone: '',
      secondaryPhone: '',
      additionalPhones: [],
      fullAddress: '',
      areaLocation: ''
    },
    garmentQuantities: JSON.parse(JSON.stringify(INITIAL_GARMENT_CATEGORIES)),
    measurements: {
      ...JSON.parse(JSON.stringify(EMPTY_MEASUREMENTS)),
      unit: defaultUnit
    },
    garmentSpecs: [],
    billing: {
      items: [],
      additionalCharges: {
        stitchingCharges: 0,
        materialCharges: 0,
        designCharges: 0,
        otherCharges: 0,
        discount: 0
      },
      subtotal: 0,
      grandTotal: 0,
      advanceAmount: 0,
      amountPaid: 0,
      balanceAmount: 0,
      paymentMethod: 'Cash',
      paymentStatus: 'UNPAID',
      orderDate: today,
      dueDate: formattedDueDate,
      priority: 'Normal',
      deliveryNotes: '',
      referralId: '',
      referredBy: '',
      referralNotes: ''
    }
  };
}

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Saved orders in local storage
  const [savedOrders, setSavedOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Order[] = JSON.parse(stored);
        // If stored contains the old fake data or lacks additionalPhones schema, upgrade to latest database
        const hasOldData = parsed.some(
          o => o.customer.customerId === 'CUST-101' || 
               o.customer.customerName === 'Lakshmi Ramakrishnan' ||
               o.customer.customerName === 'Dr. Ananya Subramanian' ||
               (o.customer.customerId === 'A005' && (!o.customer.additionalPhones || o.customer.additionalPhones.length === 0))
        );
        if (!hasOldData && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading saved orders from localStorage', e);
    }
    // Default to the 191 real register customers
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
    } catch {}
    return SAMPLE_ORDERS;
  });

  // Default Workshop Unit for NEW orders (persisted, defaults to 'in')
  const [defaultWorkshopUnit, setDefaultWorkshopUnitState] = useState<'in' | 'cm'>(() => {
    try {
      const saved = localStorage.getItem('giriraj_default_workshop_unit');
      if (saved === 'in' || saved === 'cm') return saved;
    } catch {}
    return 'in';
  });

  const setDefaultWorkshopUnit = (unit: 'in' | 'cm') => {
    setDefaultWorkshopUnitState(unit);
    try {
      localStorage.setItem('giriraj_default_workshop_unit', unit);
    } catch {}
  };

  // Shared Desktop Sidebar Collapse state (persisted, defaults to false for readable expanded view)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('giriraj_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('giriraj_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Current order in progress (clean blank order by default)
  const [order, setOrder] = useState<Order>(() => {
    try {
      const storedCurrent = localStorage.getItem(CURRENT_ORDER_KEY);
      if (storedCurrent) {
        const parsed = JSON.parse(storedCurrent);
        // If it was the dummy sample order, discard it so fields start clean
        if (parsed && parsed.customer?.customerName !== 'Lakshmi Ramakrishnan' && parsed.id !== 'GG-2025-0842') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading current order from localStorage', e);
    }
    return createBlankOrder(SAMPLE_ORDERS.length, defaultWorkshopUnit);
  });

  const [currentStep, setCurrentStep] = useState<number>(order.currentStep || 1);
  const [activeModule, setActiveModule] = useState<AppModule>('OVERVIEW');
  const [selectedCuttingOrderId, setSelectedCuttingOrderId] = useState<string | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<Order | null>(null);
  const [whatsAppDefaultTemplate, setWhatsAppDefaultTemplate] = useState<import('../services/whatsappService').WhatsAppTemplateId | undefined>(undefined);

  const openWhatsAppModal = (ord: Order, defaultTemplate?: import('../services/whatsappService').WhatsAppTemplateId) => {
    setWhatsAppModalOrder(ord);
    setWhatsAppDefaultTemplate(defaultTemplate);
  };

  const closeWhatsAppModal = () => {
    setWhatsAppModalOrder(null);
    setWhatsAppDefaultTemplate(undefined);
  };

  // Autosave and Database Sync Status
  const [syncStatus, setSyncStatus] = useState<'SAVING' | 'SAVED_LOCALLY' | 'SYNCED_WITH_DATABASE' | 'SYNC_FAILED'>('SAVED_LOCALLY');

  // Configurable Measurement Code Reference (SH is confirmed; others configurable)
  const [abbreviationCodes, setAbbreviationCodes] = useState<Record<string, { label: string; confirmed: boolean }>>(() => {
    try {
      const stored = localStorage.getItem('giriraj_abbreviation_map');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      SH: { label: 'Shoulder Width', confirmed: true },
      SL: { label: 'Sleeve Length', confirmed: false },
      AH: { label: 'Armhole Depth', confirmed: false },
      BH: { label: 'Blouse Height / Length', confirmed: false },
      FNN: { label: 'Front Neck Depth', confirmed: false },
      BN: { label: 'Back Neck Depth', confirmed: false },
    };
  });

  const updateAbbreviationCode = (code: string, label: string) => {
    setAbbreviationCodes(prev => {
      const next = {
        ...prev,
        [code]: { label: label.trim(), confirmed: code === 'SH' ? true : (prev[code]?.confirmed || false) }
      };
      try {
        localStorage.setItem('giriraj_abbreviation_map', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Phase 2: Tailors, Wages & Payment Records State
  const [tailors, setTailors] = useState<TailorProfile[]>(() => {
    try {
      const stored = localStorage.getItem(TAILORS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading tailors from localStorage', e);
    }
    return INITIAL_TAILORS;
  });

  const [wageEntries, setWageEntries] = useState<TailorWageEntry[]>(() => {
    try {
      const stored = localStorage.getItem(WAGES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading wages from localStorage', e);
    }
    return [];
  });

  const [paymentRecords, setPaymentRecords] = useState<TailorPaymentRecord[]>(() => {
    try {
      const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading payments from localStorage', e);
    }
    return [];
  });

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Check MongoDB health on mount & poll periodically
  const checkDbHealth = async () => {
    try {
      const health = await api.checkHealth();
      if (health && health.database) {
        setDbStatus(health.database);
        if (health.database.connected) {
          // Fetch latest from MongoDB
          const remoteOrders = await api.getOrders();
          if (remoteOrders && remoteOrders.length > 0) {
            setSavedOrders(remoteOrders);
          }
        }
      } else {
        setDbStatus({ connected: false, host: 'Disconnected', name: 'Offline' });
      }
    } catch {
      setDbStatus({ connected: false, host: 'Disconnected', name: 'Offline' });
    }
  };

  useEffect(() => {
    checkDbHealth();
    const interval = setInterval(checkDbHealth, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  // Persist current order and saved orders to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOrders));
    } catch (e) {
      console.error('Error saving orders list to localStorage', e);
    }
  }, [savedOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify({ ...order, currentStep }));
    } catch (e) {
      console.error('Error saving current order to localStorage', e);
    }
  }, [order, currentStep]);

  // Recalculate billing totals with priority surcharge
  const recalculateBilling = (currentOrder: Order): Order => {
    const subtotal = currentOrder.billing.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const { stitchingCharges, materialCharges, designCharges, otherCharges, discount } = currentOrder.billing.additionalCharges;
    const addOns = (Number(stitchingCharges) || 0) + (Number(materialCharges) || 0) + (Number(designCharges) || 0) + (Number(otherCharges) || 0);
    const disc = Number(discount) || 0;

    // Automatic Priority Surcharge calculation & snapshot
    const priority = currentOrder.billing.priority || 'Normal';
    const prioritySnapshot = createPrioritySnapshot(subtotal, priority);
    const priorityFee = prioritySnapshot.calculatedFee;

    const grandTotal = Math.max(0, subtotal + addOns + priorityFee - disc);
    const advance = Number(currentOrder.billing.advanceAmount) || 0;
    const balance = Math.max(0, grandTotal - advance);

    let paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';
    if (advance >= grandTotal && grandTotal > 0) {
      paymentStatus = 'PAID';
    } else if (advance > 0) {
      paymentStatus = 'PARTIAL';
    } else {
      paymentStatus = 'UNPAID';
    }

    return {
      ...currentOrder,
      billing: {
        ...currentOrder.billing,
        subtotal,
        grandTotal,
        prioritySurcharge: priorityFee,
        priorityTurnaroundDays: prioritySnapshot.expectedTurnaroundDays,
        prioritySnapshot,
        amountPaid: advance,
        balanceAmount: balance,
        paymentStatus
      }
    };
  };

  // Navigation
  const nextStep = (): boolean => {
    if (currentStep === 1) {
      if (!order.customer.customerName.trim()) {
        showToast('Please enter Customer Name to proceed', 'warning');
        return false;
      }
      if (!order.customer.primaryPhone.trim()) {
        showToast('Please enter Primary Phone Number', 'warning');
        return false;
      }
      if (!order.customer.fullAddress.trim()) {
        showToast('Please enter Customer Full Address', 'warning');
        return false;
      }
      syncGarmentSpecsFromQuantities();
    }

    if (currentStep < 5) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setOrder(prev => ({ ...prev, currentStep: next }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }
    return true;
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setOrder(o => ({ ...o, currentStep: prev }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Save Draft (LocalStorage + MongoDB)
  const saveDraft = async () => {
    setSyncStatus('SAVING');
    const updatedOrder = recalculateBilling({
      ...order,
      updatedAt: new Date().toISOString()
    });

    // Update local state immediately
    setSavedOrders(prev => {
      const idx = prev.findIndex(o => o.id === updatedOrder.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedOrder;
        return copy;
      }
      return [updatedOrder, ...prev];
    });
    setOrder(updatedOrder);
    setSyncStatus('SAVED_LOCALLY');

    // Save to MongoDB if connected
    if (dbStatus?.connected) {
      try {
        const saved = await api.saveOrder(updatedOrder);
        if (saved) {
          setSyncStatus('SYNCED_WITH_DATABASE');
          showToast(`Order #${updatedOrder.id} saved to MongoDB (${dbStatus.name}) & LocalStorage!`, 'success');
          return;
        }
      } catch (err) {
        console.warn('Could not save to MongoDB, cached locally.', err);
        setSyncStatus('SYNC_FAILED');
      }
    }

    showToast(`Order #${updatedOrder.id} draft saved to LocalStorage!`, 'success');
  };

  // Submit Order (LocalStorage + MongoDB)
  const submitOrder = async () => {
    const submittedOrder = recalculateBilling({
      ...order,
      status: 'NEW',
      updatedAt: new Date().toISOString()
    });

    setSavedOrders(prev => {
      const idx = prev.findIndex(o => o.id === submittedOrder.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = submittedOrder;
        return copy;
      }
      return [submittedOrder, ...prev];
    });
    setOrder(submittedOrder);

    if (dbStatus?.connected) {
      try {
        const saved = await api.saveOrder(submittedOrder);
        if (saved) {
          showToast(`Order #${submittedOrder.id} submitted & recorded in MongoDB!`, 'success');
          return;
        }
      } catch (err) {
        console.warn('MongoDB save error', err);
      }
    }

    showToast(`Order #${submittedOrder.id} confirmed and saved!`, 'success');
  };

  // Sync all local records to MongoDB
  const syncToMongoDB = async () => {
    if (!dbStatus?.connected) {
      showToast('Cannot sync: MongoDB server is offline or not reachable.', 'warning');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await api.syncOrders(savedOrders);
      if (res) {
        showToast(`✓ Synced ${res.count} orders to MongoDB database [${dbStatus.name}]`, 'success');
        const remote = await api.getOrders();
        if (remote) setSavedOrders(remote);
      } else {
        showToast('Sync completed with warnings.', 'info');
      }
    } catch {
      showToast('Sync failed. Please check server log.', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  const createNewOrder = () => {
    const newOrd = createBlankOrder(savedOrders.length, defaultWorkshopUnit);
    setOrder(newOrd);
    setCurrentStep(1);
    try {
      localStorage.removeItem(CURRENT_ORDER_KEY);
    } catch (e) {
      console.error(e);
    }
    showToast(`Started new order #${newOrd.id}`, 'info');
  };

  const clearOrder = () => {
    const newOrd = createBlankOrder(savedOrders.length, defaultWorkshopUnit);
    setOrder(newOrd);
    setCurrentStep(1);
    try {
      localStorage.removeItem(CURRENT_ORDER_KEY);
    } catch (e) {
      console.error(e);
    }
    showToast('All form data cleared! Clean slate.', 'info');
  };

  const loadOrder = (orderId: string) => {
    const found = savedOrders.find(o => o.id === orderId);
    if (found) {
      setOrder(JSON.parse(JSON.stringify(found)));
      setCurrentStep(found.currentStep || 1);
      showToast(`Loaded order #${found.id} (${found.customer.customerName})`, 'info');
    }
  };

  const deleteOrder = async (orderId: string) => {
    setSavedOrders(prev => prev.filter(o => o.id !== orderId));
    if (dbStatus?.connected) {
      try {
        await api.deleteOrder(orderId);
      } catch (e) {
        console.error('Delete from MongoDB error', e);
      }
    }
    showToast(`Order #${orderId} deleted`, 'info');
  };

  const updateCustomer = (fields: Partial<CustomerDetails>) => {
    setOrder(prev => ({
      ...prev,
      customer: { ...prev.customer, ...fields },
      updatedAt: new Date().toISOString()
    }));
  };

  const searchCustomers = (query: string): Order[] => {
    if (!query.trim()) return savedOrders;
    const q = query.toLowerCase().trim();
    // Normalize numeric digits for phone search
    const digitsOnly = query.replace(/\D/g, '');

    return savedOrders.filter(o => {
      const c = o.customer;
      // Name, ID, or Order ID match
      if (
        c.customerName.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      ) {
        return true;
      }

      // Any phone number match (primary, secondary, or additionalPhones)
      const allPhones: string[] = [
        c.primaryPhone || '',
        c.secondaryPhone || '',
        ...(c.additionalPhones || [])
      ].filter(Boolean);

      return allPhones.some(phone => {
        const cleanPhone = phone.replace(/\D/g, '');
        return phone.includes(q) || (digitsOnly && cleanPhone.includes(digitsOnly));
      });
    });
  };

  const selectCustomerFromHistory = (sourceOrder: Order) => {
    setOrder(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        customerId: sourceOrder.customer.customerId,
        customerName: sourceOrder.customer.customerName,
        relationshipType: sourceOrder.customer.relationshipType,
        fatherName: sourceOrder.customer.fatherName,
        husbandName: sourceOrder.customer.husbandName,
        primaryPhone: sourceOrder.customer.primaryPhone,
        secondaryPhone: sourceOrder.customer.secondaryPhone,
        additionalPhones: sourceOrder.customer.additionalPhones ? [...sourceOrder.customer.additionalPhones] : [],
        fullAddress: sourceOrder.customer.fullAddress,
        areaLocation: sourceOrder.customer.areaLocation
      },
      measurements: JSON.parse(JSON.stringify(sourceOrder.measurements))
    }));
    showToast(`Customer & measurements imported from #${sourceOrder.id}`, 'success');
  };

  const updateGarmentQuantity = (id: string, quantity: number) => {
    const validQty = Math.max(0, Math.floor(quantity) || 0);
    setOrder(prev => {
      const updatedCategories = prev.garmentQuantities.map(cat => 
        cat.id === id ? { ...cat, quantity: validQty } : cat
      );
      return {
        ...prev,
        garmentQuantities: updatedCategories
      };
    });
  };

  const addCustomGarmentCategory = (label: string) => {
    if (!label.trim()) return;
    const newId = `cat-custom-${Date.now()}`;
    const newCategory: GarmentQuantityItem = {
      id: newId,
      category: label.trim(),
      label: label.trim(),
      quantity: 1,
      isCustom: true
    };
    setOrder(prev => ({
      ...prev,
      garmentQuantities: [...prev.garmentQuantities, newCategory]
    }));
    showToast(`Added custom category: ${label.trim()}`, 'success');
  };

  const syncGarmentSpecsFromQuantities = () => {
    setOrder(prev => {
      const neededGarments: { category: string; title: string }[] = [];
      prev.garmentQuantities.forEach(cat => {
        if (cat.quantity > 0) {
          const singular = cat.label.endsWith('s') ? cat.label.slice(0, -1) : cat.label;
          for (let i = 1; i <= cat.quantity; i++) {
            neededGarments.push({
              category: singular,
              title: `${singular} ${i.toString().padStart(2, '0')}`
            });
          }
        }
      });

      if (neededGarments.length === 0) {
        neededGarments.push({
          category: 'Blouse',
          title: 'Blouse 01: Standard Cut'
        });
      }

      const newSpecs: GarmentSpecification[] = neededGarments.map((item, idx) => {
        const existing = prev.garmentSpecs[idx];
        if (existing) {
          return {
            ...existing,
            garmentNumber: idx + 1,
            title: existing.title || `${item.category} ${(idx + 1).toString().padStart(2, '0')}`,
            category: existing.category || item.category
          };
        }

        const isBlouse = item.category.toLowerCase().includes('blouse');
        const isKurti = item.category.toLowerCase().includes('kurti') || item.category.toLowerCase().includes('top');
        const isBottom = item.category.toLowerCase().includes('bottom') || item.category.toLowerCase().includes('pant') || item.category.toLowerCase().includes('churidar') || item.category.toLowerCase().includes('salwar');

        return {
          id: `spec-${Date.now()}-${idx}`,
          garmentNumber: idx + 1,
          category: item.category,
          title: `${item.title}`,
          sleeveType: isBlouse ? 'Elbow Length (10.5 in)' : isKurti ? '3/4 Sleeve (16.0 in)' : 'Custom Sleeve',
          garmentType: isBlouse ? 'Princess Cut (Padded)' : isKurti ? 'Long Top (A-Line)' : 'Custom Cut',
          slit: isKurti ? 'Yes' : 'No',
          zip: 'No',
          lining: isBlouse || isKurti ? 'Yes' : 'No',
          neckType: isBlouse || isKurti ? 'Design' : 'Standard',
          frontNeckDesign: isBlouse ? 'Sweetheart Neck' : isKurti ? 'Round Neck with Notch' : '',
          backNeckDesign: isBlouse ? 'Deep U-Shape with Dori' : isKurti ? 'Round Neck' : '',
          frontHookOrBack: isBlouse ? 'Back Hook' : 'Elastic',
          neckDepthNotes: '',
          fitting: 'M+',
          bottomStyle: isBottom ? 'Gathering / Churidar Tight' : 'Salwar (Normal Pleats)',
          regionalStyle: isBlouse ? 'Tamil Bridal' : 'Traditional Fit',
          materials: [
            {
              id: `mat-${Date.now()}-1`,
              category: isBlouse ? 'Blouse Material' : isKurti ? 'Top Material' : isBottom ? 'Bottom Material' : 'Additional Material',
              name: `${item.category} Fabric`,
              quantity: isBlouse ? '1.0 Mtr' : isKurti ? '2.5 Mtrs' : isBottom ? '2.0 Mtrs' : '1 Piece',
              source: 'Self Material',
              receivedStatus: 'Received',
              notes: 'Handed over by customer'
            }
          ],
          referenceImages: [],
          customerInstructions: '',
          tailorInstructions: '',
          specialDesignNotes: ''
        };
      });

      let newBillingItems = [...prev.billing.items];
      if (newBillingItems.length === 0 || newBillingItems.length !== newSpecs.length) {
        newBillingItems = newSpecs.map((spec, i) => {
          const isBlouse = spec.category.toLowerCase().includes('blouse');
          const isKurti = spec.category.toLowerCase().includes('kurti');
          const isBottom = spec.category.toLowerCase().includes('bottom') || spec.category.toLowerCase().includes('pant');
          const isSaree = spec.category.toLowerCase().includes('saree') || spec.category.toLowerCase().includes('fall');

          let defaultRate = 450;
          if (isBlouse) defaultRate = 650;
          else if (isKurti) defaultRate = 550;
          else if (isBottom) defaultRate = 350;
          else if (isSaree) defaultRate = 250;

          const existingItem = prev.billing.items[i];
          if (existingItem) {
            return {
              ...existingItem,
              itemName: spec.title || `${spec.category} ${(i + 1).toString().padStart(2, '0')}`,
            };
          }

          return {
            id: `b-item-${Date.now()}-${i}`,
            itemName: spec.title || `${spec.category} ${(i + 1).toString().padStart(2, '0')}`,
            description: `${spec.garmentType || 'Custom stitching'} - ${spec.sleeveType || 'Standard'}`,
            quantity: 1,
            rate: defaultRate,
            amount: defaultRate
          };
        });
      }

      const orderWithSpecs = {
        ...prev,
        garmentSpecs: newSpecs,
        billing: {
          ...prev.billing,
          items: newBillingItems
        }
      };

      return recalculateBilling(orderWithSpecs);
    });
  };

  const updateMeasurementField = (field: keyof MeasurementRecord, value: number | '' | string) => {
    setOrder(prev => {
      const currentUnit = prev.measurements.unit;
      // Build updated rawMeasurements snapshot for lossless round-trip conversion
      let rawMeasurements = { ...(prev.measurements.rawMeasurements || {}) };
      if (typeof value === 'number' && !isNaN(value)) {
        rawMeasurements[field as string] = { value, unit: currentUnit };
      } else if (value === '') {
        // Clear raw snapshot when field is cleared
        delete rawMeasurements[field as string];
      }
      return {
        ...prev,
        measurements: {
          ...prev.measurements,
          rawMeasurements,
          [field]: value
        }
      };
    });
  };

  const updateCustomMeasurementField = (id: string, value: number | '') => {
    setOrder(prev => {
      const currentUnit = prev.measurements.unit;
      let rawMeasurements = { ...(prev.measurements.rawMeasurements || {}) };
      if (typeof value === 'number' && !isNaN(value)) {
        rawMeasurements[`cf_${id}`] = { value, unit: currentUnit };
      } else if (value === '') {
        delete rawMeasurements[`cf_${id}`];
      }
      return {
        ...prev,
        measurements: {
          ...prev.measurements,
          rawMeasurements,
          customFields: prev.measurements.customFields.map(f => f.id === id ? { ...f, value } : f)
        }
      };
    });
  };

  const addCustomMeasurementField = (code: string, label: string) => {
    if (!label.trim()) return;
    const newField = {
      id: `cf-${Date.now()}`,
      code: code.trim().toUpperCase() || 'CUSTOM',
      label: label.trim(),
      value: '' as const,
      note: 'Configurable custom measurement'
    };
    setOrder(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        customFields: [...prev.measurements.customFields, newField]
      }
    }));
    showToast(`Added measurement field: ${label}`, 'success');
  };
  
  /**
   * FIX 5: LOSSLESS Measurement Unit Switching
   *
   * Strategy:
   *  - On first user entry we capture a snapshot in rawMeasurements[field] = { value, unit }.
   *  - When the UI requests a unit switch we restore every field from its raw snapshot
   *    (converting from the original source unit), never from the current display value.
   *  - This eliminates cumulative rounding: 100 cm → in → cm always returns exactly 100 cm.
   *
   * updateMeasurementField also saves raw snapshot whenever a numeric value is committed.
   */

  // Precise lossless conversion (no quarter-inch rounding)
  const convertLossless = (val: number, fromUnit: 'in' | 'cm', toUnit: 'in' | 'cm'): number => {
    if (fromUnit === toUnit) return val;
    if (toUnit === 'cm') return Math.round(val * 2.54 * 100) / 100; // keep 2 dp
    return Math.round((val / 2.54) * 1000) / 1000; // keep 3 dp precision in inches
  };

  const setMeasurementUnit = (targetUnit: 'in' | 'cm') => {
    setOrder(prev => {
      const currentUnit = prev.measurements.unit;
      if (currentUnit === targetUnit) return prev;

      const m = prev.measurements;
      const rawMap: Record<string, { value: number; unit: 'in' | 'cm' }> = {
        ...(m.rawMeasurements || {})
      };

      // Helper: restore from raw snapshot if available, else convert display value
      const resolveField = (field: string, displayVal: number | ''): number | '' => {
        if (displayVal === '' || typeof displayVal !== 'number' || isNaN(displayVal)) return '';
        const raw = rawMap[field];
        if (raw && typeof raw.value === 'number' && !isNaN(raw.value)) {
          return convertLossless(raw.value, raw.unit, targetUnit);
        }
        // No snapshot: convert display value (first switch from factory default)
        return convertLossless(displayVal, currentUnit, targetUnit);
      };

      const NUMERIC_FIELDS = [
        'shoulder','chest','bust','upperBust','underBust','waist','hip',
        'armhole','sleeveLength','sleeveRound','bicep','elbow','wrist',
        'blouseLength','topLength','frontLength','backLength',
        'frontNeckDepth','backNeckDepth','frontNeckWidth','backNeckWidth',
        'lowerWaist','lowerHip','thigh','knee','calf','ankle',
        'bottomLength','inseam','outseam','crotch'
      ] as const;

      type NumericField = typeof NUMERIC_FIELDS[number];

      const convertedMeas: MeasurementRecord = {
        ...m,
        unit: targetUnit,
        rawMeasurements: rawMap,
        ...(Object.fromEntries(
          NUMERIC_FIELDS.map(f => [f, resolveField(f, m[f as NumericField] as number | '')])
        ) as Pick<MeasurementRecord, NumericField>),
        customFields: m.customFields.map(cf => ({
          ...cf,
          value: cf.value === '' || typeof cf.value !== 'number'
            ? cf.value
            : (() => {
                const raw = rawMap[`cf_${cf.id}`];
                if (raw && typeof raw.value === 'number') {
                  return convertLossless(raw.value, raw.unit, targetUnit);
                }
                return convertLossless(cf.value, currentUnit, targetUnit);
              })()
        }))
      };

      return { ...prev, measurements: convertedMeas };
    });

    showToast(`Switched to ${targetUnit === 'in' ? 'Inches (in)' : 'Centimeters (cm)'} — values restored from original entries`, 'info');
  };

  const toggleMeasurementUnit = () => {
    const nextUnit = order.measurements.unit === 'in' ? 'cm' : 'in';
    setMeasurementUnit(nextUnit);
  };

  // Record WhatsApp notification history log
  const recordNotificationLog = (orderId: string, record: import('../types/order').WhatsAppNotificationRecord) => {
    setSavedOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const history = o.notificationHistory || [];
        return {
          ...o,
          notificationHistory: [record, ...history]
        };
      }
      return o;
    }));

    if (order.id === orderId) {
      setOrder(prev => {
        const history = prev.notificationHistory || [];
        return {
          ...prev,
          notificationHistory: [record, ...history]
        };
      });
    }

    showToast(`WhatsApp update logged for Order #${orderId}`, 'success');
  };

  const updateGarmentSpec = (index: number, fields: Partial<GarmentSpecification>) => {
    setOrder(prev => {
      const copy = [...prev.garmentSpecs];
      if (copy[index]) {
        copy[index] = { ...copy[index], ...fields };
      }
      return {
        ...prev,
        garmentSpecs: copy
      };
    });
  };

  const addGarmentSpec = (category: string = 'Blouse') => {
    setOrder(prev => {
      const nextNum = prev.garmentSpecs.length + 1;
      const newSpec: GarmentSpecification = {
        id: `spec-${Date.now()}-${nextNum}`,
        garmentNumber: nextNum,
        category,
        title: `${category} ${nextNum.toString().padStart(2, '0')}`,
        sleeveType: 'Elbow Length (10.5 in)',
        garmentType: 'Princess Cut (Padded)',
        slit: 'No',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Sweetheart Neck',
        backNeckDesign: 'Deep U Neck with Dori',
        frontHookOrBack: 'Back Hook',
        neckDepthNotes: '',
        fitting: 'M+',
        bottomStyle: 'Salwar (Normal Pleats)',
        regionalStyle: 'Traditional Style',
        materials: [
          {
            id: `mat-${Date.now()}`,
            category: 'Blouse Material',
            name: 'Fabric Handover',
            quantity: '1.0 Mtr',
            source: 'Self Material',
            receivedStatus: 'Received',
            notes: ''
          }
        ],
        referenceImages: [],
        customerInstructions: '',
        tailorInstructions: '',
        specialDesignNotes: ''
      };

      const newSpecs = [...prev.garmentSpecs, newSpec];
      const newBillingItems = [
        ...prev.billing.items,
        {
          id: `b-item-${Date.now()}`,
          itemName: newSpec.title,
          description: `${newSpec.garmentType} tailoring`,
          quantity: 1,
          rate: 550,
          amount: 550
        }
      ];

      return recalculateBilling({
        ...prev,
        garmentSpecs: newSpecs,
        billing: {
          ...prev.billing,
          items: newBillingItems
        }
      });
    });
    showToast(`Added new garment specification card`, 'success');
  };

  const removeGarmentSpec = (index: number) => {
    if (order.garmentSpecs.length <= 1) {
      showToast('At least one garment specification must be preserved', 'warning');
      return;
    }
    setOrder(prev => {
      const newSpecs = prev.garmentSpecs.filter((_, i) => i !== index).map((spec, i) => ({
        ...spec,
        garmentNumber: i + 1
      }));
      const newBillingItems = prev.billing.items.filter((_, i) => i !== index);
      return recalculateBilling({
        ...prev,
        garmentSpecs: newSpecs,
        billing: {
          ...prev.billing,
          items: newBillingItems
        }
      });
    });
    showToast('Garment item removed', 'info');
  };

  const duplicateGarmentSpec = (fromIndex: number, toIndex?: number) => {
    const source = order.garmentSpecs[fromIndex];
    if (!source) return;

    if (toIndex !== undefined && order.garmentSpecs[toIndex]) {
      setOrder(prev => {
        const copy = [...prev.garmentSpecs];
        copy[toIndex] = {
          ...copy[toIndex],
          sleeveType: source.sleeveType,
          garmentType: source.garmentType,
          slit: source.slit,
          zip: source.zip,
          lining: source.lining,
          neckType: source.neckType,
          frontNeckDesign: source.frontNeckDesign,
          backNeckDesign: source.backNeckDesign,
          frontHookOrBack: source.frontHookOrBack,
          fitting: source.fitting,
          bottomStyle: source.bottomStyle,
          customerInstructions: source.customerInstructions,
          tailorInstructions: source.tailorInstructions,
          specialDesignNotes: source.specialDesignNotes
        };
        return { ...prev, garmentSpecs: copy };
      });
      showToast(`Copied design from ${source.title} to Garment #${toIndex + 1}`, 'success');
    } else {
      setOrder(prev => {
        const nextNum = prev.garmentSpecs.length + 1;
        const cloned: GarmentSpecification = {
          ...JSON.parse(JSON.stringify(source)),
          id: `spec-${Date.now()}-${nextNum}`,
          garmentNumber: nextNum,
          title: `${source.category} ${nextNum.toString().padStart(2, '0')} (Duplicate)`
        };
        const newSpecs = [...prev.garmentSpecs, cloned];
        const newBillingItems = [
          ...prev.billing.items,
          {
            id: `b-item-${Date.now()}`,
            itemName: cloned.title,
            description: `${cloned.garmentType} duplicate spec`,
            quantity: 1,
            rate: 650,
            amount: 650
          }
        ];
        return recalculateBilling({
          ...prev,
          garmentSpecs: newSpecs,
          billing: {
            ...prev.billing,
            items: newBillingItems
          }
        });
      });
      showToast(`Duplicated ${source.title} as new garment`, 'success');
    }
  };

  const updateBillingItem = (id: string, fields: Partial<BillingLineItem>) => {
    setOrder(prev => {
      const updatedItems = prev.billing.items.map(item => {
        if (item.id === id) {
          const qty = fields.quantity !== undefined ? fields.quantity : item.quantity;
          const rate = fields.rate !== undefined ? fields.rate : item.rate;
          const amount = fields.amount !== undefined ? fields.amount : qty * rate;
          return {
            ...item,
            ...fields,
            quantity: qty,
            rate,
            amount
          };
        }
        return item;
      });

      return recalculateBilling({
        ...prev,
        billing: {
          ...prev.billing,
          items: updatedItems
        }
      });
    });
  };

  const addBillingItem = () => {
    setOrder(prev => {
      const newItem: BillingLineItem = {
        id: `b-item-${Date.now()}`,
        itemName: 'Additional Custom Work / Fitting',
        description: 'Custom alteration or handwork',
        quantity: 1,
        rate: 200,
        amount: 200
      };
      return recalculateBilling({
        ...prev,
        billing: {
          ...prev.billing,
          items: [...prev.billing.items, newItem]
        }
      });
    });
    showToast('Added custom billing item', 'info');
  };

  const removeBillingItem = (id: string) => {
    setOrder(prev => {
      const filtered = prev.billing.items.filter(item => item.id !== id);
      return recalculateBilling({
        ...prev,
        billing: {
          ...prev.billing,
          items: filtered
        }
      });
    });
  };

  const updateAdditionalCharges = (fields: Partial<AdditionalCharges>) => {
    setOrder(prev => {
      return recalculateBilling({
        ...prev,
        billing: {
          ...prev.billing,
          additionalCharges: {
            ...prev.billing.additionalCharges,
            ...fields
          }
        }
      });
    });
  };

  const updateBillingMeta = (fields: Partial<BillingDetails>) => {
    setOrder(prev => {
      return recalculateBilling({
        ...prev,
        billing: {
          ...prev.billing,
          ...fields
        }
      });
    });
  };

  const updateCuttingStatus = async (
    orderId: string,
    status: CuttingStatus,
    remarks?: string,
    holdReason?: string,
    actualQuantityCut?: number
  ) => {
    let updatedTarget: Order | null = null;
    const now = new Date().toISOString();

    setSavedOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const existingDetails: CuttingOrderDetails = o.cuttingDetails || {
            status: 'NEW',
            materialsCheck: {
              customerMaterial: 'Received',
              shopMaterial: 'Received',
              liningMaterial: 'Received',
              twoByTwoMaterial: 'Not Required',
              otherMaterials: 'Not Required'
            }
          };

          const newDetails: CuttingOrderDetails = {
            ...existingDetails,
            status,
            cuttingRemarks: remarks !== undefined ? remarks : existingDetails.cuttingRemarks,
            holdReason: holdReason !== undefined ? holdReason : existingDetails.holdReason,
            actualQuantityCut: actualQuantityCut !== undefined ? actualQuantityCut : existingDetails.actualQuantityCut,
            startedAt: status === 'IN_CUTTING' && !existingDetails.startedAt ? now : existingDetails.startedAt,
            completedAt: status === 'CUTTING_COMPLETED' ? now : existingDetails.completedAt
          };

          // Also update garmentSpecs if completed
          let updatedGarmentSpecs = o.garmentSpecs;
          if (status === 'CUTTING_COMPLETED') {
            updatedGarmentSpecs = o.garmentSpecs.map(g => ({
              ...g,
              cuttingStatus: 'Completed',
              cuttingCompletedAt: now
            }));
          } else if (status === 'IN_CUTTING' && existingDetails.status === 'NEW') {
            updatedGarmentSpecs = o.garmentSpecs.map(g => ({
              ...g,
              cuttingStatus: g.cuttingStatus === 'Completed' ? 'Completed' : 'In Progress',
              cuttingStartedAt: g.cuttingStartedAt || now
            }));
          } else if (status === 'ON_HOLD') {
            updatedGarmentSpecs = o.garmentSpecs.map(g => ({
              ...g,
              cuttingStatus: g.cuttingStatus === 'Completed' ? 'Completed' : 'On Hold'
            }));
          }

          updatedTarget = {
            ...o,
            status: status as any,
            cuttingDetails: newDetails,
            garmentSpecs: updatedGarmentSpecs,
            updatedAt: now
          };
          return updatedTarget;
        }
        return o;
      });
    });

    if (order.id === orderId && updatedTarget) {
      setOrder(updatedTarget);
    }

    if (updatedTarget && dbStatus?.connected) {
      try {
        await api.saveOrder(updatedTarget);
      } catch (err) {
        console.warn('Sync cutting status to MongoDB failed', err);
      }
    }

    showToast(`Order #${orderId} cutting status: ${status.replace(/_/g, ' ')}`, 'success');
  };

  const updateGarmentCuttingStatus = async (
    orderId: string,
    garmentIndex: number,
    status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold',
    remarks?: string
  ) => {
    let updatedTarget: Order | null = null;
    const now = new Date().toISOString();

    setSavedOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const updatedSpecs = [...o.garmentSpecs];
          if (updatedSpecs[garmentIndex]) {
            updatedSpecs[garmentIndex] = {
              ...updatedSpecs[garmentIndex],
              cuttingStatus: status,
              cuttingRemarks: remarks !== undefined ? remarks : updatedSpecs[garmentIndex].cuttingRemarks,
              cuttingStartedAt: status === 'In Progress' ? (updatedSpecs[garmentIndex].cuttingStartedAt || now) : updatedSpecs[garmentIndex].cuttingStartedAt,
              cuttingCompletedAt: status === 'Completed' ? now : undefined
            };
          }

          const totalItems = updatedSpecs.length;
          const completedCount = updatedSpecs.filter(g => g.cuttingStatus === 'Completed').length;
          const inProgressCount = updatedSpecs.filter(g => g.cuttingStatus === 'In Progress').length;
          const onHoldCount = updatedSpecs.filter(g => g.cuttingStatus === 'On Hold').length;

          let overallStatus: CuttingStatus = o.cuttingDetails?.status || 'NEW';
          if (completedCount === totalItems && totalItems > 0) {
            overallStatus = 'CUTTING_COMPLETED';
          } else if (inProgressCount > 0 || completedCount > 0) {
            overallStatus = 'IN_CUTTING';
          } else if (onHoldCount > 0) {
            overallStatus = 'ON_HOLD';
          }

          const existingDetails = o.cuttingDetails || {
            status: overallStatus,
            materialsCheck: {
              customerMaterial: 'Received',
              shopMaterial: 'Received',
              liningMaterial: 'Received',
              twoByTwoMaterial: 'Not Required',
              otherMaterials: 'Not Required'
            }
          };

          const newDetails: CuttingOrderDetails = {
            ...existingDetails,
            status: overallStatus,
            actualQuantityCut: completedCount,
            startedAt: overallStatus === 'IN_CUTTING' && !existingDetails.startedAt ? now : existingDetails.startedAt,
            completedAt: overallStatus === 'CUTTING_COMPLETED' ? now : undefined
          };

          updatedTarget = {
            ...o,
            status: overallStatus as any,
            cuttingDetails: newDetails,
            garmentSpecs: updatedSpecs,
            updatedAt: now
          };
          return updatedTarget;
        }
        return o;
      });
    });

    if (order.id === orderId && updatedTarget) {
      setOrder(updatedTarget);
    }

    if (updatedTarget && dbStatus?.connected) {
      try {
        await api.saveOrder(updatedTarget);
      } catch (err) {
        console.warn('Sync garment cutting status to MongoDB failed', err);
      }
    }
  };

  const updateMaterialCheck = async (
    orderId: string,
    materialsCheck: CuttingMaterialCheck
  ) => {
    let updatedTarget: Order | null = null;
    const now = new Date().toISOString();

    setSavedOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const existingDetails = o.cuttingDetails || {
            status: (o.status as CuttingStatus) || 'NEW',
            materialsCheck
          };
          const newDetails: CuttingOrderDetails = {
            ...existingDetails,
            materialsCheck
          };
          updatedTarget = {
            ...o,
            cuttingDetails: newDetails,
            updatedAt: now
          };
          return updatedTarget;
        }
        return o;
      });
    });

    if (order.id === orderId && updatedTarget) {
      setOrder(updatedTarget);
    }

    if (updatedTarget && dbStatus?.connected) {
      try {
        await api.saveOrder(updatedTarget);
      } catch (err) {
        console.warn('Sync material check to MongoDB failed', err);
      }
    }
    showToast(`Material checklist updated for Order #${orderId}`, 'info');
  };

  // ==========================================
  // PHASE 2: TAILORS, STITCHING ALLOCATION & WAGES
  // ==========================================

  const addTailor = async (tailorData: Omit<TailorProfile, 'id' | 'createdAt'>) => {
    const nextId = `TLR-${(tailors.length + 1).toString().padStart(3, '0')}`;
    const newTailor: TailorProfile = {
      ...tailorData,
      id: nextId,
      createdAt: new Date().toISOString()
    };
    setTailors(prev => {
      const updated = [...prev, newTailor];
      localStorage.setItem(TAILORS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    showToast(`✓ Master Tailor ${newTailor.name} (${newTailor.specialization}) registered`, 'success');
  };

  const updateTailor = async (id: string, fields: Partial<TailorProfile>) => {
    setTailors(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...fields } : t);
      localStorage.setItem(TAILORS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    showToast('✓ Tailor profile updated', 'info');
  };

  const deleteTailor = async (id: string) => {
    setTailors(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem(TAILORS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    showToast('Tailor profile removed', 'info');
  };

  const allocateMultipleGarmentsToTailor = async (
    orderId: string,
    garmentIndices: number[],
    allocation: { tailorId: string; pieceRate: number; expectedDate?: string; instructions?: string }
  ) => {
    const tailor = tailors.find(t => t.id === allocation.tailorId);
    if (!tailor) return;

    let updatedTarget: Order | null = null;
    const now = new Date().toISOString();

    setSavedOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const updatedSpecs = [...o.garmentSpecs];
          garmentIndices.forEach(idx => {
            if (updatedSpecs[idx]) {
              updatedSpecs[idx] = {
                ...updatedSpecs[idx],
                stitchingDetails: {
                  tailorId: tailor.id,
                  tailorName: tailor.name,
                  specialization: tailor.specialization,
                  pieceRate: allocation.pieceRate,
                  status: 'CUT_PIECES_ALLOCATED',
                  allocatedAt: now,
                  expectedCompletionDate: allocation.expectedDate,
                  instructions: allocation.instructions
                }
              };
            }
          });

          const totalGarments = updatedSpecs.length;
          const allocatedCount = updatedSpecs.filter(g => g.stitchingDetails?.tailorId).length;
          const completedCount = updatedSpecs.filter(g => g.stitchingDetails?.status === 'READY_FOR_QC').length;

          updatedTarget = {
            ...o,
            status: 'IN_STITCHING',
            garmentSpecs: updatedSpecs,
            stitchingDetails: {
              status: 'CUT_PIECES_ALLOCATED',
              totalGarments,
              allocatedGarments: allocatedCount,
              completedGarments: completedCount,
              lastUpdatedAt: now
            },
            updatedAt: now
          };
          return updatedTarget;
        }
        return o;
      });
    });

    if (order.id === orderId && updatedTarget) {
      setOrder(updatedTarget);
    }

    if (updatedTarget && dbStatus?.connected) {
      try {
        await api.saveOrder(updatedTarget);
      } catch (err) {
        console.warn('Sync stitching allocation to MongoDB failed', err);
      }
    }

    showToast(`✓ Allocated ${garmentIndices.length} piece(s) to ${tailor.name}`, 'success');
  };

  const updateGarmentStitchingStatus = async (
    orderId: string,
    garmentIndex: number,
    status: StitchingStatus,
    remarks?: string,
    reworkNotes?: string
  ) => {
    let updatedTarget: Order | null = null;
    let targetOrderSnap: Order | null = null;
    const now = new Date().toISOString();

    setSavedOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          targetOrderSnap = o;
          const updatedSpecs = [...o.garmentSpecs];
          if (updatedSpecs[garmentIndex]) {
            const currentStitching = updatedSpecs[garmentIndex].stitchingDetails || {
              pieceRate: 250,
              status: 'WAITING_FOR_STITCHING'
            };

            const isCompleting = status === 'READY_FOR_QC';

            updatedSpecs[garmentIndex] = {
              ...updatedSpecs[garmentIndex],
              stitchingDetails: {
                ...currentStitching,
                status,
                remarks: remarks !== undefined ? remarks : currentStitching.remarks,
                reworkNotes: reworkNotes !== undefined ? reworkNotes : currentStitching.reworkNotes,
                startedAt: status === 'STITCHING_IN_PROGRESS' && !currentStitching.startedAt ? now : currentStitching.startedAt,
                completedAt: isCompleting ? now : currentStitching.completedAt,
                wageRecorded: isCompleting ? true : currentStitching.wageRecorded
              }
            };
          }

          const totalGarments = updatedSpecs.length;
          const allocatedCount = updatedSpecs.filter(g => g.stitchingDetails?.tailorId).length;
          const completedCount = updatedSpecs.filter(g => g.stitchingDetails?.status === 'READY_FOR_QC').length;

          let overallStatus: StitchingStatus = 'CUT_PIECES_ALLOCATED';
          if (completedCount === totalGarments && totalGarments > 0) {
            overallStatus = 'READY_FOR_QC';
          } else if (updatedSpecs.some(g => g.stitchingDetails?.status === 'STITCHING_IN_PROGRESS')) {
            overallStatus = 'STITCHING_IN_PROGRESS';
          } else if (updatedSpecs.some(g => g.stitchingDetails?.status === 'OVERLOCK_HEMMING_DONE')) {
            overallStatus = 'OVERLOCK_HEMMING_DONE';
          } else if (updatedSpecs.some(g => g.stitchingDetails?.status === 'ON_HOLD')) {
            overallStatus = 'ON_HOLD';
          }

          updatedTarget = {
            ...o,
            status: overallStatus === 'READY_FOR_QC' ? 'READY_FOR_TRIAL' : 'IN_STITCHING',
            garmentSpecs: updatedSpecs,
            stitchingDetails: {
              status: overallStatus,
              totalGarments,
              allocatedGarments: allocatedCount,
              completedGarments: completedCount,
              lastUpdatedAt: now
            },
            updatedAt: now
          };
          return updatedTarget;
        }
        return o;
      });
    });

    if (order.id === orderId && updatedTarget) {
      setOrder(updatedTarget);
    }

    // Auto-record piece rate earnings if READY_FOR_QC
    if (status === 'READY_FOR_QC' && targetOrderSnap) {
      const snap: Order = targetOrderSnap;
      const spec = snap.garmentSpecs[garmentIndex];
      const tailorId = spec?.stitchingDetails?.tailorId || 'TLR-001';
      const tailorName = spec?.stitchingDetails?.tailorName || 'Assigned Tailor';
      const pieceRate = spec?.stitchingDetails?.pieceRate || 250;

      const newWageEntry: TailorWageEntry = {
        id: `WAGE-${orderId}-${garmentIndex}-${Date.now()}`,
        tailorId,
        tailorName,
        orderId,
        serialNumber: snap.serialNumber,
        garmentIndex,
        garmentTitle: spec?.title || `${spec?.category || 'Garment'} 0${garmentIndex + 1}`,
        garmentCategory: spec?.category || 'Custom Garment',
        completedAt: now,
        pieceRate,
        paymentStatus: 'Pending'
      };

      setWageEntries(prev => {
        const exists = prev.some(e => e.orderId === orderId && e.garmentIndex === garmentIndex);
        if (exists) return prev;
        const next = [...prev, newWageEntry];
        localStorage.setItem(WAGES_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }

    if (updatedTarget && dbStatus?.connected) {
      try {
        await api.saveOrder(updatedTarget);
      } catch (err) {
        console.warn('Sync stitching status to MongoDB failed', err);
      }
    }

    showToast(`Piece #${garmentIndex + 1} status: ${status.replace(/_/g, ' ')}`, 'success');
  };

  const recordTailorPayment = async (paymentData: Omit<TailorPaymentRecord, 'id'>) => {
    const newRecord: TailorPaymentRecord = {
      ...paymentData,
      id: `PAY-${Date.now()}`
    };

    setPaymentRecords(prev => {
      const updated = [...prev, newRecord];
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setWageEntries(prev => {
      const updated = prev.map(entry => {
        if (paymentData.wageEntryIds.includes(entry.id) || entry.tailorId === paymentData.tailorId) {
          return {
            ...entry,
            paymentStatus: 'Paid' as const,
            paymentDate: paymentData.paymentDate,
            paymentMethod: paymentData.paymentMethod
          };
        }
        return entry;
      });
      localStorage.setItem(WAGES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    showToast(`✓ Settled ₹${paymentData.amountPaid} to ${paymentData.tailorName}`, 'success');
  };

  const getTailorWageSummary = (): TailorWageSummary[] => {
    return tailors.map(tailor => {
      const tailorWages = wageEntries.filter(w => w.tailorId === tailor.id);
      const pendingEntries = tailorWages.filter(w => w.paymentStatus === 'Pending');
      const completedEntries = tailorWages;
      const completedCount = tailorWages.length;
      const totalEarnings = tailorWages.reduce((sum, w) => sum + w.pieceRate, 0);

      const tailorPayments = paymentRecords.filter(p => p.tailorId === tailor.id);
      const totalPaid = tailorPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      const balanceDue = Math.max(0, totalEarnings - totalPaid);

      return {
        tailorId: tailor.id,
        tailorName: tailor.name,
        specialization: tailor.specialization,
        phone: tailor.phone,
        completedCount,
        totalEarnings,
        totalPaid,
        balanceDue,
        pendingEntries,
        completedEntries
      };
    });
  };

  const updateQCStatus = async (
    orderId: string,
    garmentIndex: number,
    qcRecord: QCInspectionRecord,
    orderRemarks?: string
  ) => {
    let targetOrder: Order | null = null;
    const now = new Date().toISOString();

    setSavedOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const updatedSpecs = [...o.garmentSpecs];
          if (updatedSpecs[garmentIndex]) {
            updatedSpecs[garmentIndex] = {
              ...updatedSpecs[garmentIndex],
              qcDetails: qcRecord
            };
          }

          // Check overall QC pass status
          const total = updatedSpecs.length;
          const passed = updatedSpecs.filter(g => g.qcDetails?.status === 'PASSED').length;
          const rework = updatedSpecs.filter(g => g.qcDetails?.status === 'REWORK_REQUIRED').length;

          let newOrderStatus = o.status;
          let overallQCStatus: 'PENDING' | 'PASSED' | 'REWORK_REQUIRED' = 'PENDING';

          if (passed === total && total > 0) {
            overallQCStatus = 'PASSED';
            newOrderStatus = 'READY_FOR_DISPATCH';
          } else if (rework > 0) {
            overallQCStatus = 'REWORK_REQUIRED';
            if (qcRecord.reworkDepartment === 'Cutting') {
              newOrderStatus = 'IN_CUTTING';
            } else {
              newOrderStatus = 'IN_STITCHING';
            }
          } else {
            overallQCStatus = 'PENDING';
            newOrderStatus = 'IN_QC';
          }

          const updatedOrder: Order = {
            ...o,
            status: newOrderStatus,
            updatedAt: now,
            garmentSpecs: updatedSpecs,
            qcDetails: {
              status: overallQCStatus,
              totalGarments: total,
              passedGarments: passed,
              reworkGarments: rework,
              lastInspectedAt: now,
              inspectorName: qcRecord.inspectorName,
              qcRemarks: orderRemarks || qcRecord.notes || (rework > 0 ? `Rework requested for ${updatedSpecs[garmentIndex]?.title}` : 'All garments inspected')
            }
          };
          targetOrder = updatedOrder;
          return updatedOrder;
        }
        return o;
      });
    });

    if (order.id === orderId && targetOrder) {
      setOrder(targetOrder);
    }
    if (selectedDetailOrder?.id === orderId && targetOrder) {
      setSelectedDetailOrder(targetOrder);
    }

    if (targetOrder && dbStatus?.connected) {
      try {
        await api.saveOrder(targetOrder);
      } catch (e) {
        console.error('Failed saving QC status to database', e);
      }
    }

    if (qcRecord.status === 'PASSED') {
      showToast(`✓ Garment #${garmentIndex + 1} passed Quality Inspection`, 'success');
    } else {
      showToast(`⚠ Garment #${garmentIndex + 1} flagged for rework (${qcRecord.reworkDepartment || 'Workshop'})`, 'warning');
    }
  };

  const recordDispatch = async (orderId: string, dispatchRecord: DispatchRecord) => {
    let targetOrder: Order | null = null;
    const now = new Date().toISOString();

    setSavedOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const collected = Number(dispatchRecord.collectedBalance) || 0;
          const finalBalance = Math.max(0, o.billing.balanceAmount - collected);
          const updatedBilling = {
            ...o.billing,
            balanceAmount: finalBalance,
            amountPaid: o.billing.amountPaid + collected,
            paymentStatus: finalBalance === 0 ? ('PAID' as const) : o.billing.paymentStatus
          };

          const updatedOrder: Order = {
            ...o,
            status: dispatchRecord.isDelivered ? 'DELIVERED' : 'READY_FOR_DISPATCH',
            updatedAt: now,
            billing: updatedBilling,
            dispatchDetails: {
              ...dispatchRecord,
              dispatchedAt: dispatchRecord.dispatchedAt || now
            }
          };
          targetOrder = updatedOrder;
          return updatedOrder;
        }
        return o;
      });
    });

    if (order.id === orderId && targetOrder) {
      setOrder(targetOrder);
    }
    if (selectedDetailOrder?.id === orderId && targetOrder) {
      setSelectedDetailOrder(targetOrder);
    }

    if (targetOrder && dbStatus?.connected) {
      try {
        await api.saveOrder(targetOrder);
      } catch (e) {
        console.error('Failed saving dispatch record to database', e);
      }
    }

    showToast(
      dispatchRecord.isDelivered
        ? `✓ Order #${orderId} Handover Complete (DELIVERED)!`
        : `✓ Order #${orderId} staged for pickup/dispatch`,
      'success'
    );
  };

  const recordCapacityOverride = async (orderId: string, overrideRecord: CapacityOverrideRecord) => {
    let targetOrder: Order | null = null;
    setSavedOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const updated = {
            ...o,
            capacityOverride: overrideRecord,
            updatedAt: new Date().toISOString()
          };
          targetOrder = updated;
          return updated;
        }
        return o;
      });
    });

    if (order.id === orderId && targetOrder) {
      setOrder(targetOrder);
    }

    if (targetOrder && dbStatus?.connected) {
      try {
        await api.saveOrder(targetOrder);
      } catch (e) {
        console.error('Failed saving capacity override to database', e);
      }
    }

    showToast(`✓ Capacity override authorized by ${overrideRecord.authorizedBy}`, 'info');
  };

  const loadDemoData = () => {
    setSavedOrders(SAMPLE_ORDERS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
    setTailors(INITIAL_TAILORS);
    localStorage.setItem(TAILORS_STORAGE_KEY, JSON.stringify(INITIAL_TAILORS));
    showToast('✓ Rich demonstration orders and master tailors restored', 'success');
  };

  return (
    <OrderContext.Provider
      value={{
        order,
        savedOrders,
        currentStep,
        toastMessage,
        dbStatus,
        isSyncing,
        activeModule,
        selectedCuttingOrderId,
        selectedDetailOrder,
        setActiveModule,
        setSelectedCuttingOrderId,
        setSelectedDetailOrder,
        loadDemoData,
        setCurrentStep,
        nextStep,
        prevStep,
        saveDraft,
        submitOrder,
        createNewOrder,
        clearOrder,
        loadOrder,
        deleteOrder,
        updateCustomer,
        searchCustomers,
        selectCustomerFromHistory,
        updateGarmentQuantity,
        addCustomGarmentCategory,
        updateMeasurementField,
        updateCustomMeasurementField,
        addCustomMeasurementField,
        toggleMeasurementUnit,
        setMeasurementUnit,
        recordNotificationLog,
        whatsAppModalOrder,
        whatsAppDefaultTemplate,
        openWhatsAppModal,
        closeWhatsAppModal,
        syncStatus,
        isSidebarCollapsed,
        toggleSidebarCollapse,
        defaultWorkshopUnit,
        setDefaultWorkshopUnit,
        abbreviationCodes,
        updateAbbreviationCode,
        updateGarmentSpec,
        addGarmentSpec,
        removeGarmentSpec,
        duplicateGarmentSpec,
        updateBillingItem,
        addBillingItem,
        removeBillingItem,
        updateAdditionalCharges,
        updateBillingMeta,
        showToast,
        syncGarmentSpecsFromQuantities,
        syncToMongoDB,
        checkDbHealth,
        updateCuttingStatus,
        updateGarmentCuttingStatus,
        updateMaterialCheck,

        // Stitching & Tailors
        tailors,
        wageEntries,
        paymentRecords,
        addTailor,
        updateTailor,
        deleteTailor,
        allocateMultipleGarmentsToTailor,
        updateGarmentStitchingStatus,
        recordTailorPayment,
        getTailorWageSummary,

        // QC, Dispatch & Capacity Overrides
        updateQCStatus,
        recordDispatch,
        recordCapacityOverride
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
