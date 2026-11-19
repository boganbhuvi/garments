import { GarmentQuantityItem, MeasurementRecord, MaterialItem, GarmentSpecification } from '../types/order';

export const INITIAL_GARMENT_CATEGORIES: GarmentQuantityItem[] = [
  { id: 'cat-blouses', category: 'Blouses', label: 'Blouses', quantity: 0 },
  { id: 'cat-kurtis', category: 'Kurtis', label: 'Kurtis / Tops', quantity: 0 },
  { id: 'cat-bottoms', category: 'Bottoms', label: 'Bottoms / Pants', quantity: 0 },
  { id: 'cat-churidar', category: 'Churidar', label: 'Churidar Sets', quantity: 0 },
  { id: 'cat-salwar', category: 'Salwar', label: 'Salwar Suits', quantity: 0 },
  { id: 'cat-sarees', category: 'Sarees', label: 'Sarees (Pico / Falls)', quantity: 0 },
  { id: 'cat-falls', category: 'Falls', label: 'Falls Attachment', quantity: 0 },
  { id: 'cat-nighties', category: 'Nighties', label: 'Nighties / Gowns', quantity: 0 },
  { id: 'cat-dupatta', category: 'Dupatta', label: 'Dupatta Finish', quantity: 0 },
  { id: 'cat-other', category: 'Other Items', label: 'Other Custom Items', quantity: 0 },
];

export const EMPTY_MEASUREMENTS: MeasurementRecord = {
  id: 'meas-default',
  name: 'Current Order Measurements',
  unit: 'in',
  date: new Date().toISOString().split('T')[0],
  shoulder: '',
  chest: '',
  bust: '',
  upperBust: '',
  underBust: '',
  waist: '',
  hip: '',
  armhole: '',
  sleeveLength: '',
  sleeveRound: '',
  bicep: '',
  elbow: '',
  wrist: '',
  blouseLength: '',
  topLength: '',
  frontLength: '',
  backLength: '',
  frontNeckDepth: '',
  backNeckDepth: '',
  frontNeckWidth: '',
  backNeckWidth: '',
  lowerWaist: '',
  lowerHip: '',
  thigh: '',
  knee: '',
  calf: '',
  ankle: '',
  bottomLength: '',
  inseam: '',
  outseam: '',
  crotch: '',
  customFields: [
    { id: 'cf-1', code: 'AH', label: 'Armhole Depth (AH)', value: '', note: 'Standard tailoring armhole drop' },
    { id: 'cf-2', code: 'BH', label: 'Blouse Height (BH)', value: '', note: 'Shoulder to waistband' },
    { id: 'cf-3', code: 'SL', label: 'Sleeve Length (SL)', value: '', note: 'Shoulder point to sleeve hem' },
    { id: 'cf-4', code: 'FNN', label: 'Front Neck Normal (FNN)', value: '', note: 'Neck point to front cleavage curve' },
    { id: 'cf-5', code: 'BN', label: 'Back Neck (BN)', value: '', note: 'Center back drop' },
    { id: 'cf-6', code: 'SH', label: 'Shoulder Seam (SH)', value: '', note: 'Shoulder bone to shoulder bone' },
  ],
  notes: '',
};

export const SLEEVE_OPTIONS = [
  'Mega Sleeve (3.5 in)',
  '1/4 Sleeve (5.5 in)',
  'Elbow Length (10.5 in)',
  '3/4 Sleeve (16.0 in)',
  'Full Sleeve (21.0 in)',
  'Sleeveless',
  'Puff Sleeve',
  'Custom Sleeve'
];

export const GARMENT_CUT_OPTIONS = [
  'Princess Cut (Padded)',
  'Princess Cut (Non-Padded)',
  'SH Top (Shoulder Top)',
  'J Top',
  'Long Top (A-Line)',
  'FH (Full Height)',
  'SKT Top (Skirt Top)',
  'Bombay Cut / 4 Darts',
  'Madras Cut / Cross Cut',
  'Katori Blouse',
  'Straight Cut Kurti',
  'Anarkali Cut',
  'Custom Cut'
];

export const NECK_PATTERNS = [
  'Sweetheart Neck',
  'Round Neck',
  'Square Neck',
  'Deep U Neck',
  'V-Neck / Plunge',
  'Boat Neck',
  'Collar Neck / Chinese Collar',
  'Pot Neck with Dori',
  'Paan Neck / Leaf Pattern',
  'Halter Neck',
  'Designer Patchwork'
];

export const BOTTOM_STYLES = [
  'Salwar (Normal Pleats)',
  'Gathering / Churidar Tight',
  'Punjabi Salwar',
  'Patiala (Heavy Pleats)',
  'Semi-Patiala',
  'Palazzo Flared',
  'Straight Cigarette Pant',
  'Dhoti Pant',
  'Custom'
];
