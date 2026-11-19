import React from 'react';
import { Check } from 'lucide-react';

// =========================================================================
// SVG VECTOR DRAWINGS FOR TAILORING PATTERNS (HIGH CONTRAST & CLEAR SHAPES)
// =========================================================================

export interface StyleOption {
  id: string;
  label: string;
  sublabel: string;
  category: 'frontNeck' | 'backNeck' | 'sleeve' | 'garmentCut' | 'fastening' | 'regionalStyle';
  svg: React.ReactNode;
}

// 1. FRONT NECK SVG ILLUSTRATIONS
export const FRONT_NECK_OPTIONS: StyleOption[] = [
  {
    id: 'Sweetheart Neck',
    label: 'Sweetheart Neck',
    sublabel: 'Heart curve, bridal favorite',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Shoulders & Neck base */}
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        {/* Chest outline */}
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Sweetheart Neck Cut */}
        <path d="M38 28 Q44 55 50 48 Q56 55 62 28" className="stroke-[#147D75] fill-white" strokeWidth="3.5" />
        {/* Cleavage heart center pip */}
        <circle cx="50" cy="48" r="2" className="fill-[#147D75] stroke-none" />
      </svg>
    )
  },
  {
    id: 'Deep Round Neck',
    label: 'Deep Round Neck',
    sublabel: 'Classic deep circular curve',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Deep Round Curve */}
        <path d="M38 28 C38 65 62 65 62 28" className="stroke-[#147D75] fill-white" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'Standard Round Neck',
    label: 'Standard Round Neck',
    sublabel: 'Regular 6.0 in round',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Standard Round Curve */}
        <path d="M38 28 C38 52 62 52 62 28" className="stroke-[#147D75] fill-white" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'Deep U Neck',
    label: 'Deep U Neck',
    sublabel: 'Wide U-cut plunge',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Deep U */}
        <path d="M38 28 L38 50 C38 68 62 68 62 50 L62 28" className="stroke-[#147D75] fill-white" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'Square Neck',
    label: 'Square Neck',
    sublabel: 'Sharp 90° rectangular cut',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Square Cut */}
        <path d="M38 28 L38 54 L62 54 L62 28" className="stroke-[#147D75] fill-white" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'V-Neck / Plunge',
    label: 'V-Neck / Plunge',
    sublabel: 'Sharp triangular neckline',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* V Cut */}
        <path d="M38 28 L50 62 L62 28" className="stroke-[#147D75] fill-white" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'Paan Neck / Leaf Pattern',
    label: 'Paan / Betel Leaf',
    sublabel: 'Pointed sweet curve',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Paan Leaf Neck */}
        <path d="M38 28 Q46 45 42 52 L50 60 L58 52 Q54 45 62 28" className="stroke-[#147D75] fill-white" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'Boat Neck',
    label: 'Boat Neck',
    sublabel: 'Wide collarbone shallow cut',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Boat Neck */}
        <path d="M32 29 Q50 42 68 29" className="stroke-[#147D75] fill-white" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'Collar Neck / Chinese Collar',
    label: 'Chinese / Mandarin Collar',
    sublabel: 'Standing band collar',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Standing Collar */}
        <path d="M38 28 L40 14 Q50 16 60 14 L62 28" className="stroke-[#147D75] fill-teal-50" strokeWidth="3" />
        {/* V-slit below collar */}
        <path d="M48 28 L50 46 L52 28" className="stroke-[#147D75]" strokeWidth="3" />
      </svg>
    )
  },
  {
    id: 'Halter Neck',
    label: 'Halter Neck',
    sublabel: 'Shoulder-baring strap',
    category: 'frontNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Halter straps going around neck */}
        <path d="M42 16 L44 26 L24 45 L20 85 Q50 92 80 85 L76 45 L56 26 L58 16" className="stroke-[#147D75] fill-white" strokeWidth="3.5" />
      </svg>
    )
  }
];

// 2. BACK NECK SVG ILLUSTRATIONS
export const BACK_NECK_OPTIONS: StyleOption[] = [
  {
    id: 'Deep U-Shape with Dori',
    label: 'Deep U with Dori & Tassels',
    sublabel: 'Bridal back with latkans',
    category: 'backNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Back Shoulders */}
        <path d="M15 35 Q30 32 38 28 L40 20 Q50 22 60 20 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Deep U back cut */}
        <path d="M38 28 C38 78 62 78 62 28" className="stroke-[#092546] fill-white" strokeWidth="3.5" />
        {/* Dori horizontal tie cord */}
        <path d="M38 34 Q50 38 62 34" className="stroke-amber-600" strokeWidth="2" strokeDasharray="3 2" />
        {/* Latkans hanging down */}
        <path d="M48 36 L46 52 M52 36 L54 52" className="stroke-amber-600" strokeWidth="1.5" />
        <circle cx="46" cy="54" r="3" className="fill-amber-500 stroke-none" />
        <circle cx="54" cy="54" r="3" className="fill-amber-500 stroke-none" />
      </svg>
    )
  },
  {
    id: 'Pot Neck with Button Loop',
    label: 'Pot Neck (Matka Shape)',
    sublabel: 'Wide pot belly curve with button',
    category: 'backNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 20 Q50 22 60 20 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Pot Neck Opening */}
        <path d="M42 28 C30 45 30 68 50 68 C70 68 70 45 58 28" className="stroke-[#092546] fill-white" strokeWidth="3.5" />
        <circle cx="50" cy="27" r="2.5" className="fill-amber-600 stroke-none" />
      </svg>
    )
  },
  {
    id: 'Standard Round Back',
    label: 'Standard Round Back',
    sublabel: 'Comfort 7.0 in round',
    category: 'backNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 20 Q50 22 60 20 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        <path d="M38 28 C38 58 62 58 62 28" className="stroke-[#092546] fill-white" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'Square Back Neck',
    label: 'Square Back Neck',
    sublabel: 'Box cut with crisp angles',
    category: 'backNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 20 Q50 22 60 20 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        <path d="M38 28 L38 62 L62 62 L62 28" className="stroke-[#092546] fill-white" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'Teardrop Keyhole',
    label: 'Teardrop / Diamond Cut-Out',
    sublabel: 'High back with teardrop hole',
    category: 'backNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 20 Q50 22 60 20 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        <path d="M42 26 Q50 30 58 26" className="stroke-[#092546]" strokeWidth="3" />
        {/* Teardrop Hole */}
        <path d="M50 36 C42 46 42 58 50 62 C58 58 58 46 50 36 Z" className="stroke-[#092546] fill-white" strokeWidth="3" />
      </svg>
    )
  },
  {
    id: 'Backless with Dori',
    label: 'Backless with Cross Cords',
    sublabel: 'Sensual backless style with latkans',
    category: 'backNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Huge cut-out going down to waist */}
        <path d="M38 28 L32 75 L68 75 L62 28" className="stroke-[#092546] fill-white" strokeWidth="3.5" />
        {/* Cross Doris */}
        <path d="M36 38 L64 64 M64 38 L36 64" className="stroke-amber-600" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'Sheer Net Back',
    label: 'Sheer Net / Illusion Back',
    sublabel: 'Transparent net with buttons',
    category: 'backNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        {/* Net Area with grid pattern */}
        <path d="M36 28 C36 72 64 72 64 28 Z" className="stroke-sky-400 fill-sky-50/50" strokeWidth="2" strokeDasharray="3 3" />
        {/* Center Pearl Buttons */}
        <circle cx="50" cy="36" r="2" className="fill-slate-800" />
        <circle cx="50" cy="46" r="2" className="fill-slate-800" />
        <circle cx="50" cy="56" r="2" className="fill-slate-800" />
      </svg>
    )
  },
  {
    id: 'High Closed Neck',
    label: 'High Closed Back',
    sublabel: 'Full coverage conservative',
    category: 'backNeck',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 35 Q30 32 38 28 L40 18 Q50 20 60 18 L62 28 Q70 32 85 35" className="stroke-slate-300" strokeWidth="1.5" />
        <path d="M15 35 L20 85 Q50 92 80 85 L85 35" className="stroke-slate-200 fill-slate-50" strokeWidth="1.5" />
        <path d="M42 26 Q50 28 58 26" className="stroke-[#092546]" strokeWidth="3.5" />
      </svg>
    )
  }
];

// 3. SLEEVE STYLE SVG ILLUSTRATIONS
export const SLEEVE_STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'Elbow Length (10.5 in)',
    label: 'Elbow Length (10.5 in)',
    sublabel: 'Most popular bridal length',
    category: 'sleeve',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Body outline */}
        <path d="M45 15 L25 25 L35 70 L55 70" className="stroke-slate-200 fill-slate-50" />
        {/* Arm extending to elbow */}
        <path d="M25 25 L12 58 L28 62 L35 32" className="stroke-[#147D75] fill-teal-50" strokeWidth="3" />
        {/* Gold Border at hem */}
        <line x1="12" y1="58" x2="28" y2="62" className="stroke-amber-500" strokeWidth="4" />
        <text x="5" y="75" className="text-[9px] fill-[#147D75] font-bold stroke-none">10.5"</text>
      </svg>
    )
  },
  {
    id: 'Short Sleeve (5.5 in)',
    label: 'Short Sleeve (5.5 in)',
    sublabel: 'Standard daily short sleeve',
    category: 'sleeve',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 15 L25 25 L35 70 L55 70" className="stroke-slate-200 fill-slate-50" />
        {/* Short Arm Sleeve */}
        <path d="M25 25 L18 42 L32 45 L35 30" className="stroke-[#147D75] fill-teal-50" strokeWidth="3" />
        <line x1="18" y1="42" x2="32" y2="45" className="stroke-amber-500" strokeWidth="3.5" />
        <text x="8" y="55" className="text-[9px] fill-[#147D75] font-bold stroke-none">5.5"</text>
      </svg>
    )
  },
  {
    id: 'Mega Sleeve (3.5 in)',
    label: 'Mega / Cap Sleeve (3.5 in)',
    sublabel: 'Tiny cute cap on shoulder',
    category: 'sleeve',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 15 L25 25 L35 70 L55 70" className="stroke-slate-200 fill-slate-50" />
        {/* Mega Cap Sleeve */}
        <path d="M25 25 Q18 30 22 34 L33 32" className="stroke-[#147D75] fill-teal-50" strokeWidth="3" />
        <text x="8" y="44" className="text-[9px] fill-[#147D75] font-bold stroke-none">3.5"</text>
      </svg>
    )
  },
  {
    id: 'Sleeveless',
    label: 'Sleeveless (0 in)',
    sublabel: 'Clean armhole cut without sleeve',
    category: 'sleeve',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 15 L25 25 Q32 40 35 50 L35 70 L55 70" className="stroke-slate-300 fill-slate-50" />
        {/* Open Armhole Piping */}
        <path d="M25 25 Q32 38 35 50" className="stroke-rose-600" strokeWidth="3.5" />
        <text x="8" y="42" className="text-[8px] fill-rose-600 font-bold stroke-none">NO SLEEVE</text>
      </svg>
    )
  },
  {
    id: '3/4 Sleeve (16.0 in)',
    label: '3/4th Sleeve (16.0 in)',
    sublabel: 'Reaches below elbow to forearm',
    category: 'sleeve',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 15 L25 25 L35 70 L55 70" className="stroke-slate-200 fill-slate-50" />
        {/* 3/4th Sleeve */}
        <path d="M25 25 L10 74 L24 77 L35 32" className="stroke-[#147D75] fill-teal-50" strokeWidth="3" />
        <line x1="10" y1="74" x2="24" y2="77" className="stroke-amber-500" strokeWidth="4" />
        <text x="3" y="88" className="text-[9px] fill-[#147D75] font-bold stroke-none">16.0"</text>
      </svg>
    )
  },
  {
    id: 'Full Sleeve (21.0 in)',
    label: 'Full Sleeve (21.0 in)',
    sublabel: 'Touches wrist joint',
    category: 'sleeve',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 15 L25 25 L35 70 L55 70" className="stroke-slate-200 fill-slate-50" />
        {/* Full Sleeve to wrist */}
        <path d="M25 25 L6 88 L18 90 L35 32" className="stroke-[#147D75] fill-teal-50" strokeWidth="3" />
        <line x1="6" y1="88" x2="18" y2="90" className="stroke-amber-500" strokeWidth="4" />
        <text x="2" y="99" className="text-[9px] fill-[#147D75] font-bold stroke-none">21.0"</text>
      </svg>
    )
  },
  {
    id: 'Puff Sleeve',
    label: 'Puff / Bubble Sleeve',
    sublabel: 'Traditional gathered puff',
    category: 'sleeve',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 15 L25 25 L35 70 L55 70" className="stroke-slate-200 fill-slate-50" />
        {/* Bubble gathered puff */}
        <path d="M25 25 C10 20 8 45 16 50 L28 52 C32 45 35 35 35 30" className="stroke-[#147D75] fill-teal-50" strokeWidth="3" />
        <line x1="16" y1="50" x2="28" y2="52" className="stroke-amber-500" strokeWidth="3.5" />
      </svg>
    )
  }
];

// 4. GARMENT CUT & TYPE SVG ILLUSTRATIONS
export const GARMENT_CUT_STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'Princess Cut (Padded)',
    label: 'Princess Cut (Padded)',
    sublabel: 'Seamless curved dart with built-in pads',
    category: 'garmentCut',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 25 L35 20 L65 20 L80 25 L85 80 L15 80 Z" className="stroke-[#147D75] fill-teal-50/40" strokeWidth="2" />
        {/* Neck */}
        <path d="M42 20 C42 45 58 45 58 20" className="stroke-[#147D75] fill-white" strokeWidth="2.5" />
        {/* Princess Seams from Armhole to Hem */}
        <path d="M26 32 C38 48 38 70 36 80" className="stroke-[#147D75]" strokeWidth="3" />
        <path d="M74 32 C62 48 62 70 64 80" className="stroke-[#147D75]" strokeWidth="3" />
        {/* Padded Circles */}
        <circle cx="36" cy="52" r="6" className="stroke-rose-500 fill-rose-100/60" strokeDasharray="2 2" />
        <circle cx="64" cy="52" r="6" className="stroke-rose-500 fill-rose-100/60" strokeDasharray="2 2" />
      </svg>
    )
  },
  {
    id: 'Princess Cut (Non-Padded)',
    label: 'Princess Cut (Non-Padded)',
    sublabel: 'Smooth curved seams without pads',
    category: 'garmentCut',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 25 L35 20 L65 20 L80 25 L85 80 L15 80 Z" className="stroke-[#147D75] fill-teal-50/40" strokeWidth="2" />
        <path d="M42 20 C42 45 58 45 58 20" className="stroke-[#147D75] fill-white" strokeWidth="2.5" />
        <path d="M26 32 C38 48 38 70 36 80" className="stroke-[#147D75]" strokeWidth="3" />
        <path d="M74 32 C62 48 62 70 64 80" className="stroke-[#147D75]" strokeWidth="3" />
      </svg>
    )
  },
  {
    id: 'Bombay Cut / 4 Darts',
    label: '4-Tucks with Belt (Madras Cut)',
    sublabel: 'Traditional 4 darts with bottom waist patti',
    category: 'garmentCut',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 25 L35 20 L65 20 L80 25 L85 80 L15 80 Z" className="stroke-[#147D75] fill-teal-50/40" strokeWidth="2" />
        <path d="M42 20 C42 45 58 45 58 20" className="stroke-[#147D75] fill-white" strokeWidth="2.5" />
        {/* Waist Belt (Patti) */}
        <path d="M16 68 Q50 64 84 68 L85 80 L15 80 Z" className="stroke-[#092546] fill-amber-100" strokeWidth="2.5" />
        {/* 4 Darts */}
        <line x1="36" y1="64" x2="36" y2="46" className="stroke-[#092546]" strokeWidth="2" />
        <line x1="64" y1="64" x2="64" y2="46" className="stroke-[#092546]" strokeWidth="2" />
        <line x1="22" y1="52" x2="32" y2="52" className="stroke-[#092546]" strokeWidth="2" />
        <line x1="78" y1="52" x2="68" y2="52" className="stroke-[#092546]" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'Katori Blouse',
    label: 'Katori / Cup Cut',
    sublabel: 'Two-piece tailored round cup',
    category: 'garmentCut',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 25 L35 20 L65 20 L80 25 L85 80 L15 80 Z" className="stroke-[#147D75] fill-teal-50/40" strokeWidth="2" />
        <path d="M42 20 C42 45 58 45 58 20" className="stroke-[#147D75] fill-white" strokeWidth="2.5" />
        {/* Katori Cup Curves */}
        <path d="M22 66 C22 45 48 45 48 66" className="stroke-[#092546] fill-white" strokeWidth="2.5" />
        <path d="M52 66 C52 45 78 45 78 66" className="stroke-[#092546] fill-white" strokeWidth="2.5" />
        <path d="M16 68 L84 68 L85 80 L15 80 Z" className="stroke-[#092546] fill-amber-100" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'Straight Cut Kurti',
    label: 'Straight Cut Kurti',
    sublabel: 'Classic straight knee/calf length top',
    category: 'garmentCut',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 18 L40 15 L60 15 L70 18 L72 90 L28 90 Z" className="stroke-[#147D75] fill-teal-50/40" strokeWidth="2.5" />
        <path d="M45 15 C45 28 55 28 55 15" className="stroke-[#147D75] fill-white" strokeWidth="2" />
        {/* Side Slit Opening */}
        <line x1="28" y1="60" x2="28" y2="90" className="stroke-rose-600" strokeWidth="4" />
        <line x1="72" y1="60" x2="72" y2="90" className="stroke-rose-600" strokeWidth="4" />
      </svg>
    )
  },
  {
    id: 'Anarkali Cut',
    label: 'Anarkali / Kali Cut',
    sublabel: 'Flared multi-panel royal umbrella',
    category: 'garmentCut',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Flared Kalis */}
        <path d="M32 18 L68 18 L62 42 L88 92 L12 92 L38 42 Z" className="stroke-[#147D75] fill-teal-50/40" strokeWidth="2.5" />
        <line x1="50" y1="42" x2="50" y2="92" className="stroke-[#147D75]" strokeWidth="1.5" />
        <line x1="44" y1="42" x2="32" y2="92" className="stroke-[#147D75]" strokeWidth="1.5" />
        <line x1="56" y1="42" x2="68" y2="92" className="stroke-[#147D75]" strokeWidth="1.5" />
      </svg>
    )
  }
];

// 5. REGIONAL / TRADITIONAL STYLE OPTIONS
export const REGIONAL_STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'Tamil Bridal (Heavy Aari Work)',
    label: 'Tamil Bridal (Heavy Aari Work)',
    sublabel: 'Bridal Kanchipuram silk with gold zari borders',
    category: 'regionalStyle',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2">
        <rect x="15" y="15" width="70" height="70" rx="8" className="fill-amber-50 stroke-amber-500" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="18" className="stroke-amber-600 fill-amber-100" />
        <path d="M40 50 Q50 35 60 50 Q50 65 40 50" className="fill-amber-500 stroke-none" />
      </svg>
    )
  },
  {
    id: 'South Indian Traditional (Silk Border)',
    label: 'South Indian Traditional (Silk Border)',
    sublabel: 'Classic temple zari & contrast piping',
    category: 'regionalStyle',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2">
        <rect x="15" y="15" width="70" height="70" rx="8" className="fill-emerald-50 stroke-emerald-600" strokeWidth="2.5" />
        <path d="M25 70 L35 50 L45 70 L55 50 L65 70 L75 50" className="stroke-amber-600" strokeWidth="3" />
      </svg>
    )
  },
  {
    id: 'Banarasi Brocade / North Indian Festive',
    label: 'Banarasi Brocade / Festive',
    sublabel: 'Woven zari brocade partywear',
    category: 'regionalStyle',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2">
        <rect x="15" y="15" width="70" height="70" rx="8" className="fill-rose-50 stroke-rose-600" strokeWidth="2.5" />
        <path d="M30 30 L70 70 M70 30 L30 70" className="stroke-amber-500" strokeWidth="3" />
      </svg>
    )
  },
  {
    id: 'Brahmin Madisar 9-Yard Drape',
    label: 'Brahmin Madisar 9-Yard',
    sublabel: 'Authentic 9-yard drape traditional cut',
    category: 'regionalStyle',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2">
        <rect x="15" y="15" width="70" height="70" rx="8" className="fill-orange-50 stroke-orange-600" strokeWidth="2.5" />
        <path d="M25 50 C25 35 50 35 50 50 C50 65 75 65 75 50" className="stroke-orange-700" strokeWidth="4" />
      </svg>
    )
  },
  {
    id: 'Kerala Kasavu Gold Tissue',
    label: 'Kerala Kasavu Gold Tissue',
    sublabel: 'Off-white ivory silk with gold kasavu borders',
    category: 'regionalStyle',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2">
        <rect x="15" y="15" width="70" height="70" rx="8" className="fill-amber-50/50 stroke-amber-400" strokeWidth="2.5" />
        <line x1="15" y1="35" x2="85" y2="35" className="stroke-amber-600" strokeWidth="6" />
      </svg>
    )
  },
  {
    id: 'Bollywood Partywear Designer',
    label: 'Bollywood Partywear Designer',
    sublabel: 'Trendy designer cuts & modern silhouettes',
    category: 'regionalStyle',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2">
        <rect x="15" y="15" width="70" height="70" rx="8" className="fill-purple-50 stroke-purple-600" strokeWidth="2.5" />
        <polygon points="50,22 58,40 78,42 63,55 68,74 50,62 32,74 37,55 22,42 42,40" className="fill-purple-500 stroke-none" />
      </svg>
    )
  },
  {
    id: 'Classic Everyday Regular',
    label: 'Classic Everyday Regular',
    sublabel: 'Simple comfortable daily cotton wear',
    category: 'regionalStyle',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2">
        <rect x="15" y="15" width="70" height="70" rx="8" className="fill-slate-50 stroke-slate-400" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="14" className="stroke-slate-500" strokeWidth="3" />
      </svg>
    )
  }
];

// 6. FASTENING / CLOSURE OPTIONS
export const FASTENING_OPTIONS: StyleOption[] = [
  {
    id: 'Front Hook',
    label: 'Front Hook with Patti',
    sublabel: 'Traditional front open with 5 eyelets',
    category: 'fastening',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2.5">
        <rect x="25" y="15" width="50" height="70" rx="4" className="fill-slate-50 stroke-slate-300" />
        <line x1="50" y1="15" x2="50" y2="85" className="stroke-slate-700" strokeWidth="2" />
        <circle cx="50" cy="30" r="3" className="fill-[#147D75]" />
        <circle cx="50" cy="45" r="3" className="fill-[#147D75]" />
        <circle cx="50" cy="60" r="3" className="fill-[#147D75]" />
        <circle cx="50" cy="75" r="3" className="fill-[#147D75]" />
      </svg>
    )
  },
  {
    id: 'Back Hook',
    label: 'Back Hook with Eye Plate',
    sublabel: 'Neat seamless front finish',
    category: 'fastening',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2.5">
        <rect x="25" y="15" width="50" height="70" rx="4" className="fill-slate-50 stroke-slate-300" />
        <line x1="50" y1="15" x2="50" y2="85" className="stroke-slate-700" strokeWidth="2" />
        <path d="M47 30 L53 30 M47 45 L53 45 M47 60 L53 60 M47 75 L53 75" className="stroke-[#092546]" strokeWidth="3" />
      </svg>
    )
  },
  {
    id: 'Side Zip',
    label: 'Concealed Side Zipper',
    sublabel: 'Invisible left-seam zipper',
    category: 'fastening',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2.5">
        <path d="M30 15 L70 15 L70 85 L30 85 Z" className="fill-slate-50 stroke-slate-300" />
        {/* Zipper Teeth on side seam */}
        <line x1="30" y1="25" x2="30" y2="75" className="stroke-[#147D75]" strokeWidth="4" />
        <circle cx="30" cy="35" r="3.5" className="fill-amber-500 stroke-none" />
      </svg>
    )
  },
  {
    id: 'Side Hook',
    label: 'Side Hook Placket',
    sublabel: 'Hook eyelets under left armhole',
    category: 'fastening',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2.5">
        <path d="M30 15 L70 15 L70 85 L30 85 Z" className="fill-slate-50 stroke-slate-300" />
        <circle cx="30" cy="40" r="2.5" className="fill-slate-900" />
        <circle cx="30" cy="50" r="2.5" className="fill-slate-900" />
        <circle cx="30" cy="60" r="2.5" className="fill-slate-900" />
      </svg>
    )
  },
  {
    id: 'Elastic',
    label: 'Elastic / Slip-on',
    sublabel: 'Stretchable gathered opening',
    category: 'fastening',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2.5">
        <rect x="25" y="25" width="50" height="50" rx="4" className="fill-slate-50 stroke-slate-300" />
        <path d="M25 35 Q30 30 35 35 Q40 40 45 35 Q50 30 55 35 Q60 40 65 35 Q70 30 75 35" className="stroke-indigo-600" strokeWidth="3" />
      </svg>
    )
  }
];

// Helper to find preview drawing for any given value
export function getVisualDiagram(category: StyleOption['category'], value: string) {
  let list: StyleOption[] = [];
  switch (category) {
    case 'frontNeck':
      list = FRONT_NECK_OPTIONS;
      break;
    case 'backNeck':
      list = BACK_NECK_OPTIONS;
      break;
    case 'sleeve':
      list = SLEEVE_STYLE_OPTIONS;
      break;
    case 'garmentCut':
      list = GARMENT_CUT_STYLE_OPTIONS;
      break;
    case 'regionalStyle':
      list = REGIONAL_STYLE_OPTIONS;
      break;
    case 'fastening':
      list = FASTENING_OPTIONS;
      break;
  }
  // Search exact or partial match
  const found = list.find(opt => 
    opt.id.toLowerCase() === (value || '').toLowerCase() || 
    (value || '').toLowerCase().includes(opt.id.toLowerCase().split(' ')[0])
  );
  return found || list[0];
}

// Visual Gallery Modal Picker for illiterate / fast-touch selection
interface VisualPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: StyleOption[];
  selectedValue: string;
  onSelect: (val: string) => void;
}

export const VisualPickerModal: React.FC<VisualPickerModalProps> = ({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#092546] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400 text-teal-300 flex items-center justify-center font-bold text-lg">
              🖼️
            </div>
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-xs text-slate-300">Tap on any picture to select the pattern immediately</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-black transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Visual Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 bg-slate-50">
          {options.map((opt) => {
            const isSelected = selectedValue.toLowerCase() === opt.id.toLowerCase() || selectedValue.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSelect(opt.id);
                  onClose();
                }}
                className={`relative flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all cursor-pointer group bg-white shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-[#147D75] ring-4 ring-[#147D75]/20 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#147D75] text-white flex items-center justify-center shadow">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                )}

                {/* SVG Visual Diagram Box */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 p-2 mb-2 flex items-center justify-center bg-slate-50 rounded-lg group-hover:scale-105 transition-transform">
                  {opt.svg}
                </div>

                <span className="text-[15px] font-black text-slate-900 leading-tight">
                  {opt.label}
                </span>
                <span className="text-[12px] text-slate-500 mt-1 line-clamp-1">
                  {opt.sublabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Visual Reference Guide • Designed for easy shop floor selection
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
