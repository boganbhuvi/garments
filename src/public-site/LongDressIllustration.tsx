import React from 'react';

export interface LongDressMeasurementDef {
  num: number;
  key: string;
  label: string;
  guidance: string;
}

export const LONG_DRESS_MEASUREMENTS: readonly LongDressMeasurementDef[] = [
  { num: 1, key: 'shoulder', label: 'Shoulder', guidance: 'Measure straight across the top back from one shoulder bone edge to the other.' },
  { num: 2, key: 'length', label: 'Length', guidance: 'Measure straight down from the highest point of the shoulder to your desired dress hem length.' },
  { num: 3, key: 'xFront', label: 'X Front', guidance: 'Measure horizontally across the upper front chest between the front armhole creases.' },
  { num: 4, key: 'bust', label: 'Bust', guidance: 'Measure around the fullest part of the bust, keeping the tape level and comfortable.' },
  { num: 5, key: 'underBust', label: 'Under Bust', guidance: 'Measure snugly around the ribcage directly underneath the bust.' },
  { num: 6, key: 'waist', label: 'Waist', guidance: 'Measure around the narrowest part of your natural waistline.' },
  { num: 7, key: 'lowWaist', label: 'Low Waist', guidance: 'Measure horizontally around the lower waist, roughly 2–3 inches below the natural waist.' },
  { num: 8, key: 'hips', label: 'Hips', guidance: 'Measure around the fullest part of the hips with feet together.' },
  { num: 9, key: 'slvFullLength', label: 'SLV Full Length', guidance: 'Measure from the shoulder tip along the outer arm down to the wrist.' },
  { num: 10, key: 'armHole', label: 'Arm Hole', guidance: 'Measure all the way around the shoulder joint where the sleeve meets the bodice.' },
  { num: 11, key: 'muscle', label: 'Muscle', guidance: 'Measure around the fullest part of the upper arm (bicep).' },
  { num: 12, key: 'elbow', label: 'Elbow', guidance: 'Measure around the arm at the elbow with the arm slightly bent.' },
  { num: 13, key: 'cuff', label: 'Cuff', guidance: 'Measure around the wrist where the sleeve cuff will sit.' },
] as const;

interface LongDressIllustrationProps {
  activeNum: number | null;
  completedNums: Set<number>;
  onSelectNum: (num: number) => void;
}

export const LongDressIllustration: React.FC<LongDressIllustrationProps> = ({
  activeNum,
  completedNums,
  onSelectNum,
}) => {
  const isActive = (n: number) => activeNum === n;
  const isDone = (n: number) => completedNums.has(n);

  const lineStroke = (n: number) =>
    isActive(n) ? '#7F1D1D' : isDone(n) ? '#15803D' : '#57534E';
  const lineWidth = (n: number) => (isActive(n) ? 2.6 : 1.35);
  const lineDash = (n: number) => (isActive(n) ? undefined : '4 3');

  const Marker = ({
    num,
    cx,
    cy,
  }: {
    num: number;
    cx: number;
    cy: number;
  }) => {
    const active = isActive(num);
    const done = isDone(num);
    return (
      <g
        onClick={() => onSelectNum(num)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`Measurement ${num}: ${LONG_DRESS_MEASUREMENTS[num - 1].label}`}
      >
        {active && (
          <circle cx={cx} cy={cy} r={15} fill="#7F1D1D" fillOpacity={0.14} />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={11}
          fill={active ? '#7F1D1D' : done ? '#15803D' : '#FFFFFF'}
          stroke={active ? '#7F1D1D' : done ? '#15803D' : '#292524'}
          strokeWidth={active ? 2 : 1.5}
        />
        <text
          x={cx}
          y={cy + 3.8}
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={active || done ? '#FFFFFF' : '#1C1917'}
        >
          {num}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-[#FAF8F5] rounded-2xl border border-[#E7E5E4] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#7F1D1D]">
          Front-View Measurement Guide
        </span>
        <span className="text-[11px] text-[#78716C] font-medium">
          Tap any number (1–13)
        </span>
      </div>

      <svg
        viewBox="0 0 360 490"
        className="w-full max-w-[360px] mx-auto h-auto select-none"
        role="img"
        aria-label="Long Dress 13-point front-view tailoring measurement illustration"
      >
        {/* Subtle studio grid backdrop */}
        <rect x="6" y="6" width="348" height="478" rx="14" fill="#FFFFFF" stroke="#E7E5E4" strokeWidth="1" />

        {/* Stylized Head & Neck (tailoring croquis) */}
        <ellipse cx="180" cy="40" rx="16" ry="20" fill="#F5F5F4" stroke="#A8A29E" strokeWidth="1.2" />
        <path d="M172 58 L172 72 L188 72 L188 58" fill="#F5F5F4" stroke="#A8A29E" strokeWidth="1.2" />

        {/* Long Dress Silhouette (Front View with Full Sleeves) */}
        <path
          d="
            M172 70
            Q180 78 188 70
            L226 82
            L258 242
            L242 246
            L220 128
            L214 156
            L204 196
            L214 234
            L248 446
            L112 446
            L146 234
            L156 196
            L146 156
            L140 128
            L118 246
            L102 242
            L134 82
            Z
          "
          fill="#FDFBF7"
          stroke="#292524"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        {/* Subtle center front seam & neckline detail */}
        <path d="M164 72 Q180 94 196 72" fill="none" stroke="#78716C" strokeWidth="1.2" />
        <line x1="180" y1="84" x2="180" y2="446" stroke="#E7E5E4" strokeWidth="1" strokeDasharray="3 4" />

        {/* 1 — Shoulder */}
        <line
          x1="134" y1="82" x2="226" y2="82"
          stroke={lineStroke(1)} strokeWidth={lineWidth(1)} strokeDasharray={lineDash(1)}
        />
        <circle cx="134" cy="82" r="2.5" fill={lineStroke(1)} />
        <circle cx="226" cy="82" r="2.5" fill={lineStroke(1)} />
        <Marker num={1} cx={180} cy={66} />

        {/* 2 — Length (vertical shoulder to hem on left side) */}
        <line
          x1="74" y1="74" x2="74" y2="446"
          stroke={lineStroke(2)} strokeWidth={lineWidth(2)} strokeDasharray={lineDash(2)}
        />
        <line x1="70" y1="74" x2="156" y2="74" stroke={lineStroke(2)} strokeWidth="1" strokeDasharray="2 3" />
        <line x1="70" y1="446" x2="112" y2="446" stroke={lineStroke(2)} strokeWidth="1" strokeDasharray="2 3" />
        <Marker num={2} cx={54} cy={260} />

        {/* 3 — X Front */}
        <line
          x1="145" y1="108" x2="215" y2="108"
          stroke={lineStroke(3)} strokeWidth={lineWidth(3)} strokeDasharray={lineDash(3)}
        />
        <Marker num={3} cx={180} cy={104} />

        {/* 4 — Bust */}
        <line
          x1="142" y1="134" x2="218" y2="134"
          stroke={lineStroke(4)} strokeWidth={lineWidth(4)} strokeDasharray={lineDash(4)}
        />
        <Marker num={4} cx={180} cy={134} />

        {/* 5 — Under Bust */}
        <line
          x1="147" y1="160" x2="213" y2="160"
          stroke={lineStroke(5)} strokeWidth={lineWidth(5)} strokeDasharray={lineDash(5)}
        />
        <Marker num={5} cx={180} cy={160} />

        {/* 6 — Waist */}
        <line
          x1="156" y1="192" x2="204" y2="192"
          stroke={lineStroke(6)} strokeWidth={lineWidth(6)} strokeDasharray={lineDash(6)}
        />
        <Marker num={6} cx={180} cy={192} />

        {/* 7 — Low Waist */}
        <line
          x1="149" y1="220" x2="211" y2="220"
          stroke={lineStroke(7)} strokeWidth={lineWidth(7)} strokeDasharray={lineDash(7)}
        />
        <Marker num={7} cx={180} cy={220} />

        {/* 8 — Hips */}
        <line
          x1="142" y1="252" x2="218" y2="252"
          stroke={lineStroke(8)} strokeWidth={lineWidth(8)} strokeDasharray={lineDash(8)}
        />
        <Marker num={8} cx={180} cy={252} />

        {/* 9 — SLV Full Length (along right sleeve outer edge) */}
        <line
          x1="234" y1="80" x2="268" y2="240"
          stroke={lineStroke(9)} strokeWidth={lineWidth(9)} strokeDasharray={lineDash(9)}
        />
        <Marker num={9} cx={288} cy={146} />

        {/* 10 — Arm Hole */}
        <path
          d="M226 82 Q212 106 220 128"
          fill="none"
          stroke={lineStroke(10)}
          strokeWidth={lineWidth(10)}
        />
        <Marker num={10} cx={244} cy={92} />

        {/* 11 — Muscle */}
        <line
          x1="223" y1="138" x2="241" y2="134"
          stroke={lineStroke(11)} strokeWidth={lineWidth(11)}
        />
        <Marker num={11} cx={264} cy={118} />

        {/* 12 — Elbow */}
        <line
          x1="231" y1="184" x2="249" y2="180"
          stroke={lineStroke(12)} strokeWidth={lineWidth(12)}
        />
        <Marker num={12} cx={274} cy={182} />

        {/* 13 — Cuff */}
        <line
          x1="242" y1="246" x2="258" y2="242"
          stroke={lineStroke(13)} strokeWidth={lineWidth(13)}
        />
        <Marker num={13} cx={280} cy={244} />
      </svg>
    </div>
  );
};
