import mongoose, { Schema, Document } from 'mongoose';

export interface PaymentDocument extends Document {
  paymentId: string;
  orderId: string;
  customerId: string;
  amount: number;
  paymentType: 'ADVANCE' | 'PARTIAL' | 'FINAL' | 'REFUND';
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  transactionReference: string;
  paymentDate: Date;
  paymentStatus: 'VERIFIED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  receivedBy: string;
  branchId: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    paymentType: { type: String, enum: ['ADVANCE', 'PARTIAL', 'FINAL', 'REFUND'], default: 'PARTIAL' },
    paymentMethod: { type: String, enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'], default: 'CASH' },
    transactionReference: { type: String, default: '' },
    paymentDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['VERIFIED', 'PENDING', 'FAILED', 'REFUNDED'], default: 'VERIFIED' },
    receivedBy: { type: String, default: 'STAFF' },
    branchId: { type: String, default: 'BR-001', index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true, collection: 'payments' }
);

export const PaymentModel = mongoose.model<PaymentDocument>('Payment', PaymentSchema);
