import mongoose, { Schema, Document } from 'mongoose';

export interface ITailorDoc extends Document {
  id: string; // TLR-001
  name: string;
  phone: string;
  specialization: string;
  experienceYears: number;
  defaultPieceRate: number;
  availability: 'Available' | 'Busy' | 'On Leave';
  active: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TailorSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    specialization: { type: String, required: true },
    experienceYears: { type: Number, default: 5 },
    defaultPieceRate: { type: Number, default: 250 },
    availability: { type: String, enum: ['Available', 'Busy', 'On Leave'], default: 'Available' },
    active: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const TailorModel = mongoose.model<ITailorDoc>('Tailor', TailorSchema);
