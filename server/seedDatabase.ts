import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OrderModel } from './models/Order';
import { TailorModel } from './models/Tailor';
import { uri } from './db';
import { Order } from '../src/types/order';
import { Tailor } from '../src/types/stitching';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 10 COMPREHENSIVE SAMPLE ORDERS DATASET
// ==========================================
export const TEN_SAMPLE_ORDERS: Order[] = [
  // 1. Smt. Lakshmi Ramakrishnan (Bridal Silk Blouse + Kurti)
  {
    id: 'GG-2026-0101',
    serialNumber: 'SR-001',
    status: 'IN_CUTTING',
    createdAt: '2026-11-10T10:30:00.000Z',
    updatedAt: '2026-11-10T11:45:00.000Z',
    currentStep: 3,
    customer: {
      customerId: 'CUST-101',
      billNumber: 'GG-2026-0101',
      date: '2026-11-10',
      customerName: 'Lakshmi Ramakrishnan',
      relationshipType: 'D/O',
      fatherName: 'Ramakrishnan',
      husbandName: '',
      primaryPhone: '9876543210',
      secondaryPhone: '9840156789',
      fullAddress: 'No. 42/B, North Mada Street, Mylapore',
      areaLocation: 'Mylapore, Chennai - 600004'
    },
    cuttingDetails: {
      status: 'IN_CUTTING',
      startedAt: '2026-11-11T09:00:00.000Z',
      actualQuantityCut: 2,
      cuttingRemarks: 'Kanchipuram silk blouse 01 & 02 cut on bias. Gold borders aligned.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Received',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Received',
        otherMaterials: 'Received',
        remarks: 'All 3 blouse silks & 1 kurti cloth verified in Bin #BIN-001'
      }
    },
    garmentQuantities: [
      { id: 'cat-blouses', category: 'Blouses', label: 'Blouses', quantity: 3 },
      { id: 'cat-kurtis', category: 'Kurtis', label: 'Kurtis / Tops', quantity: 1 },
      { id: 'cat-bottoms', category: 'Bottoms', label: 'Bottoms / Pants', quantity: 0 },
      { id: 'cat-sarees', category: 'Sarees', label: 'Sarees (Pico / Falls)', quantity: 1 }
    ],
    measurements: {
      id: 'meas-101',
      name: "Lakshmi's Bridal Measurement",
      unit: 'in',
      date: '2026-11-10',
      shoulder: 14.5,
      chest: 36.0,
      bust: 37.5,
      upperBust: 35.0,
      underBust: 31.0,
      waist: 30.0,
      hip: 39.0,
      armhole: 16.5,
      sleeveLength: 10.5,
      sleeveRound: 11.5,
      bicep: 13.0,
      elbow: 11.0,
      wrist: 6.5,
      blouseLength: 14.5,
      topLength: 42.0,
      frontLength: 15.0,
      backLength: 14.5,
      frontNeckDepth: 7.0,
      backNeckDepth: 9.5,
      frontNeckWidth: 6.5,
      backNeckWidth: 6.5,
      lowerWaist: 32.0,
      lowerHip: 40.0,
      thigh: 22.0,
      knee: 16.0,
      calf: 14.0,
      ankle: 12.0,
      bottomLength: 38.0,
      inseam: 28.5,
      outseam: 38.5,
      crotch: 25.0,
      customFields: [
        { id: 'cf-1', code: 'AH', label: 'Armhole Depth (AH)', value: 16.5, note: 'Comfort armhole cut' },
        { id: 'cf-2', code: 'BH', label: 'Blouse Height (BH)', value: 14.5, note: 'Waist length' },
        { id: 'cf-3', code: 'SL', label: 'Sleeve Length (SL)', value: 10.5, note: 'Elbow length with gold border' },
        { id: 'cf-4', code: 'FNN', label: 'Front Neck Normal (FNN)', value: 7.0, note: 'Sweetheart curve' },
        { id: 'cf-5', code: 'BN', label: 'Back Neck (BN)', value: 9.5, note: 'Deep U with dori and latkans' }
      ],
      notes: 'Customer prefers snug underbust fitting with comfortable armhole. 2 inches inner margin needed for all blouses.'
    },
    garmentSpecs: [
      {
        id: 'spec-101-1',
        garmentNumber: 1,
        category: 'Blouse',
        title: 'Blouse 01: Tamil Bridal Traditional Silk',
        sleeveType: 'Elbow Length (10.5 in)',
        garmentType: 'Princess Cut (Padded)',
        slit: 'N/A',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Sweetheart Neck with 2mm Gold Cord Piping',
        backNeckDesign: 'Deep U-Shape (9.5 in) with Dori & Handcrafted Latkans',
        frontHookOrBack: 'Back Hook',
        neckDepthNotes: 'Front Depth: 7.0 in, Back Depth: 9.5 in',
        fitting: 'M+',
        bottomStyle: 'Salwar (Normal Pleats)',
        regionalStyle: 'Tamil Bridal with Aari Zari Work',
        cuttingStatus: 'Completed',
        stitchingDetails: {
          tailorId: 'T-001',
          tailorName: 'Rahim Bhai',
          pieceRate: 450,
          status: 'CUT_PIECES_ALLOCATED',
          allocatedAt: '2026-11-11T10:00:00.000Z'
        },
        materials: [
          {
            id: 'mat-101-1',
            category: 'Blouse Material',
            name: 'Pure Kanchipuram Silk with Zari border',
            quantity: '1.0 Mtr',
            source: 'Self Material',
            receivedStatus: 'Received',
            notes: 'Heavy gold border on sleeve'
          },
          {
            id: 'mat-101-2',
            category: 'Lining Material',
            name: 'Pure Cotton Voile 2x2',
            quantity: '1.0 Mtr',
            source: 'Shop Material',
            receivedStatus: 'Received',
            notes: 'Pre-washed and shrunk'
          }
        ],
        referenceImages: [],
        customerInstructions: 'Back neck should be deep U with designer dori and heavy bridal latkans.',
        tailorInstructions: 'Ensure pads are centered and inner seam allowances are 2 inches.',
        specialDesignNotes: 'Back hook with 5 eyelets'
      },
      {
        id: 'spec-101-2',
        garmentNumber: 2,
        category: 'Blouse',
        title: 'Blouse 02: Temple Zari Silk Blouse',
        sleeveType: 'Elbow Length (10.5 in)',
        garmentType: 'Princess Cut (Non-Padded)',
        slit: 'N/A',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Standard',
        frontNeckDesign: 'Round Neck',
        backNeckDesign: 'Pot Neck with Button',
        frontHookOrBack: 'Front Hook',
        neckDepthNotes: 'Front 6.5 in, Back 8.5 in',
        fitting: 'Medium',
        bottomStyle: 'Salwar (Normal Pleats)',
        regionalStyle: 'Traditional South Indian',
        cuttingStatus: 'In Progress',
        stitchingDetails: {
          tailorId: 'T-001',
          tailorName: 'Rahim Bhai',
          pieceRate: 400,
          status: 'CUT_PIECES_ALLOCATED',
          allocatedAt: '2026-11-11T10:00:00.000Z'
        },
        materials: [],
        referenceImages: [],
        customerInstructions: 'Front open with pot neck back',
        tailorInstructions: 'Match sleeve border motifs on both sleeves',
        specialDesignNotes: ''
      },
      {
        id: 'spec-101-3',
        garmentNumber: 3,
        category: 'Blouse',
        title: 'Blouse 03: Raw Silk Brocade Blouse',
        sleeveType: 'Short Sleeve (7.0 in)',
        garmentType: '4-Tucks with Belt',
        slit: 'N/A',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Standard',
        frontNeckDesign: 'Square Neck',
        backNeckDesign: 'Square Neck',
        frontHookOrBack: 'Front Hook',
        neckDepthNotes: 'Front 6.5 in, Back 7.5 in',
        fitting: 'M+',
        bottomStyle: 'Salwar (Normal Pleats)',
        regionalStyle: 'Traditional South Indian',
        cuttingStatus: 'Pending',
        materials: [],
        referenceImages: [],
        customerInstructions: 'Classic 4 tucks with waist belt (patti)',
        tailorInstructions: 'Double stitch on waistband patti',
        specialDesignNotes: ''
      },
      {
        id: 'spec-101-4',
        garmentNumber: 4,
        category: 'Kurti',
        title: 'Kurti 01: Raw Silk Straight Kurti',
        sleeveType: '3/4th Sleeve (16.0 in)',
        garmentType: 'Straight Cut with Side Slits',
        slit: 'Yes',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Mandarin Collar with V-Placket',
        backNeckDesign: 'High Closed Neck',
        frontHookOrBack: 'Front Hook',
        neckDepthNotes: 'Front Placket 8.0 in',
        fitting: 'Medium',
        bottomStyle: 'Straight Pant',
        regionalStyle: 'Contemporary Ethnic',
        cuttingStatus: 'Pending',
        materials: [],
        referenceImages: [],
        customerInstructions: 'Fabric buttons on placket',
        tailorInstructions: 'Reinforce side slits with bar tacks',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-101-1', itemName: 'Bridal Silk Blouse (Princess Padded)', description: 'Heavy zari finishing + padding', quantity: 1, rate: 1250, amount: 1250 },
        { id: 'bi-101-2', itemName: 'Silk Blouse (Non-Padded)', description: 'Pot neck + piping', quantity: 1, rate: 850, amount: 850 },
        { id: 'bi-101-3', itemName: 'Brocade Blouse (4 Tucks)', description: 'Classic pattern', quantity: 1, rate: 750, amount: 750 },
        { id: 'bi-101-4', itemName: 'Raw Silk Kurti with Lining', description: 'Collar neck + cotton lining', quantity: 1, rate: 950, amount: 950 },
        { id: 'bi-101-5', itemName: 'Saree Falls & Pico', description: 'Silk saree pico falls attachment', quantity: 1, rate: 250, amount: 250 },
        { id: 'bi-101-6', itemName: 'Shop Cotton Lining (4 Mtr)', description: 'Pure cotton pre-shrunk lining', quantity: 4, rate: 80, amount: 320 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 250, otherCharges: 0, discount: 420 },
      subtotal: 4370,
      grandTotal: 4200,
      advanceAmount: 2500,
      amountPaid: 2500,
      balanceAmount: 1700,
      paymentMethod: 'UPI',
      paymentStatus: 'PARTIAL',
      orderDate: '2026-11-10',
      dueDate: '2026-11-17',
      priority: 'Urgent',
      deliveryNotes: 'Wedding order. Must deliver on or before Nov 17 evening without fail.',
      referralId: '',
      referredBy: 'Smt. Radha (Regular Customer)',
      referralNotes: 'Special care requested'
    }
  },

  // 2. Smt. Meenakshi Sundaram (Festive Blouses & Kurtis)
  {
    id: 'GG-2026-0102',
    serialNumber: 'SR-002',
    status: 'IN_STITCHING',
    createdAt: '2026-11-11T11:15:00.000Z',
    updatedAt: '2026-11-12T16:30:00.000Z',
    currentStep: 4,
    customer: {
      customerId: 'CUST-102',
      billNumber: 'GG-2026-0102',
      date: '2026-11-11',
      customerName: 'Meenakshi Sundaram',
      relationshipType: 'W/O',
      fatherName: '',
      husbandName: 'Sundaram',
      primaryPhone: '9841023456',
      secondaryPhone: '9840298765',
      fullAddress: 'Flat 3A, Gokulam Apartments, Usman Road, T. Nagar',
      areaLocation: 'T. Nagar, Chennai - 600017'
    },
    cuttingDetails: {
      status: 'CUTTING_COMPLETED',
      startedAt: '2026-11-12T10:00:00.000Z',
      completedAt: '2026-11-12T15:30:00.000Z',
      actualQuantityCut: 5,
      cuttingRemarks: 'All 5 cut pieces shears verified and handed over to Stitching Master.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Received',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Received',
        otherMaterials: 'Received',
        remarks: 'All fabrics inspected. No defects.'
      }
    },
    garmentQuantities: [
      { id: 'cat-blouses', category: 'Blouses', label: 'Blouses', quantity: 2 },
      { id: 'cat-kurtis', category: 'Kurtis', label: 'Kurtis / Tops', quantity: 2 },
      { id: 'cat-bottoms', category: 'Bottoms', label: 'Bottoms / Pants', quantity: 1 }
    ],
    measurements: {
      id: 'meas-102',
      name: "Meenakshi's Standard Fit",
      unit: 'in',
      date: '2026-11-11',
      shoulder: 15.0,
      chest: 38.0,
      bust: 40.0,
      upperBust: 37.5,
      underBust: 33.0,
      waist: 33.0,
      hip: 42.0,
      armhole: 17.5,
      sleeveLength: 11.0,
      sleeveRound: 12.5,
      bicep: 13.5,
      elbow: 11.5,
      wrist: 7.0,
      blouseLength: 15.0,
      topLength: 44.0,
      frontLength: 15.5,
      backLength: 15.0,
      frontNeckDepth: 6.5,
      backNeckDepth: 8.0,
      frontNeckWidth: 6.5,
      backNeckWidth: 6.5,
      lowerWaist: 34.0,
      lowerHip: 43.0,
      thigh: 24.0,
      knee: 17.0,
      calf: 15.0,
      ankle: 13.0,
      bottomLength: 39.0,
      inseam: 29.0,
      outseam: 39.5,
      crotch: 26.0,
      customFields: [],
      notes: 'Comfort armhole cut, no tight squeezing around armpits.'
    },
    garmentSpecs: [
      {
        id: 'spec-102-1',
        garmentNumber: 1,
        category: 'Blouse',
        title: 'Blouse 01: Maroon Brocade Blouse',
        sleeveType: 'Elbow Length (11.0 in)',
        garmentType: 'Princess Cut (Non-Padded)',
        slit: 'N/A',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Standard',
        frontNeckDesign: 'Boat Neck',
        backNeckDesign: 'Teardrop Keyhole',
        frontHookOrBack: 'Side Zip',
        neckDepthNotes: 'Front 5.5 in, Back 8.0 in',
        fitting: 'Medium',
        bottomStyle: 'Salwar (Normal Pleats)',
        regionalStyle: 'South Silk',
        cuttingStatus: 'Completed',
        stitchingDetails: {
          tailorId: 'T-001',
          tailorName: 'Rahim Bhai',
          pieceRate: 450,
          status: 'STITCHING_IN_PROGRESS',
          allocatedAt: '2026-11-12T11:00:00.000Z'
        },
        materials: [],
        referenceImages: [],
        customerInstructions: 'Side concealed zipper',
        tailorInstructions: 'Use YKK invisible zip on left seam',
        specialDesignNotes: ''
      },
      {
        id: 'spec-102-2',
        garmentNumber: 2,
        category: 'Kurti',
        title: 'Kurti 01: Raw Silk Party Kurti',
        sleeveType: '3/4th Sleeve (16.0 in)',
        garmentType: 'A-Line Kurti',
        slit: 'Yes',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Round with Slit Placket',
        backNeckDesign: 'Round Neck',
        frontHookOrBack: 'Front Hook',
        neckDepthNotes: 'Front 6.5 in, Back 5.0 in',
        fitting: 'Medium',
        bottomStyle: 'Cigarette Pant',
        regionalStyle: 'Fusion',
        cuttingStatus: 'Completed',
        stitchingDetails: {
          tailorId: 'T-002',
          tailorName: 'Fatima Begum',
          pieceRate: 500,
          status: 'STITCHING_IN_PROGRESS',
          allocatedAt: '2026-11-12T11:00:00.000Z'
        },
        materials: [],
        referenceImages: [],
        customerInstructions: 'Potli buttons on placket',
        tailorInstructions: 'Matching handmade potli buttons',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-102-1', itemName: 'Designer Silk Blouse', description: 'Boat neck + keyhole', quantity: 2, rate: 850, amount: 1700 },
        { id: 'bi-102-2', itemName: 'Festive Raw Silk Kurti', description: 'With full lining', quantity: 2, rate: 900, amount: 1800 },
        { id: 'bi-102-3', itemName: 'Cigarette Pants with Elastic', description: 'Pure cotton silk', quantity: 1, rate: 550, amount: 550 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 0, otherCharges: 0, discount: 200 },
      subtotal: 4050,
      grandTotal: 3850,
      advanceAmount: 2000,
      amountPaid: 2000,
      balanceAmount: 1850,
      paymentMethod: 'UPI',
      paymentStatus: 'PARTIAL',
      orderDate: '2026-11-11',
      dueDate: '2026-11-18',
      priority: 'Normal',
      deliveryNotes: 'Deliver in Giriraj branded garment bag.',
      referralId: '',
      referredBy: '',
      referralNotes: ''
    }
  },

  // 3. Dr. Ananya Subramanian (Formal Linen Kurtis & Trousers)
  {
    id: 'GG-2026-0103',
    serialNumber: 'SR-003',
    status: 'READY_FOR_TRIAL',
    createdAt: '2026-11-12T09:40:00.000Z',
    updatedAt: '2026-11-14T17:00:00.000Z',
    currentStep: 5,
    customer: {
      customerId: 'CUST-103',
      billNumber: 'GG-2026-0103',
      date: '2026-11-12',
      customerName: 'Dr. Ananya Subramanian',
      relationshipType: 'D/O',
      fatherName: 'Dr. K. Subramanian',
      husbandName: '',
      primaryPhone: '9790812345',
      secondaryPhone: '9444054321',
      fullAddress: '18, 2nd Main Road, Gandhi Nagar, Adyar',
      areaLocation: 'Adyar, Chennai - 600020'
    },
    cuttingDetails: {
      status: 'CUTTING_COMPLETED',
      startedAt: '2026-11-12T14:00:00.000Z',
      completedAt: '2026-11-13T12:00:00.000Z',
      actualQuantityCut: 6,
      cuttingRemarks: 'Pure linen fabric pre-washed. Grain lines strictly matched.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Received',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Received',
        otherMaterials: 'Received',
        remarks: 'All 3 linen pieces & 2 pant fabrics verified'
      }
    },
    garmentQuantities: [
      { id: 'cat-kurtis', category: 'Kurtis', label: 'Kurtis / Tops', quantity: 3 },
      { id: 'cat-bottoms', category: 'Bottoms', label: 'Bottoms / Pants', quantity: 2 },
      { id: 'cat-dupatta', category: 'Dupatta', label: 'Dupatta Finish', quantity: 1 }
    ],
    measurements: {
      id: 'meas-103',
      name: "Dr. Ananya's Executive Fit",
      unit: 'in',
      date: '2026-11-12',
      shoulder: 14.0,
      chest: 34.0,
      bust: 35.5,
      upperBust: 33.5,
      underBust: 29.5,
      waist: 28.5,
      hip: 37.5,
      armhole: 15.5,
      sleeveLength: 16.0,
      sleeveRound: 10.0,
      bicep: 11.5,
      elbow: 10.0,
      wrist: 6.0,
      blouseLength: 14.0,
      topLength: 43.0,
      frontLength: 14.5,
      backLength: 14.0,
      frontNeckDepth: 6.0,
      backNeckDepth: 6.5,
      frontNeckWidth: 6.0,
      backNeckWidth: 6.0,
      lowerWaist: 30.0,
      lowerHip: 38.5,
      thigh: 21.0,
      knee: 15.0,
      calf: 13.5,
      ankle: 11.5,
      bottomLength: 37.5,
      inseam: 28.0,
      outseam: 38.0,
      crotch: 24.5,
      customFields: [],
      notes: 'Doctor coat profile: Sleek, formal collar, deep right side pocket in pants for stethoscope/phone.'
    },
    garmentSpecs: [
      {
        id: 'spec-103-1',
        garmentNumber: 1,
        category: 'Kurti',
        title: 'Kurti 01: Olive Green Linen Kurti',
        sleeveType: '3/4th Sleeve (16.0 in)',
        garmentType: 'Straight Cut with Pocket',
        slit: 'Yes',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Shirt Collar with Wooden Buttons',
        backNeckDesign: 'High Closed Back',
        frontHookOrBack: 'Front Hook',
        neckDepthNotes: 'Front 6.0 in',
        fitting: 'M+',
        bottomStyle: 'Straight Trousers',
        regionalStyle: 'Formal Wear',
        cuttingStatus: 'Completed',
        stitchingDetails: {
          tailorId: 'T-002',
          tailorName: 'Fatima Begum',
          pieceRate: 550,
          status: 'READY_FOR_QC',
          allocatedAt: '2026-11-13T10:00:00.000Z'
        },
        materials: [],
        referenceImages: [],
        customerInstructions: 'Real wooden button accents',
        tailorInstructions: 'Side pocket with concealed zip',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-103-1', itemName: 'Formal Linen Kurti', description: 'With shirt collar & side pocket', quantity: 3, rate: 950, amount: 2850 },
        { id: 'bi-103-2', itemName: 'Formal Linen Trousers', description: 'With deep phone pockets', quantity: 2, rate: 750, amount: 1500 },
        { id: 'bi-103-3', itemName: 'Dupatta Edge Pico Finish', description: 'Narrow hem pico', quantity: 1, rate: 250, amount: 250 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 0, otherCharges: 0, discount: 0 },
      subtotal: 4600,
      grandTotal: 4600,
      advanceAmount: 4600,
      amountPaid: 4600,
      balanceAmount: 0,
      paymentMethod: 'Card',
      paymentStatus: 'PAID',
      orderDate: '2026-11-12',
      dueDate: '2026-11-19',
      priority: 'Normal',
      deliveryNotes: 'Customer requested WhatsApp message when ready for trial.',
      referralId: '',
      referredBy: '',
      referralNotes: ''
    }
  },

  // 4. Ms. Priya Venkataraman (Bridal Sangeet Lehenga Choli)
  {
    id: 'GG-2026-0104',
    serialNumber: 'SR-004',
    status: 'NEW',
    createdAt: '2026-11-13T14:20:00.000Z',
    updatedAt: '2026-11-13T14:45:00.000Z',
    currentStep: 2,
    customer: {
      customerId: 'CUST-104',
      billNumber: 'GG-2026-0104',
      date: '2026-11-13',
      customerName: 'Priya Venkataraman',
      relationshipType: 'D/O',
      fatherName: 'Venkataraman',
      husbandName: '',
      primaryPhone: '9884077889',
      secondaryPhone: '9841122334',
      fullAddress: '72, 3rd Avenue, Shanthi Colony, Anna Nagar',
      areaLocation: 'Anna Nagar, Chennai - 600040'
    },
    cuttingDetails: {
      status: 'NEW',
      actualQuantityCut: 0,
      cuttingRemarks: 'Order booked. Waiting for master cutting table clearance.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Received',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Not Required',
        otherMaterials: 'Received',
        remarks: 'Heavy bridal velvet & raw silk lehenga fabrics received with zardozi borders.'
      }
    },
    garmentQuantities: [
      { id: 'cat-blouses', category: 'Blouses', label: 'Blouses', quantity: 1 },
      { id: 'cat-bottoms', category: 'Bottoms', label: 'Bottoms / Pants', quantity: 1 },
      { id: 'cat-dupatta', category: 'Dupatta', label: 'Dupatta Finish', quantity: 1 }
    ],
    measurements: {
      id: 'meas-104',
      name: "Priya's Bridal Lehenga Measurement",
      unit: 'in',
      date: '2026-11-13',
      shoulder: 14.0,
      chest: 35.0,
      bust: 36.5,
      upperBust: 34.0,
      underBust: 30.0,
      waist: 29.0,
      hip: 38.0,
      armhole: 16.0,
      sleeveLength: 7.5,
      sleeveRound: 11.0,
      bicep: 12.0,
      elbow: 10.5,
      wrist: 6.5,
      blouseLength: 14.0,
      topLength: 14.0,
      frontLength: 14.5,
      backLength: 14.0,
      frontNeckDepth: 7.5,
      backNeckDepth: 10.5,
      frontNeckWidth: 7.0,
      backNeckWidth: 7.5,
      lowerWaist: 30.5,
      lowerHip: 39.0,
      thigh: 21.5,
      knee: 15.5,
      calf: 13.5,
      ankle: 12.0,
      bottomLength: 42.0,
      inseam: 31.0,
      outseam: 42.5,
      crotch: 27.0,
      customFields: [],
      notes: 'Bridal Sangeet. Double can-can skirt needed for flared umbrella bounce.'
    },
    garmentSpecs: [
      {
        id: 'spec-104-1',
        garmentNumber: 1,
        category: 'Blouse',
        title: 'Blouse 01: Velvet Backless Designer Choli',
        sleeveType: 'Cap Sleeve (7.5 in)',
        garmentType: 'Padded Bridal Choli',
        slit: 'N/A',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Deep Plunging Sweetheart',
        backNeckDesign: 'Backless with Cross Straps & Heavy Latkans',
        frontHookOrBack: 'Side Zip',
        neckDepthNotes: 'Front 7.5 in, Back 10.5 in',
        fitting: 'M+',
        bottomStyle: 'Lehenga Skirt',
        regionalStyle: 'North Indian Bridal',
        cuttingStatus: 'Pending',
        materials: [],
        referenceImages: [],
        customerInstructions: 'Heavy latkans at back waist tie-up',
        tailorInstructions: 'Use reinforced padding cups with double satin lining',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-104-1', itemName: 'Bridal Designer Lehenga Skirt', description: 'Double can-can + heavy umbrella flare', quantity: 1, rate: 4500, amount: 4500 },
        { id: 'bi-104-2', itemName: 'Velvet Padded Bridal Choli', description: 'Backless with heavy latkans', quantity: 1, rate: 2200, amount: 2200 },
        { id: 'bi-104-3', itemName: 'Net Dupatta Border Mounting', description: 'Heavy zari border attachment', quantity: 1, rate: 1100, amount: 1100 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 500, otherCharges: 0, discount: 500 },
      subtotal: 7800,
      grandTotal: 7800,
      advanceAmount: 5000,
      amountPaid: 5000,
      balanceAmount: 2800,
      paymentMethod: 'UPI',
      paymentStatus: 'PARTIAL',
      orderDate: '2026-11-13',
      dueDate: '2026-11-24',
      priority: 'Urgent',
      deliveryNotes: 'VIP Bridal Client. Deliver in velvet bridal trunk bag.',
      referralId: '',
      referredBy: 'Bridal Boutique Anna Nagar',
      referralNotes: ''
    }
  },

  // 5. Smt. Kavitha Rajagopal (Madisar Saree Blouses)
  {
    id: 'GG-2026-0105',
    serialNumber: 'SR-005',
    status: 'NEW',
    createdAt: '2026-11-13T16:00:00.000Z',
    updatedAt: '2026-11-13T16:15:00.000Z',
    currentStep: 3,
    customer: {
      customerId: 'CUST-105',
      billNumber: 'GG-2026-0105',
      date: '2026-11-13',
      customerName: 'Kavitha Rajagopal',
      relationshipType: 'W/O',
      fatherName: '',
      husbandName: 'Rajagopal',
      primaryPhone: '9840334455',
      secondaryPhone: '9840998877',
      fullAddress: '12/4, Eldams Road, Alwarpet',
      areaLocation: 'Alwarpet, Chennai - 600018'
    },
    cuttingDetails: {
      status: 'NEW',
      actualQuantityCut: 0,
      cuttingRemarks: 'Traditional 4 tucks with waist patti. Fabrics marked.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Received',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Received',
        otherMaterials: 'Not Required',
        remarks: 'Customer provided 3 pure cotton silk fabrics'
      }
    },
    garmentQuantities: [
      { id: 'cat-blouses', category: 'Blouses', label: 'Blouses', quantity: 3 },
      { id: 'cat-sarees', category: 'Sarees', label: 'Sarees (Pico / Falls)', quantity: 1 }
    ],
    measurements: {
      id: 'meas-105',
      name: "Kavitha's Traditional Fit",
      unit: 'in',
      date: '2026-11-13',
      shoulder: 15.5,
      chest: 40.0,
      bust: 42.0,
      upperBust: 39.5,
      underBust: 34.5,
      waist: 35.0,
      hip: 44.0,
      armhole: 18.0,
      sleeveLength: 8.5,
      sleeveRound: 13.0,
      bicep: 14.0,
      elbow: 12.0,
      wrist: 7.0,
      blouseLength: 15.5,
      topLength: 42.0,
      frontLength: 16.0,
      backLength: 15.5,
      frontNeckDepth: 6.5,
      backNeckDepth: 7.5,
      frontNeckWidth: 6.5,
      backNeckWidth: 6.5,
      lowerWaist: 36.0,
      lowerHip: 45.0,
      thigh: 25.0,
      knee: 18.0,
      calf: 15.5,
      ankle: 13.5,
      bottomLength: 38.0,
      inseam: 28.0,
      outseam: 38.5,
      crotch: 26.5,
      customFields: [],
      notes: 'Traditional Madisar 9-yard drape blouse. High armhole comfort, wide back seam allowance.'
    },
    garmentSpecs: [
      {
        id: 'spec-105-1',
        garmentNumber: 1,
        category: 'Blouse',
        title: 'Blouse 01: Traditional Madisar 4-Tucks',
        sleeveType: 'Medium Sleeve (8.5 in)',
        garmentType: '4-Tucks with Belt',
        slit: 'N/A',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Standard',
        frontNeckDesign: 'Round Neck',
        backNeckDesign: 'Round Neck',
        frontHookOrBack: 'Front Hook',
        neckDepthNotes: 'Front 6.5 in, Back 7.5 in',
        fitting: 'Medium',
        bottomStyle: 'Salwar (Normal Pleats)',
        regionalStyle: 'Traditional Brahmin Madisar',
        cuttingStatus: 'Pending',
        materials: [],
        referenceImages: [],
        customerInstructions: 'Front hook with reinforced placket',
        tailorInstructions: 'Ensure 2.5 inches inner margin on both sides',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-105-1', itemName: 'Traditional 4-Tucks Blouse', description: 'With belt & contrast piping', quantity: 3, rate: 700, amount: 2100 },
        { id: 'bi-105-2', itemName: '9-Yard Saree Falls & Pico', description: 'Full length 9-yard falls', quantity: 1, rate: 350, amount: 350 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 0, otherCharges: 0, discount: 0 },
      subtotal: 2450,
      grandTotal: 2450,
      advanceAmount: 1500,
      amountPaid: 1500,
      balanceAmount: 950,
      paymentMethod: 'Cash',
      paymentStatus: 'PARTIAL',
      orderDate: '2026-11-13',
      dueDate: '2026-11-20',
      priority: 'Normal',
      deliveryNotes: '',
      referralId: '',
      referredBy: '',
      referralNotes: ''
    }
  },

  // 6. Smt. Deepa Natarajan (32-Kali Anarkali Floor-Length Gown)
  {
    id: 'GG-2026-0106',
    serialNumber: 'SR-006',
    status: 'IN_CUTTING',
    createdAt: '2026-11-12T15:30:00.000Z',
    updatedAt: '2026-11-13T10:15:00.000Z',
    currentStep: 3,
    customer: {
      customerId: 'CUST-106',
      billNumber: 'GG-2026-0106',
      date: '2026-11-12',
      customerName: 'Deepa Natarajan',
      relationshipType: 'W/O',
      fatherName: '',
      husbandName: 'Natarajan',
      primaryPhone: '9789065432',
      secondaryPhone: '9884512345',
      fullAddress: '27, 100 Feet Bypass Road, Velachery',
      areaLocation: 'Velachery, Chennai - 600042'
    },
    cuttingDetails: {
      status: 'IN_CUTTING',
      startedAt: '2026-11-13T10:00:00.000Z',
      actualQuantityCut: 1,
      cuttingRemarks: 'Cutting 32 individual kalis on full-width georgette with santoon lining.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Received',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Not Required',
        otherMaterials: 'Received',
        remarks: 'Heavy georgette fabric (6.5 meters) checked'
      }
    },
    garmentQuantities: [
      { id: 'cat-kurtis', category: 'Kurtis', label: 'Kurtis / Tops', quantity: 1 },
      { id: 'cat-churidar', category: 'Churidar', label: 'Churidar Sets', quantity: 1 },
      { id: 'cat-dupatta', category: 'Dupatta', label: 'Dupatta Finish', quantity: 1 }
    ],
    measurements: {
      id: 'meas-106',
      name: "Deepa's Anarkali Fit",
      unit: 'in',
      date: '2026-11-12',
      shoulder: 14.5,
      chest: 37.0,
      bust: 38.5,
      upperBust: 36.0,
      underBust: 32.0,
      waist: 31.0,
      hip: 40.0,
      armhole: 16.5,
      sleeveLength: 18.0,
      sleeveRound: 9.5,
      bicep: 12.5,
      elbow: 10.5,
      wrist: 6.0,
      blouseLength: 14.5,
      topLength: 52.0,
      frontLength: 15.0,
      backLength: 14.5,
      frontNeckDepth: 6.5,
      backNeckDepth: 8.5,
      frontNeckWidth: 6.5,
      backNeckWidth: 6.5,
      lowerWaist: 33.0,
      lowerHip: 41.5,
      thigh: 23.0,
      knee: 16.5,
      calf: 14.5,
      ankle: 12.0,
      bottomLength: 46.0,
      inseam: 36.0,
      outseam: 46.5,
      crotch: 26.0,
      customFields: [],
      notes: 'Floor length gown. Churidar needs extra gatherings (churis) at calf.'
    },
    garmentSpecs: [
      {
        id: 'spec-106-1',
        garmentNumber: 1,
        category: 'Kurti',
        title: 'Anarkali 01: 32-Kali Floor Length Gown',
        sleeveType: 'Full Sleeve (18.0 in)',
        garmentType: '32-Kali Flare Anarkali',
        slit: 'No',
        zip: 'Side Zip',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Angrakha Overlap Neck',
        backNeckDesign: 'Deep Round Neck with Tie Tassels',
        frontHookOrBack: 'Side Zip',
        neckDepthNotes: 'Front 6.5 in, Back 8.5 in',
        fitting: 'Loose Fit',
        bottomStyle: 'Churidar',
        regionalStyle: 'Mughal Classic',
        cuttingStatus: 'In Progress',
        materials: [],
        referenceImages: [],
        customerInstructions: 'Crinoline horsehair braid tape at bottom hem for umbrella stiffness',
        tailorInstructions: 'Attach horsehair braid tape neatly inside hemline',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-106-1', itemName: '32-Kali Floor Length Anarkali Gown', description: 'With crinoline tape hemline', quantity: 1, rate: 3800, amount: 3800 },
        { id: 'bi-106-2', itemName: 'Churidar with Deep Gatherings', description: 'Pure cotton silk', quantity: 1, rate: 850, amount: 850 },
        { id: 'bi-106-3', itemName: 'Dupatta Zari Border Mounting', description: 'Gota patti attachment', quantity: 1, rate: 550, amount: 550 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 0, otherCharges: 0, discount: 0 },
      subtotal: 5200,
      grandTotal: 5200,
      advanceAmount: 3000,
      amountPaid: 3000,
      balanceAmount: 2200,
      paymentMethod: 'UPI',
      paymentStatus: 'PARTIAL',
      orderDate: '2026-11-12',
      dueDate: '2026-11-21',
      priority: 'Normal',
      deliveryNotes: '',
      referralId: '',
      referredBy: '',
      referralNotes: ''
    }
  },

  // 7. Smt. Sangeetha Balaji (Banarasi Blouse & Salwar Suit)
  {
    id: 'GG-2026-0107',
    serialNumber: 'SR-007',
    status: 'IN_STITCHING',
    createdAt: '2026-11-14T11:00:00.000Z',
    updatedAt: '2026-11-14T16:00:00.000Z',
    currentStep: 4,
    customer: {
      customerId: 'CUST-107',
      billNumber: 'GG-2026-0107',
      date: '2026-11-14',
      customerName: 'Sangeetha Balaji',
      relationshipType: 'D/O',
      fatherName: 'Balaji',
      husbandName: '',
      primaryPhone: '9840112244',
      secondaryPhone: '9840556677',
      fullAddress: '5, Ormes Road, Kilpauk',
      areaLocation: 'Kilpauk, Chennai - 600010'
    },
    cuttingDetails: {
      status: 'CUTTING_COMPLETED',
      startedAt: '2026-11-14T11:30:00.000Z',
      completedAt: '2026-11-14T15:00:00.000Z',
      actualQuantityCut: 3,
      cuttingRemarks: 'Cutting completed. Handed to tailor Rahim Bhai.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Received',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Received',
        otherMaterials: 'Received',
        remarks: 'Banarasi brocade & cotton fabrics verified'
      }
    },
    garmentQuantities: [
      { id: 'cat-blouses', category: 'Blouses', label: 'Blouses', quantity: 2 },
      { id: 'cat-salwar', category: 'Salwar', label: 'Salwar Suits', quantity: 1 }
    ],
    measurements: {
      id: 'meas-107',
      name: "Sangeetha's Festive Fit",
      unit: 'in',
      date: '2026-11-14',
      shoulder: 14.0,
      chest: 36.0,
      bust: 37.0,
      upperBust: 35.0,
      underBust: 31.0,
      waist: 30.0,
      hip: 39.0,
      armhole: 16.0,
      sleeveLength: 10.0,
      sleeveRound: 11.5,
      bicep: 12.5,
      elbow: 11.0,
      wrist: 6.5,
      blouseLength: 14.5,
      topLength: 41.0,
      frontLength: 15.0,
      backLength: 14.5,
      frontNeckDepth: 7.0,
      backNeckDepth: 9.0,
      frontNeckWidth: 6.5,
      backNeckWidth: 7.0,
      lowerWaist: 32.0,
      lowerHip: 40.0,
      thigh: 22.0,
      knee: 16.0,
      calf: 14.0,
      ankle: 12.0,
      bottomLength: 38.5,
      inseam: 28.5,
      outseam: 39.0,
      crotch: 25.5,
      customFields: [],
      notes: 'Banarasi brocade boat neck blouse with sheer net back. Punjabi style salwar with deep pleats.'
    },
    garmentSpecs: [
      {
        id: 'spec-107-1',
        garmentNumber: 1,
        category: 'Blouse',
        title: 'Blouse 01: Banarasi Brocade Boat Neck',
        sleeveType: 'Elbow Length (10.0 in)',
        garmentType: 'Princess Cut (Padded)',
        slit: 'N/A',
        zip: 'Side Zip',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Wide Boat Neck',
        backNeckDesign: 'Sheer Net Back with Pearl Buttons',
        frontHookOrBack: 'Side Zip',
        neckDepthNotes: 'Front 5.0 in, Back 9.0 in',
        fitting: 'M+',
        bottomStyle: 'Salwar (Normal Pleats)',
        regionalStyle: 'Party Wear',
        cuttingStatus: 'Completed',
        stitchingDetails: {
          tailorId: 'T-001',
          tailorName: 'Rahim Bhai',
          pieceRate: 480,
          status: 'STITCHING_IN_PROGRESS',
          allocatedAt: '2026-11-14T12:00:00.000Z'
        },
        materials: [],
        referenceImages: [],
        customerInstructions: 'Delicate pearl buttons on net back',
        tailorInstructions: 'Ensure net fabric tension is equal on both sides',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-107-1', itemName: 'Banarasi Brocade Blouse (Princess Padded)', description: 'Boat neck + sheer net back', quantity: 2, rate: 1100, amount: 2200 },
        { id: 'bi-107-2', itemName: 'Punjabi Salwar Suit Stitching', description: 'With deep pleats & contrast piping', quantity: 1, rate: 1200, amount: 1200 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 0, otherCharges: 0, discount: 0 },
      subtotal: 3400,
      grandTotal: 3400,
      advanceAmount: 2000,
      amountPaid: 2000,
      balanceAmount: 1400,
      paymentMethod: 'UPI',
      paymentStatus: 'PARTIAL',
      orderDate: '2026-11-14',
      dueDate: '2026-11-22',
      priority: 'Normal',
      deliveryNotes: '',
      referralId: '',
      referredBy: '',
      referralNotes: ''
    }
  },

  // 8. Smt. Revathi Sridhar (Pure Tussar Silk Kurtis & Flared Palazzos)
  {
    id: 'GG-2026-0108',
    serialNumber: 'SR-008',
    status: 'NEW',
    createdAt: '2026-11-14T14:40:00.000Z',
    updatedAt: '2026-11-14T15:00:00.000Z',
    currentStep: 1,
    customer: {
      customerId: 'CUST-108',
      billNumber: 'GG-2026-0108',
      date: '2026-11-14',
      customerName: 'Revathi Sridhar',
      relationshipType: 'W/O',
      fatherName: '',
      husbandName: 'Sridhar',
      primaryPhone: '9884123490',
      secondaryPhone: '9841876543',
      fullAddress: '34, 4th Main Road, Besant Nagar',
      areaLocation: 'Besant Nagar, Chennai - 600090'
    },
    cuttingDetails: {
      status: 'NEW',
      actualQuantityCut: 0,
      cuttingRemarks: 'Order booked today. Fabric tagged in storage basket #B-108.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Received',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Not Required',
        otherMaterials: 'Received',
        remarks: 'Pure tussar silk with kashmiri border received'
      }
    },
    garmentQuantities: [
      { id: 'cat-kurtis', category: 'Kurtis', label: 'Kurtis / Tops', quantity: 2 },
      { id: 'cat-bottoms', category: 'Bottoms', label: 'Bottoms / Pants', quantity: 2 }
    ],
    measurements: {
      id: 'meas-108',
      name: "Revathi's Comfort Measurement",
      unit: 'in',
      date: '2026-11-14',
      shoulder: 15.0,
      chest: 39.0,
      bust: 41.0,
      upperBust: 38.0,
      underBust: 34.0,
      waist: 34.0,
      hip: 43.0,
      armhole: 17.5,
      sleeveLength: 15.5,
      sleeveRound: 11.0,
      bicep: 13.5,
      elbow: 11.5,
      wrist: 6.5,
      blouseLength: 15.0,
      topLength: 43.5,
      frontLength: 15.5,
      backLength: 15.0,
      frontNeckDepth: 6.5,
      backNeckDepth: 7.0,
      frontNeckWidth: 6.5,
      backNeckWidth: 6.5,
      lowerWaist: 35.0,
      lowerHip: 44.0,
      thigh: 24.5,
      knee: 17.5,
      calf: 15.0,
      ankle: 13.0,
      bottomLength: 38.5,
      inseam: 28.5,
      outseam: 39.0,
      crotch: 26.5,
      customFields: [],
      notes: 'Palazzo pants with lace border at bottom. Elastic waistband with drawstring.'
    },
    garmentSpecs: [
      {
        id: 'spec-108-1',
        garmentNumber: 1,
        category: 'Kurti',
        title: 'Kurti 01: Pure Tussar Silk A-Line Kurti',
        sleeveType: '3/4th Sleeve (15.5 in)',
        garmentType: 'A-Line Kurti with Lining',
        slit: 'Yes',
        zip: 'No',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Sweetheart with Zari Border Trim',
        backNeckDesign: 'Round Neck',
        frontHookOrBack: 'Front Hook',
        neckDepthNotes: 'Front 6.5 in, Back 7.0 in',
        fitting: 'Medium',
        bottomStyle: 'Flared Palazzo',
        regionalStyle: 'Kashmiri Silk',
        cuttingStatus: 'Pending',
        materials: [],
        referenceImages: [],
        customerInstructions: 'Zari border on sleeve cuffs',
        tailorInstructions: 'Pre-wash silk lining before attaching',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-108-1', itemName: 'Pure Tussar Silk Kurti', description: 'A-line with cotton lining', quantity: 2, rate: 1200, amount: 2400 },
        { id: 'bi-108-2', itemName: 'Flared Palazzo Bottom', description: 'With bottom lace border', quantity: 2, rate: 750, amount: 1500 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 0, otherCharges: 0, discount: 0 },
      subtotal: 3900,
      grandTotal: 3900,
      advanceAmount: 2000,
      amountPaid: 2000,
      balanceAmount: 1900,
      paymentMethod: 'UPI',
      paymentStatus: 'PARTIAL',
      orderDate: '2026-11-14',
      dueDate: '2026-11-25',
      priority: 'Normal',
      deliveryNotes: '',
      referralId: '',
      referredBy: '',
      referralNotes: ''
    }
  },

  // 9. Smt. Shanthi Narayanan (5 Regular Daily Cotton Blouses - Delivered/Paid)
  {
    id: 'GG-2026-0109',
    serialNumber: 'SR-009',
    status: 'COMPLETED',
    createdAt: '2026-11-08T09:30:00.000Z',
    updatedAt: '2026-11-14T18:00:00.000Z',
    currentStep: 5,
    customer: {
      customerId: 'CUST-109',
      billNumber: 'GG-2026-0109',
      date: '2026-11-08',
      customerName: 'Shanthi Narayanan',
      relationshipType: 'W/O',
      fatherName: '',
      husbandName: 'Narayanan',
      primaryPhone: '9444198765',
      secondaryPhone: '9444587654',
      fullAddress: '15, GST Road, West Tambaram',
      areaLocation: 'Tambaram, Chennai - 600045'
    },
    cuttingDetails: {
      status: 'CUTTING_COMPLETED',
      startedAt: '2026-11-08T11:00:00.000Z',
      completedAt: '2026-11-09T14:00:00.000Z',
      actualQuantityCut: 5,
      cuttingRemarks: 'All 5 cotton blouses cut with master pattern.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Received',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Received',
        otherMaterials: 'Not Required',
        remarks: '5 pieces 2x2 Rubia cotton delivered'
      }
    },
    garmentQuantities: [
      { id: 'cat-blouses', category: 'Blouses', label: 'Blouses', quantity: 5 }
    ],
    measurements: {
      id: 'meas-109',
      name: "Shanthi's Cotton Blouse Fit",
      unit: 'in',
      date: '2026-11-08',
      shoulder: 15.0,
      chest: 38.0,
      bust: 39.5,
      upperBust: 37.0,
      underBust: 33.0,
      waist: 32.5,
      hip: 41.0,
      armhole: 17.0,
      sleeveLength: 9.0,
      sleeveRound: 12.0,
      bicep: 13.0,
      elbow: 11.0,
      wrist: 6.5,
      blouseLength: 15.0,
      topLength: 40.0,
      frontLength: 15.5,
      backLength: 15.0,
      frontNeckDepth: 6.5,
      backNeckDepth: 7.5,
      frontNeckWidth: 6.0,
      backNeckWidth: 6.0,
      lowerWaist: 34.0,
      lowerHip: 42.0,
      thigh: 23.0,
      knee: 16.5,
      calf: 14.5,
      ankle: 12.5,
      bottomLength: 37.0,
      inseam: 27.5,
      outseam: 37.5,
      crotch: 25.0,
      customFields: [],
      notes: 'Daily cotton wear. Front hook with 3-tucks pattern, contrast thread piping.'
    },
    garmentSpecs: [
      {
        id: 'spec-109-1',
        garmentNumber: 1,
        category: 'Blouse',
        title: 'Blouse 01: Maroon 2x2 Cotton Blouse',
        sleeveType: 'Regular Sleeve (9.0 in)',
        garmentType: 'Classic 3-Tucks',
        slit: 'N/A',
        zip: 'No',
        lining: 'No',
        neckType: 'Standard',
        frontNeckDesign: 'U Neck with Piping',
        backNeckDesign: 'Round Neck',
        frontHookOrBack: 'Front Hook',
        neckDepthNotes: 'Front 6.5 in, Back 7.5 in',
        fitting: 'Medium',
        bottomStyle: 'Salwar (Normal Pleats)',
        regionalStyle: 'Classic Everyday',
        cuttingStatus: 'Completed',
        stitchingDetails: {
          tailorId: 'T-001',
          tailorName: 'Rahim Bhai',
          pieceRate: 350,
          status: 'READY_FOR_QC',
          allocatedAt: '2026-11-09T10:00:00.000Z',
          completedAt: '2026-11-13T16:00:00.000Z'
        },
        materials: [],
        referenceImages: [],
        customerInstructions: 'Front hook with neat hem piping',
        tailorInstructions: 'Triple stitch at hook band',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-109-1', itemName: '2x2 Rubia Cotton Blouses', description: 'Classic 3-tucks front open', quantity: 5, rate: 550, amount: 2750 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 0, otherCharges: 0, discount: 0 },
      subtotal: 2750,
      grandTotal: 2750,
      advanceAmount: 2750,
      amountPaid: 2750,
      balanceAmount: 0,
      paymentMethod: 'Cash',
      paymentStatus: 'PAID',
      orderDate: '2026-11-08',
      dueDate: '2026-11-14',
      priority: 'Normal',
      deliveryNotes: 'Order completed and ready for pickup.',
      referralId: '',
      referredBy: '',
      referralNotes: ''
    }
  },

  // 10. Ms. Divya Chandrasekaran (Velvet Crop Top with Georgette Cape - Urgent Reception)
  {
    id: 'GG-2026-0110',
    serialNumber: 'SR-010',
    status: 'NEW',
    createdAt: '2026-11-15T09:15:00.000Z',
    updatedAt: '2026-11-15T09:30:00.000Z',
    currentStep: 3,
    customer: {
      customerId: 'CUST-110',
      billNumber: 'GG-2026-0110',
      date: '2026-11-15',
      customerName: 'Divya Chandrasekaran',
      relationshipType: 'D/O',
      fatherName: 'Chandrasekaran',
      husbandName: '',
      primaryPhone: '9840889900',
      secondaryPhone: '9840223311',
      fullAddress: '88, Sterling Road, Nungambakkam',
      areaLocation: 'Nungambakkam, Chennai - 600034'
    },
    cuttingDetails: {
      status: 'ON_HOLD',
      holdReason: 'Customer to bring emerald green velvet fabric tomorrow morning.',
      actualQuantityCut: 0,
      cuttingRemarks: 'Measurements recorded. Waiting for fabric receipt to begin pattern cutting.',
      assignedMaster: 'Master Subramaniam (Table 1)',
      materialsCheck: {
        customerMaterial: 'Pending',
        shopMaterial: 'Received',
        liningMaterial: 'Received',
        twoByTwoMaterial: 'Not Required',
        otherMaterials: 'Received',
        remarks: 'Customer velvet pending. Can-can and santoon lining ready in shop.'
      }
    },
    garmentQuantities: [
      { id: 'cat-blouses', category: 'Blouses', label: 'Blouses', quantity: 1 },
      { id: 'cat-bottoms', category: 'Bottoms', label: 'Bottoms / Pants', quantity: 1 },
      { id: 'cat-dupatta', category: 'Dupatta', label: 'Dupatta Finish', quantity: 1 }
    ],
    measurements: {
      id: 'meas-110',
      name: "Divya's Reception Crop Top Fit",
      unit: 'in',
      date: '2026-11-15',
      shoulder: 14.0,
      chest: 34.5,
      bust: 36.0,
      upperBust: 33.5,
      underBust: 29.5,
      waist: 28.0,
      hip: 37.0,
      armhole: 15.5,
      sleeveLength: 22.0,
      sleeveRound: 8.5,
      bicep: 11.0,
      elbow: 9.5,
      wrist: 5.5,
      blouseLength: 13.5,
      topLength: 13.5,
      frontLength: 14.0,
      backLength: 13.5,
      frontNeckDepth: 7.0,
      backNeckDepth: 8.0,
      frontNeckWidth: 6.5,
      backNeckWidth: 6.5,
      lowerWaist: 29.5,
      lowerHip: 38.0,
      thigh: 21.0,
      knee: 15.0,
      calf: 13.5,
      ankle: 11.5,
      bottomLength: 41.0,
      inseam: 30.5,
      outseam: 41.5,
      crotch: 25.5,
      customFields: [],
      notes: 'Reception outfit: Velvet padded crop top with floor-touch georgette cape. High-waisted circular skirt.'
    },
    garmentSpecs: [
      {
        id: 'spec-110-1',
        garmentNumber: 1,
        category: 'Blouse',
        title: 'Crop Top 01: Emerald Green Velvet Padded Top',
        sleeveType: 'Sleeveless with Cape',
        garmentType: 'Padded Velvet Crop Top',
        slit: 'N/A',
        zip: 'Side Zip',
        lining: 'Yes',
        neckType: 'Design',
        frontNeckDesign: 'Sweetheart Neck with Crystal Edge',
        backNeckDesign: 'Deep V with Keyhole',
        frontHookOrBack: 'Side Zip',
        neckDepthNotes: 'Front 7.0 in, Back 8.0 in',
        fitting: 'M+',
        bottomStyle: 'Flared Circular Skirt',
        regionalStyle: 'Indo-Western Fusion',
        cuttingStatus: 'Pending',
        materials: [
          {
            id: 'mat-110-1',
            category: 'Top Material',
            name: 'Emerald Green Velvet',
            quantity: '1.2 Mtr',
            source: 'Self Material',
            receivedStatus: 'Pending',
            notes: 'Customer bringing tomorrow 10 AM'
          }
        ],
        referenceImages: [],
        customerInstructions: 'Attached georgette cape from shoulder seams',
        tailorInstructions: 'Ensure velvet pile is in downward direction on both panels',
        specialDesignNotes: ''
      }
    ],
    billing: {
      items: [
        { id: 'bi-110-1', itemName: 'Velvet Padded Crop Top with Cape', description: 'Floor length georgette attached cape', quantity: 1, rate: 2600, amount: 2600 },
        { id: 'bi-110-2', itemName: 'High-Waist Circular Umbrella Skirt', description: 'With double satin lining & stiff can-can', quantity: 1, rate: 3200, amount: 3200 },
        { id: 'bi-110-3', itemName: 'Crystal Edging Workmanship', description: 'Hand sewn crystal neckline border', quantity: 1, rate: 700, amount: 700 }
      ],
      additionalCharges: { stitchingCharges: 0, materialCharges: 0, designCharges: 500, otherCharges: 0, discount: 500 },
      subtotal: 6500,
      grandTotal: 6500,
      advanceAmount: 3500,
      amountPaid: 3500,
      balanceAmount: 3000,
      paymentMethod: 'UPI',
      paymentStatus: 'PARTIAL',
      orderDate: '2026-11-15',
      dueDate: '2026-11-26',
      priority: 'Urgent',
      deliveryNotes: 'Reception order. Highly time sensitive.',
      referralId: '',
      referredBy: '',
      referralNotes: ''
    }
  }
];

// Master Tailors Directory
export const FOUR_MASTER_TAILORS: Tailor[] = [
  {
    id: 'T-001',
    name: 'Rahim Bhai',
    phone: '9840123456',
    specialization: 'Blouse Specialist',
    experience: '18 Years',
    pieceRate: 450,
    availability: 'Available',
    notes: 'Master in bridal silk, princess cut, and aari work alignment.'
  },
  {
    id: 'T-002',
    name: 'Fatima Begum',
    phone: '9840654321',
    specialization: 'Kurti Specialist',
    experience: '12 Years',
    pieceRate: 500,
    availability: 'Available',
    notes: 'Expert in designer necklines, collar kurtis, and straight cuts.'
  },
  {
    id: 'T-003',
    name: 'Murugan Master',
    phone: '9840789012',
    specialization: 'Salwar Specialist',
    experience: '15 Years',
    pieceRate: 400,
    availability: 'Available',
    notes: 'Specialist in churidar gatherings, patiala pleats, and trousers.'
  },
  {
    id: 'T-004',
    name: 'Ramesh K.',
    phone: '9840345678',
    specialization: 'Saree / Falls',
    experience: '8 Years',
    pieceRate: 200,
    availability: 'Busy',
    notes: 'Handles high-speed pico, falls, and delicate hem finishes.'
  }
];

// Helper to escape CSV strings
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Function to generate CSV files
export function generateCsvFiles(outputDir: string) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Customers Dataset CSV
  const customersHeader = [
    'Customer ID',
    'Bill Number',
    'Customer Name',
    'Relationship Type',
    'Relative Name',
    'Primary Phone',
    'Secondary Phone',
    'Address',
    'Area Location',
    'Order Date',
    'Due Date',
    'Priority'
  ];
  const customersRows = TEN_SAMPLE_ORDERS.map(o => [
    escapeCsv(o.customer.customerId),
    escapeCsv(o.customer.billNumber),
    escapeCsv(o.customer.customerName),
    escapeCsv(o.customer.relationshipType),
    escapeCsv(o.customer.fatherName || o.customer.husbandName),
    escapeCsv(o.customer.primaryPhone),
    escapeCsv(o.customer.secondaryPhone),
    escapeCsv(o.customer.fullAddress),
    escapeCsv(o.customer.areaLocation),
    escapeCsv(o.customer.date),
    escapeCsv(o.billing.dueDate),
    escapeCsv(o.billing.priority)
  ].join(','));
  fs.writeFileSync(
    path.join(outputDir, 'customers_dataset.csv'),
    [customersHeader.join(','), ...customersRows].join('\n'),
    'utf-8'
  );

  // 2. Measurements Dataset CSV
  const measurementsHeader = [
    'Customer ID',
    'Customer Name',
    'Unit',
    'Shoulder',
    'Chest',
    'Bust',
    'Upper Bust',
    'Under Bust',
    'Waist',
    'Hip',
    'Armhole',
    'Sleeve Length',
    'Sleeve Round',
    'Bicep',
    'Blouse Length',
    'Top Length',
    'Front Neck Depth',
    'Back Neck Depth',
    'Front Neck Width',
    'Back Neck Width',
    'Bottom Length',
    'Inseam',
    'Outseam',
    'Special Fitting Notes'
  ];
  const measurementsRows = TEN_SAMPLE_ORDERS.map(o => {
    const m = o.measurements;
    return [
      escapeCsv(o.customer.customerId),
      escapeCsv(o.customer.customerName),
      escapeCsv(m.unit),
      m.shoulder,
      m.chest,
      m.bust,
      m.upperBust,
      m.underBust,
      m.waist,
      m.hip,
      m.armhole,
      m.sleeveLength,
      m.sleeveRound,
      m.bicep,
      m.blouseLength,
      m.topLength,
      m.frontNeckDepth,
      m.backNeckDepth,
      m.frontNeckWidth,
      m.backNeckWidth,
      m.bottomLength,
      m.inseam,
      m.outseam,
      escapeCsv(m.notes)
    ].join(',');
  });
  fs.writeFileSync(
    path.join(outputDir, 'measurements_dataset.csv'),
    [measurementsHeader.join(','), ...measurementsRows].join('\n'),
    'utf-8'
  );

  // 3. Orders Master Summary CSV
  const ordersHeader = [
    'Order ID',
    'Serial Number',
    'Customer Name',
    'Primary Phone',
    'Order Date',
    'Due Date',
    'Priority',
    'Workflow Status',
    'Cutting Status',
    'Total Garments',
    'Subtotal (INR)',
    'Advance Paid (INR)',
    'Balance Due (INR)',
    'Payment Method',
    'Assigned Cutting Master',
    'Delivery Notes'
  ];
  const ordersRows = TEN_SAMPLE_ORDERS.map(o => {
    const totalQty = o.garmentQuantities.reduce((sum, g) => sum + g.quantity, 0);
    return [
      escapeCsv(o.id),
      escapeCsv(o.serialNumber),
      escapeCsv(o.customer.customerName),
      escapeCsv(o.customer.primaryPhone),
      escapeCsv(o.billing.orderDate),
      escapeCsv(o.billing.dueDate),
      escapeCsv(o.billing.priority),
      escapeCsv(o.status),
      escapeCsv(o.cuttingDetails?.status || 'NEW'),
      totalQty,
      o.billing.grandTotal,
      o.billing.advanceAmount,
      o.billing.balanceAmount,
      escapeCsv(o.billing.paymentMethod),
      escapeCsv(o.cuttingDetails?.assignedMaster || 'Unassigned'),
      escapeCsv(o.billing.deliveryNotes)
    ].join(',');
  });
  fs.writeFileSync(
    path.join(outputDir, 'orders_master_dataset.csv'),
    [ordersHeader.join(','), ...ordersRows].join('\n'),
    'utf-8'
  );

  // 4. Garments Manifest & Specifications CSV
  const specsHeader = [
    'Order ID',
    'Customer Name',
    'Garment Number',
    'Category',
    'Garment Title',
    'Garment Type / Cut',
    'Sleeve Type',
    'Front Neck Design',
    'Back Neck Design',
    'Hook/Opening',
    'Lining',
    'Fitting',
    'Cutting Status',
    'Stitching Status',
    'Assigned Tailor',
    'Piece Rate (INR)',
    'Customer Special Instructions'
  ];
  const specsRows: string[] = [];
  TEN_SAMPLE_ORDERS.forEach(o => {
    o.garmentSpecs.forEach(spec => {
      specsRows.push([
        escapeCsv(o.id),
        escapeCsv(o.customer.customerName),
        spec.garmentNumber,
        escapeCsv(spec.category),
        escapeCsv(spec.title),
        escapeCsv(spec.garmentType),
        escapeCsv(spec.sleeveType),
        escapeCsv(spec.frontNeckDesign),
        escapeCsv(spec.backNeckDesign),
        escapeCsv(spec.frontHookOrBack),
        escapeCsv(spec.lining),
        escapeCsv(spec.fitting),
        escapeCsv(spec.cuttingStatus),
        escapeCsv(spec.stitchingDetails?.status || 'PENDING'),
        escapeCsv(spec.stitchingDetails?.tailorName || 'Unassigned'),
        spec.stitchingDetails?.pieceRate || 0,
        escapeCsv(spec.customerInstructions)
      ].join(','));
    });
  });
  fs.writeFileSync(
    path.join(outputDir, 'garments_manifest_dataset.csv'),
    [specsHeader.join(','), ...specsRows].join('\n'),
    'utf-8'
  );

  // 5. Consolidated Master Dataset CSV
  const masterHeader = [
    'Order ID',
    'Serial Number',
    'Status',
    'Customer ID',
    'Customer Name',
    'Phone',
    'Area Location',
    'Order Date',
    'Due Date',
    'Priority',
    'Shoulder',
    'Chest',
    'Bust',
    'Waist',
    'Hip',
    'Armhole',
    'Sleeve Length',
    'Blouse Length',
    'Top Length',
    'Front Neck',
    'Back Neck',
    'Total Items',
    'Grand Total',
    'Advance Paid',
    'Balance Due',
    'Payment Status'
  ];
  const masterRows = TEN_SAMPLE_ORDERS.map(o => {
    const totalQty = o.garmentQuantities.reduce((sum, g) => sum + g.quantity, 0);
    const m = o.measurements;
    return [
      escapeCsv(o.id),
      escapeCsv(o.serialNumber),
      escapeCsv(o.status),
      escapeCsv(o.customer.customerId),
      escapeCsv(o.customer.customerName),
      escapeCsv(o.customer.primaryPhone),
      escapeCsv(o.customer.areaLocation),
      escapeCsv(o.billing.orderDate),
      escapeCsv(o.billing.dueDate),
      escapeCsv(o.billing.priority),
      m.shoulder,
      m.chest,
      m.bust,
      m.waist,
      m.hip,
      m.armhole,
      m.sleeveLength,
      m.blouseLength,
      m.topLength,
      m.frontNeckDepth,
      m.backNeckDepth,
      totalQty,
      o.billing.grandTotal,
      o.billing.advanceAmount,
      o.billing.balanceAmount,
      escapeCsv(o.billing.paymentStatus)
    ].join(',');
  });
  fs.writeFileSync(
    path.join(outputDir, 'giriraj_garments_10_sample_master.csv'),
    [masterHeader.join(','), ...masterRows].join('\n'),
    'utf-8'
  );

  console.log(`✓ 5 CSV Dataset files successfully generated in: ${outputDir}`);
}

// Main execution function
async function main() {
  console.log('====================================================');
  console.log('GIRIRAJ GARMENTS — DATABASE PURGE & 10 SAMPLE SEED');
  console.log('====================================================');

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`✓ Connected to Database: [${mongoose.connection.name}] on host [${mongoose.connection.host}]`);

    // 1. DELETE EXISTING DATABASE ORDERS & TAILORS
    console.log('\n[1/4] Purging existing database collections...');
    const deletedOrders = await OrderModel.deleteMany({});
    const deletedTailors = await TailorModel.deleteMany({});
    console.log(`✓ Successfully deleted ${deletedOrders.deletedCount} orders from MongoDB`);
    console.log(`✓ Successfully deleted ${deletedTailors.deletedCount} tailors from MongoDB`);

    // 2. SEED 10 NEW DETAILED SAMPLE ORDERS
    console.log('\n[2/4] Seeding 10 new comprehensive sample orders...');
    const insertedOrders = await OrderModel.insertMany(TEN_SAMPLE_ORDERS);
    console.log(`✓ Successfully seeded ${insertedOrders.length} orders into MongoDB Atlas!`);

    // 3. SEED MASTER TAILORS
    console.log('\n[3/4] Seeding 4 Master Tailors...');
    const insertedTailors = await TailorModel.insertMany(FOUR_MASTER_TAILORS);
    console.log(`✓ Successfully seeded ${insertedTailors.length} tailors into MongoDB Atlas!`);

    // 4. GENERATE CSV FILES IN DATASET FOLDER
    const datasetDir = path.resolve(__dirname, '../dataset');
    console.log(`\n[4/4] Generating CSV datasets in: ${datasetDir}...`);
    generateCsvFiles(datasetDir);

    console.log('\n====================================================');
    console.log('🎉 DATABASE PURGE, 10-ORDER SEEDING & CSV CREATION COMPLETED!');
    console.log('====================================================\n');
  } catch (error: any) {
    console.error('❌ Error during purge and seed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('seedDatabase.ts')) {
  main();
}
