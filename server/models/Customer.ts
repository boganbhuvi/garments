import mongoose, { Schema, Document } from 'mongoose';

export interface CustomerHistoryEntry {
  action: 'CREATED' | 'UPDATED' | 'ARCHIVED';
  timestamp: Date;
  note?: string;
}

export interface CustomerDocument extends Document {
  customerId: string;
  customerName: string;
  relationshipType: 'W/O' | 'D/O' | 'S/O' | 'None';
  husbandName: string;
  fatherName: string;
  primaryPhone: string;
  secondaryPhone: string;
  additionalPhones: string[];
  doorNo: string;
  street: string;
  areaLocation: string;
  city: string;
  state: string;
  pinCode: string;
  fullAddress: string;
  isArchived: boolean;
  history: CustomerHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerHistorySchema = new Schema<CustomerHistoryEntry>(
  {
    action: { type: String, enum: ['CREATED', 'UPDATED', 'ARCHIVED'], required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const CustomerSchema = new Schema<CustomerDocument>(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, index: true },
    relationshipType: { type: String, enum: ['W/O', 'D/O', 'S/O', 'None'], default: 'None' },
    husbandName: { type: String, default: '' },
    fatherName: { type: String, default: '' },
    primaryPhone: { type: String, required: true, index: true },
    secondaryPhone: { type: String, default: '' },
    additionalPhones: { type: [String], default: [] },
    doorNo: { type: String, default: '' },
    street: { type: String, default: '' },
    areaLocation: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pinCode: { type: String, default: '' },
    fullAddress: { type: String, default: '' },
    isArchived: { type: Boolean, default: false, index: true },
    history: { type: [CustomerHistorySchema], default: [] },
  },
  {
    timestamps: true,
    collection: 'customers',
  }
);

export const CustomerModel = mongoose.model<CustomerDocument>('Customer', CustomerSchema);
