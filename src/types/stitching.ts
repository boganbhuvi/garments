export type TailorSpecialization =
  | 'Blouse Specialist'
  | 'Kurti Specialist'
  | 'Churidar Specialist'
  | 'Salwar Specialist'
  | 'Saree / Falls'
  | 'General Tailoring'
  | 'Other';

export interface TailorProfile {
  id: string; // e.g. "TLR-001"
  name: string; // e.g. "Murugan M"
  phone: string; // e.g. "98401 54321"
  specialization: TailorSpecialization;
  experienceYears: number;
  defaultPieceRate: number; // e.g. 250
  availability: 'Available' | 'Busy' | 'On Leave';
  active: boolean;
  notes?: string;
  createdAt: string;
}

export type StitchingStatus =
  | 'WAITING_FOR_STITCHING'
  | 'CUT_PIECES_ALLOCATED'
  | 'STITCHING_IN_PROGRESS'
  | 'OVERLOCK_HEMMING_DONE'
  | 'READY_FOR_QC'
  | 'ON_HOLD';

export interface GarmentStitchingDetails {
  tailorId?: string;
  tailorName?: string;
  specialization?: string;
  pieceRate: number;
  status: StitchingStatus;
  allocatedAt?: string;
  expectedCompletionDate?: string;
  startedAt?: string;
  completedAt?: string;
  instructions?: string;
  remarks?: string;
  issues?: string;
  reworkNotes?: string;
  wageRecorded?: boolean;
}

export interface TailorWageEntry {
  id: string;
  tailorId: string;
  tailorName: string;
  orderId: string;
  serialNumber: string;
  garmentIndex: number;
  garmentTitle: string;
  garmentCategory: string;
  completedAt: string;
  pieceRate: number;
  paymentStatus: 'Pending' | 'Paid';
  paymentDate?: string;
  paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer';
  paymentReference?: string;
}

export interface TailorPaymentRecord {
  id: string;
  tailorId: string;
  tailorName: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
  notes?: string;
  wageEntryIds: string[];
}

export interface TailorWageSummary {
  tailorId: string;
  tailorName: string;
  specialization: string;
  phone: string;
  completedCount: number;
  totalEarnings: number;
  totalPaid: number;
  balanceDue: number;
  pendingEntries: TailorWageEntry[];
  completedEntries: TailorWageEntry[];
}
