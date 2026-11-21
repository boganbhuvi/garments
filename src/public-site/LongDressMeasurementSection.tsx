import React, { useState, useRef } from 'react';
import {
  LongDressIllustration,
  LONG_DRESS_MEASUREMENTS,
} from './LongDressIllustration';
import { HelpCircle, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export type MeasurementUnit = 'in' | 'cm';

export interface LongDressMeasurementValues {
  [key: string]: string;
}

export function validateLongDressMeasurement(raw: string): string | null {
  const trimmed = (raw || '').trim();
  if (!trimmed) return 'Required';
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return 'Enter a valid positive number';
  const num = parseFloat(trimmed);
  if (isNaN(num) || num <= 0) return 'Must be greater than 0';
  return null;
}

export function areAllLongDressMeasurementsValid(values: LongDressMeasurementValues): boolean {
  return LONG_DRESS_MEASUREMENTS.every((m) => validateLongDressMeasurement(values[m.key] || '') === null);
}

interface LongDressMeasurementSectionProps {
  values: LongDressMeasurementValues;
  unit: MeasurementUnit;
  onChangeValues: (next: LongDressMeasurementValues) => void;
  onChangeUnit: (unit: MeasurementUnit) => void;
  onBack: () => void;
  onNext: () => void;
}

export const LongDressMeasurementSection: React.FC<LongDressMeasurementSectionProps> = ({
  values,
  unit,
  onChangeValues,
  onChangeUnit,
  onBack,
  onNext,
}) => {
  const [activeNum, setActiveNum] = useState<number>(1);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const completedNums = new Set<number>();
  LONG_DRESS_MEASUREMENTS.forEach((m) => {
    if (validateLongDressMeasurement(values[m.key] || '') === null) {
      completedNums.add(m.num);
    }
  });

  const completedCount = completedNums.size;
  const activeDef = LONG_DRESS_MEASUREMENTS[activeNum - 1] || LONG_DRESS_MEASUREMENTS[0];

  const handleSelectNum = (num: number) => {
    setActiveNum(num);
    const el = inputRefs.current[num];
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleInputChange = (key: string, raw: string) => {
    // Allow only digits and a single decimal point
    if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return;
    onChangeValues({ ...values, [key]: raw });
  };

  const handleContinue = () => {
    setAttemptedSubmit(true);
    const firstInvalid = LONG_DRESS_MEASUREMENTS.find(
      (m) => validateLongDressMeasurement(values[m.key] || '') !== null
    );
    if (firstInvalid) {
      handleSelectNum(firstInvalid.num);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header + Single Unit Selector + Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E4]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Long Dress Measurements</h2>
          <p className="text-xs text-[#57534E] mt-1">
            Select any measurement field to highlight its exact position on the illustration. All 13 fields are required.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="inline-flex rounded-full bg-[#FAF8F5] border border-[#D6D3D1] p-1">
            {(['in', 'cm'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onChangeUnit(u)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  unit === u
                    ? 'bg-[#7F1D1D] text-white'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {u === 'in' ? 'Inches (in)' : 'Centimeters (cm)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#E7E5E4] p-3.5 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-[#1C1917]">
              Measurement Progress: <strong className="text-[#7F1D1D]">{completedCount} of 13</strong> completed
            </span>
            <span className="text-[#78716C]">{Math.round((completedCount / 13) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#E7E5E4] overflow-hidden">
            <div
              className="h-full bg-[#7F1D1D] transition-all duration-300"
              style={{ width: `${(completedCount / 13) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop 2-Column / Mobile Stacked Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Illustration + Active Guidance */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <LongDressIllustration
            activeNum={activeNum}
            completedNums={completedNums}
            onSelectNum={handleSelectNum}
          />

          {/* Active Measurement Guidance Card */}
          <div className="bg-[#7F1D1D]/5 border border-[#7F1D1D]/20 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#7F1D1D] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {activeDef.num}
              </span>
              <div>
                <p className="text-sm font-bold text-[#1C1917]">{activeDef.label}</p>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">{activeDef.guidance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Exact 1–13 Numbered Inputs */}
        <div className="lg:col-span-7 space-y-3">
          {LONG_DRESS_MEASUREMENTS.map((m) => {
            const val = values[m.key] || '';
            const err = validateLongDressMeasurement(val);
            const showErr = (touched[m.key] || attemptedSubmit) && err !== null;
            const isValid = err === null;
            const active = activeNum === m.num;

            return (
              <div
                key={m.key}
                onClick={() => setActiveNum(m.num)}
                className={`rounded-2xl border p-3.5 sm:p-4 transition-all ${
                  active
                    ? 'border-[#7F1D1D] bg-[#7F1D1D]/[0.03] shadow-sm'
                    : showErr
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        active
                          ? 'bg-[#7F1D1D] text-white'
                          : isValid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#F5F5F4] text-[#1C1917] border border-[#D6D3D1]'
                      }`}
                    >
                      {m.num}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <label
                          htmlFor={`ld-m-${m.key}`}
                          className="text-sm font-bold text-[#1C1917] cursor-pointer"
                        >
                          {m.label} <span className="text-[#7F1D1D]">*</span>
                        </label>
                        {isValid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-[#78716C] mt-0.5 flex items-start gap-1">
                        <HelpCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>{m.guidance}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:w-44 flex-shrink-0">
                    <div className="relative flex-1">
                      <input
                        id={`ld-m-${m.key}`}
                        ref={(el) => {
                          inputRefs.current[m.num] = el;
                        }}
                        type="text"
                        inputMode="decimal"
                        value={val}
                        onFocus={() => setActiveNum(m.num)}
                        onBlur={() => setTouched((prev) => ({ ...prev, [m.key]: true }))}
                        onChange={(e) => handleInputChange(m.key, e.target.value)}
                        placeholder="0.0"
                        className={`w-full px-3.5 py-2 pr-10 rounded-xl border text-sm font-semibold focus:outline-none ${
                          showErr
                            ? 'border-red-400 focus:border-red-600 bg-white'
                            : active
                            ? 'border-[#7F1D1D] bg-white'
                            : 'border-[#D6D3D1] focus:border-[#7F1D1D] bg-white'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#78716C]">
                        {unit}
                      </span>
                    </div>
                  </div>
                </div>

                {showErr && (
                  <p className="mt-1.5 pl-10 text-xs font-medium text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{err}</span>
                  </p>
                )}

                {/* Mobile quick prev/next field navigation when active */}
                {active && (
                  <div className="mt-2.5 pl-10 flex items-center gap-2 lg:hidden">
                    {m.num > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNum(m.num - 1);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-[#D6D3D1] text-[11px] font-semibold text-[#57534E]"
                      >
                        ← Prev Field
                      </button>
                    )}
                    {m.num < 13 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNum(m.num + 1);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#7F1D1D]/10 text-[11px] font-semibold text-[#7F1D1D]"
                      >
                        Next Field →
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {attemptedSubmit && completedCount < 13 && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Please complete all 13 Long Dress measurements with valid positive numbers before continuing.</span>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="pt-4 flex justify-between border-t border-[#E7E5E4]">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="px-6 py-2.5 rounded-full bg-[#7F1D1D] hover:bg-[#651515] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <span>Review Measurements</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
