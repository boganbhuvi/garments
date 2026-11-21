import mongoose, { Schema, Document } from 'mongoose';

export interface InventoryItemDocument extends Document {
  itemId: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minStock: number;
  branchId: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovementDocument extends Document {
  movementId: string;
  itemId: string;
  itemName: string;
  type: 'RECEIVED' | 'ISSUED' | 'ADJUSTMENT';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  branchId: string;
  recordedBy: string;
  note: string;
  createdAt: Date;
}

const InventoryItemSchema = new Schema<InventoryItemDocument>(
  {
    itemId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    minStock: { type: Number, default: 10, min: 0 },
    branchId: { type: String, default: 'BR-001', index: true },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'inventory_items' }
);

const StockMovementSchema = new Schema<StockMovementDocument>(
  {
    movementId: { type: String, required: true, unique: true, index: true },
    itemId: { type: String, required: true, index: true },
    itemName: { type: String, required: true },
    type: { type: String, enum: ['RECEIVED', 'ISSUED', 'ADJUSTMENT'], required: true },
    quantity: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    branchId: { type: String, default: 'BR-001', index: true },
    recordedBy: { type: String, default: 'SYSTEM' },
    note: { type: String, default: '' },
  },
  { timestamps: true, collection: 'stock_movements' }
);

export const InventoryItemModel = mongoose.model<InventoryItemDocument>('InventoryItem', InventoryItemSchema);
export const StockMovementModel = mongoose.model<StockMovementDocument>('StockMovement', StockMovementSchema);
