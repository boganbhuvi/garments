import mongoose, { Schema, Document } from 'mongoose';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'BRANCH_MANAGER'
  | 'FRONT_DESK'
  | 'CUTTING'
  | 'STITCHING'
  | 'QC'
  | 'DISPATCH'
  | 'ACCOUNTS'
  | 'INVENTORY'
  | 'CUSTOMER';

export interface UserDocument extends Document {
  userId: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  branchIds: string[];
  customerId?: string;
  isActive: boolean;
  tokenVersion: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '', index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'SUPER_ADMIN',
        'OWNER',
        'BRANCH_MANAGER',
        'FRONT_DESK',
        'CUTTING',
        'STITCHING',
        'QC',
        'DISPATCH',
        'ACCOUNTS',
        'INVENTORY',
        'CUSTOMER',
      ],
      required: true,
      index: true,
    },
    branchIds: { type: [String], default: ['BR-001'] },
    customerId: { type: String, default: '', index: true },
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
