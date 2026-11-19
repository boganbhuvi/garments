import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderDoc extends Document {
  id: string; // Order reference e.g. GG-2025-0842
  serialNumber: string;
  status: 'NEW' | 'READY_FOR_CUTTING' | 'IN_CUTTING' | 'CUTTING_COMPLETED' | 'IN_STITCHING' | 'READY_FOR_QC' | 'IN_QC' | 'READY_FOR_DISPATCH' | 'READY_FOR_TRIAL' | 'COMPLETED' | 'DELIVERED' | 'ON_HOLD';
  currentStep: number;
  customer: {
    customerId: string;
    billNumber: string;
    date: string;
    customerName: string;
    relationshipType: 'D/O' | 'W/O';
    fatherName: string;
    husbandName: string;
    primaryPhone: string;
    secondaryPhone: string;
    fullAddress: string;
    areaLocation: string;
  };
  garmentQuantities: {
    id: string;
    category: string;
    label: string;
    quantity: number;
    isCustom?: boolean;
  }[];
  measurements: {
    id: string;
    name: string;
    unit: 'in' | 'cm';
    date: string;
    shoulder: number | '';
    chest: number | '';
    bust: number | '';
    upperBust: number | '';
    underBust: number | '';
    waist: number | '';
    hip: number | '';
    armhole: number | '';
    sleeveLength: number | '';
    sleeveRound: number | '';
    bicep: number | '';
    elbow: number | '';
    wrist: number | '';
    blouseLength: number | '';
    topLength: number | '';
    frontLength: number | '';
    backLength: number | '';
    frontNeckDepth: number | '';
    backNeckDepth: number | '';
    frontNeckWidth: number | '';
    backNeckWidth: number | '';
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
    customFields: { id: string; code: string; label: string; value: number | ''; note?: string }[];
    notes: string;
  };
  garmentSpecs: {
    id: string;
    garmentNumber: number;
    category: string;
    title: string;
    sleeveType: string;
    garmentType: string;
    slit: string;
    zip: string;
    lining: string;
    neckType: string;
    frontNeckDesign: string;
    backNeckDesign: string;
    frontHookOrBack: string;
    neckDepthNotes: string;
    fitting: string;
    bottomStyle: string;
    regionalStyle: string;
    materials: {
      id: string;
      category: string;
      name: string;
      quantity: string;
      source: string;
      receivedStatus: string;
      notes: string;
    }[];
    referenceImages: { id: string; url: string; title: string; notes: string }[];
    customerInstructions: string;
    tailorInstructions: string;
    specialDesignNotes: string;
  }[];
  billing: {
    items: {
      id: string;
      itemName: string;
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }[];
    additionalCharges: {
      stitchingCharges: number;
      materialCharges: number;
      designCharges: number;
      otherCharges: number;
      discount: number;
    };
    subtotal: number;
    grandTotal: number;
    advanceAmount: number;
    amountPaid: number;
    balanceAmount: number;
    paymentMethod: string;
    paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
    orderDate: string;
    dueDate: string;
    priority: 'Normal' | 'Urgent' | 'Express';
    deliveryNotes: string;
    referralId: string;
    referredBy: string;
    referralNotes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    serialNumber: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['NEW', 'READY_FOR_CUTTING', 'IN_CUTTING', 'CUTTING_COMPLETED', 'ON_HOLD', 'IN_STITCHING', 'READY_FOR_QC', 'IN_QC', 'READY_FOR_DISPATCH', 'READY_FOR_TRIAL', 'COMPLETED', 'DELIVERED'],
      default: 'NEW',
      index: true,
    },
    cuttingDetails: { type: Schema.Types.Mixed, default: null },
    currentStep: { type: Number, default: 1 },
    customer: {
      customerId: { type: String, required: true, index: true },
      billNumber: { type: String, required: true },
      date: { type: String, required: true },
      customerName: { type: String, required: true, index: true },
      relationshipType: { type: String, enum: ['D/O', 'W/O'], default: 'D/O' },
      fatherName: { type: String, default: '' },
      husbandName: { type: String, default: '' },
      primaryPhone: { type: String, required: true, index: true },
      secondaryPhone: { type: String, default: '' },
      fullAddress: { type: String, required: true },
      areaLocation: { type: String, default: '' },
    },
    garmentQuantities: [
      {
        id: { type: String, required: true },
        category: { type: String, required: true },
        label: { type: String, required: true },
        quantity: { type: Number, default: 0 },
        isCustom: { type: Boolean, default: false },
      },
    ],
    measurements: {
      id: { type: String },
      name: { type: String },
      unit: { type: String, enum: ['in', 'cm'], default: 'in' },
      date: { type: String },
      shoulder: { type: Schema.Types.Mixed, default: '' },
      chest: { type: Schema.Types.Mixed, default: '' },
      bust: { type: Schema.Types.Mixed, default: '' },
      upperBust: { type: Schema.Types.Mixed, default: '' },
      underBust: { type: Schema.Types.Mixed, default: '' },
      waist: { type: Schema.Types.Mixed, default: '' },
      hip: { type: Schema.Types.Mixed, default: '' },
      armhole: { type: Schema.Types.Mixed, default: '' },
      sleeveLength: { type: Schema.Types.Mixed, default: '' },
      sleeveRound: { type: Schema.Types.Mixed, default: '' },
      bicep: { type: Schema.Types.Mixed, default: '' },
      elbow: { type: Schema.Types.Mixed, default: '' },
      wrist: { type: Schema.Types.Mixed, default: '' },
      blouseLength: { type: Schema.Types.Mixed, default: '' },
      topLength: { type: Schema.Types.Mixed, default: '' },
      frontLength: { type: Schema.Types.Mixed, default: '' },
      backLength: { type: Schema.Types.Mixed, default: '' },
      frontNeckDepth: { type: Schema.Types.Mixed, default: '' },
      backNeckDepth: { type: Schema.Types.Mixed, default: '' },
      frontNeckWidth: { type: Schema.Types.Mixed, default: '' },
      backNeckWidth: { type: Schema.Types.Mixed, default: '' },
      lowerWaist: { type: Schema.Types.Mixed, default: '' },
      lowerHip: { type: Schema.Types.Mixed, default: '' },
      thigh: { type: Schema.Types.Mixed, default: '' },
      knee: { type: Schema.Types.Mixed, default: '' },
      calf: { type: Schema.Types.Mixed, default: '' },
      ankle: { type: Schema.Types.Mixed, default: '' },
      bottomLength: { type: Schema.Types.Mixed, default: '' },
      inseam: { type: Schema.Types.Mixed, default: '' },
      outseam: { type: Schema.Types.Mixed, default: '' },
      crotch: { type: Schema.Types.Mixed, default: '' },
      customFields: [
        {
          id: { type: String },
          code: { type: String },
          label: { type: String },
          value: { type: Schema.Types.Mixed, default: '' },
          note: { type: String },
        },
      ],
      notes: { type: String, default: '' },
    },
    garmentSpecs: [
      {
        id: { type: String, required: true },
        garmentNumber: { type: Number, required: true },
        category: { type: String, required: true },
        title: { type: String, required: true },
        sleeveType: { type: String, default: '' },
        garmentType: { type: String, default: '' },
        slit: { type: String, default: 'No' },
        zip: { type: String, default: 'No' },
        lining: { type: String, default: 'Yes' },
        neckType: { type: String, default: 'Standard' },
        frontNeckDesign: { type: String, default: '' },
        backNeckDesign: { type: String, default: '' },
        frontHookOrBack: { type: String, default: 'Front Hook' },
        neckDepthNotes: { type: String, default: '' },
        fitting: { type: String, default: 'M+' },
        bottomStyle: { type: String, default: 'Salwar' },
        regionalStyle: { type: String, default: '' },
        materials: [
          {
            id: { type: String },
            category: { type: String },
            name: { type: String },
            quantity: { type: String },
            source: { type: String },
            receivedStatus: { type: String },
            notes: { type: String },
          },
        ],
        referenceImages: [
          {
            id: { type: String },
            url: { type: String },
            title: { type: String },
            notes: { type: String },
          },
        ],
        customerInstructions: { type: String, default: '' },
        tailorInstructions: { type: String, default: '' },
        specialDesignNotes: { type: String, default: '' },
      },
    ],
    billing: {
      items: [
        {
          id: { type: String, required: true },
          itemName: { type: String, required: true },
          description: { type: String, default: '' },
          quantity: { type: Number, default: 1 },
          rate: { type: Number, default: 0 },
          amount: { type: Number, default: 0 },
        },
      ],
      additionalCharges: {
        stitchingCharges: { type: Number, default: 0 },
        materialCharges: { type: Number, default: 0 },
        designCharges: { type: Number, default: 0 },
        otherCharges: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
      },
      subtotal: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
      advanceAmount: { type: Number, default: 0 },
      amountPaid: { type: Number, default: 0 },
      balanceAmount: { type: Number, default: 0 },
      paymentMethod: { type: String, default: 'Cash' },
      paymentStatus: { type: String, enum: ['PAID', 'PARTIAL', 'UNPAID'], default: 'UNPAID' },
      orderDate: { type: String },
      dueDate: { type: String },
      priority: { type: String, enum: ['Normal', 'Urgent', 'Express'], default: 'Normal' },
      deliveryNotes: { type: String, default: '' },
      referralId: { type: String, default: '' },
      referredBy: { type: String, default: '' },
      referralNotes: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Compound text index for ultra-fast customer search
OrderSchema.index({
  'customer.customerName': 'text',
  'customer.primaryPhone': 'text',
  'customer.customerId': 'text',
  id: 'text',
});

export const OrderModel = mongoose.model<IOrderDoc>('Order', OrderSchema);
