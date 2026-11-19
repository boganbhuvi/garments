export type RelationshipType = 'D/O' | 'W/O';

export interface GarmentQuantityItem {
  id: string;
  category: string;
  label: string;
  quantity: number;
  isCustom?: boolean;
}

export interface CustomerDetails {
  customerId: string;
  billNumber: string;
  date: string;
  customerName: string;
  relationshipType: RelationshipType;
  fatherName: string;
  husbandName: string;
  primaryPhone: string;
  secondaryPhone: string;
  additionalPhones?: string[]; // Up to 3 additional contact numbers (5 total)
  fullAddress: string;
  areaLocation: string;
  doorNo?: string;
  street?: string;
  city?: string;
  district?: string;
  state?: string;
  pinCode?: string;
}

export interface WhatsAppNotificationRecord {
  id: string;
  templateType: string;
  sentAt: string;
  recipientPhone: string;
  messageText: string;
  channel: 'WHATSAPP_WEB' | 'WHATSAPP_API';
  status: 'OPENED' | 'SENT';
}

export interface MeasurementRecord {
  id: string;
  name: string;
  unit: 'in' | 'cm';
  date: string;
  // Upper Body
  shoulder: number | ''; // SH
  chest: number | '';
  bust: number | '';
  upperBust: number | '';
  underBust: number | '';
  waist: number | '';
  hip: number | '';
  armhole: number | ''; // AH
  sleeveLength: number | ''; // SL
  sleeveRound: number | '';
  bicep: number | '';
  elbow: number | '';
  wrist: number | '';
  blouseLength: number | ''; // BH / L
  topLength: number | '';
  frontLength: number | '';
  backLength: number | '';
  // Neck
  frontNeckDepth: number | ''; // FNN
  backNeckDepth: number | ''; // BN
  frontNeckWidth: number | '';
  backNeckWidth: number | '';
  // Lower Body
  lowerWaist: number | '';
  lowerHip: number | '';
  thigh: number | '';
  knee: number | '';
  calf: number | '';
  ankle: number | '';
  bottomLength: number | '';
  inseam: number | '';
  outseam: number | '';
  crotch: number | '';
  // Custom configurable measurements
  customFields: { id: string; code: string; label: string; value: number | ''; note?: string }[];
  // Lossless raw measurements ledger (preserves exact source value & unit)
  rawMeasurements?: Record<string, { value: number; unit: 'in' | 'cm' }>;
  notes: string;
}

export type MaterialSource = 'Self Material' | 'Shop Material' | 'To Be Purchased' | 'Pending';

export interface MaterialItem {
  id: string;
  category: 'Top Material' | 'Bottom Material' | 'Blouse Material' | 'Lining Material' | 'Two-by-Two Material' | 'Additional Material' | 'Others';
  name: string;
  quantity: string; // e.g. "1.25 Mtrs"
  source: MaterialSource;
  receivedStatus: 'Received' | 'Pending' | 'In Stock';
  notes: string;
}

export interface GarmentSpecification {
  id: string;
  garmentNumber: number; // e.g. 1
  category: string; // Blouse, Kurti, Bottom, Saree, etc.
  title: string; // "Blouse 01: Tamil Bridal Traditional Silk"
  
  // Design details
  sleeveType: string; // Mega Sleeve, 1/4 Sleeve, 3/4 Sleeve, Full Sleeve, Custom
  garmentType: string; // SH Top, J Top, Long Top, FH, SKT Top, Skirt Top, Princess Cut, Custom
  slit: 'Yes' | 'No' | 'N/A';
  zip: 'Yes' | 'No' | 'Side Zip' | 'Back Zip';
  lining: 'Yes' | 'No' | 'Double';
  neckType: 'New Neck' | 'Design' | 'Standard';
  frontNeckDesign: string;
  backNeckDesign: string;
  frontHookOrBack: 'Front Hook' | 'Back Hook' | 'Side Hook' | 'Side Zip' | 'Elastic';
  neckDepthNotes: string;
  fitting: 'Tight' | 'M+' | 'Medium' | 'Loose Fit';
  bottomStyle: string;
  regionalStyle: string; // e.g. "Tamil Bridal with Aari Work"
  
  // Materials list for this garment
  materials: MaterialItem[];
  
  // Images
  referenceImages: { id: string; url: string; title: string; notes: string }[];
  
  // Instructions
  customerInstructions: string;
  tailorInstructions: string;
  specialDesignNotes: string;

  // Cutting Department tracking
  cuttingStatus?: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  cuttingStartedAt?: string;
  cuttingCompletedAt?: string;
  cuttingRemarks?: string;

  // Stitching Department tracking
  stitchingDetails?: import('./stitching').GarmentStitchingDetails;

  // Quality Control tracking
  qcDetails?: QCInspectionRecord;
}

export type QCStatus = 'PENDING' | 'PASSED' | 'REWORK_REQUIRED';

export interface QCInspectionRecord {
  inspectorName: string;
  inspectedAt: string;
  status: QCStatus;
  measurementsVerified: boolean;
  measurementToleranceMm: number; // Configurable tolerance e.g. within 6mm (0.25 inch)
  stitchingQualityPassed: boolean;
  designMatchesSpec: boolean;
  fittingPassed: boolean;
  finishingPassed: boolean;
  notes?: string;
  reworkDepartment?: 'Cutting' | 'Stitching';
  reworkInstructions?: string;
}

export interface DispatchRecord {
  dispatchedAt?: string;
  deliveredAt?: string;
  handedOverTo?: string;
  recipientPhone?: string;
  collectedBalance?: number;
  paymentMethod?: string;
  customerSignature?: string;
  dispatchNotes?: string;
  isDelivered: boolean;
}

export interface BillingLineItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface AdditionalCharges {
  stitchingCharges: number;
  materialCharges: number;
  designCharges: number;
  otherCharges: number;
  discount: number;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';
export type OrderPriority = 'Normal' | 'Urgent' | 'Express';
export type OrderStatus = 
  | 'NEW' 
  | 'READY_FOR_CUTTING' 
  | 'IN_CUTTING' 
  | 'CUTTING_COMPLETED' 
  | 'IN_STITCHING' 
  | 'READY_FOR_QC' 
  | 'IN_QC' 
  | 'READY_FOR_DISPATCH' 
  | 'READY_FOR_TRIAL'
  | 'COMPLETED' 
  | 'DELIVERED' 
  | 'ON_HOLD';

export type CuttingStatus = 'NEW' | 'READY_FOR_CUTTING' | 'IN_CUTTING' | 'CUTTING_COMPLETED' | 'ON_HOLD';
export type MaterialCheckStatus = 'Received' | 'Pending' | 'Not Required';

export interface CuttingMaterialCheck {
  customerMaterial: MaterialCheckStatus;
  shopMaterial: MaterialCheckStatus;
  liningMaterial: MaterialCheckStatus;
  twoByTwoMaterial: MaterialCheckStatus;
  otherMaterials: MaterialCheckStatus;
  remarks?: string;
}

export interface CuttingOrderDetails {
  status: CuttingStatus;
  startedAt?: string;
  completedAt?: string;
  actualQuantityCut?: number;
  cuttingRemarks?: string;
  holdReason?: string;
  assignedMaster?: string;
  materialsCheck: CuttingMaterialCheck;
}

export interface BillingDetails {
  items: BillingLineItem[];
  additionalCharges: AdditionalCharges;
  subtotal: number;
  grandTotal: number;
  advanceAmount: number;
  amountPaid: number;
  balanceAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  
  // Delivery & Priority
  orderDate: string;
  dueDate: string;
  priority: OrderPriority;
  prioritySurcharge?: number; // Snapshot of additional priority fee
  priorityTurnaroundDays?: number;
  prioritySnapshot?: import('../utils/priorityConfig').PrioritySnapshot;
  deliveryNotes: string;
  
  // Referral
  referralId: string;
  referredBy: string;
  referralNotes: string;
}

export interface Order {
  id: string; // Unique order reference e.g. GG-2025-0842
  serialNumber: string; // SR-094
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  customer: CustomerDetails;
  garmentQuantities: GarmentQuantityItem[];
  measurements: MeasurementRecord;
  garmentSpecs: GarmentSpecification[];
  billing: BillingDetails;
  cuttingDetails?: CuttingOrderDetails;
  stitchingDetails?: {
    status: import('./stitching').StitchingStatus;
    totalGarments: number;
    allocatedGarments: number;
    completedGarments: number;
    lastUpdatedAt?: string;
    stitchingRemarks?: string;
    holdReason?: string;
  };
  qcDetails?: {
    status: QCStatus;
    totalGarments: number;
    passedGarments: number;
    reworkGarments: number;
    lastInspectedAt?: string;
    inspectorName?: string;
    qcRemarks?: string;
  };
  dispatchDetails?: DispatchRecord;
  capacityOverride?: import('../utils/capacityEngine').CapacityOverrideRecord;
  notificationHistory?: WhatsAppNotificationRecord[];
}
