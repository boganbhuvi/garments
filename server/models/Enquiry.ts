import mongoose, { Schema, Document } from 'mongoose';

export interface EnquiryDocument extends Document {
  enquiryId: string;
  type: 'BULK' | 'CONTACT' | 'TAILORING';
  name: string;
  organization: string;
  phone: string;
  email: string;
  estimatedQuantity: string;
  message: string;
  status: 'NEW' | 'IN_REVIEW' | 'RESPONDED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<EnquiryDocument>(
  {
    enquiryId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['BULK', 'CONTACT', 'TAILORING'], default: 'CONTACT', index: true },
    name: { type: String, required: true },
    organization: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    estimatedQuantity: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['NEW', 'IN_REVIEW', 'RESPONDED', 'CLOSED'], default: 'NEW', index: true },
  },
  { timestamps: true, collection: 'enquiries' }
);

export const EnquiryModel = mongoose.model<EnquiryDocument>('Enquiry', EnquirySchema);
