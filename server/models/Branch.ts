import mongoose, { Schema, Document } from 'mongoose';

export interface BranchDocument extends Document {
  branchId: string;
  name: string;
  address: string;
  phone: string;
  managerName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PLANNED';
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<BranchDocument>(
  {
    branchId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    managerName: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'PLANNED'], default: 'ACTIVE', index: true },
  },
  { timestamps: true, collection: 'branches' }
);

export const BranchModel = mongoose.model<BranchDocument>('Branch', BranchSchema);
