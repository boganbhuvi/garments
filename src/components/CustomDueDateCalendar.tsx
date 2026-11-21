import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDueDateCalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const CustomDueDateCalendar: React.FC<CustomDueDateCalendarProps> = ({ value, onChange }) => {
  const initialDate = useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [isOpen, setIsOpen] = useState(true);

  const todayYMD = toYMD(new Date());

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number; ymd: string } | null> = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, ymd });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const applyOffsetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const ymd = toYMD(d);
    onChange(ymd);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#147D75]/10 text-[#147D75] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              Delivery Due Date
            </span>
            <span className="text-base font-black text-[#233B5D]">
              {value || 'Select a due date'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
        >
          {isOpen ? 'Hide Calendar' : 'Change Date'}
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: '+3 Days', days: 3 },
          { label: '+5 Days', days: 5 },
          { label: '+7 Days', days: 7 },
          { label: '+10 Days', days: 10 },
          { label: '+14 Days', days: 14 },
        ].map((preset) => {
          const target = new Date();
          target.setDate(target.getDate() + preset.days);
          const isSelected = value === toYMD(target);
          return (
            <button
              key={preset.days}
              type="button"
              onClick={() => applyOffsetDays(preset.days)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#147D75] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Custom Interactive Calendar Grid */}
      {isOpen && (
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-[#233B5D]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEK_DAYS.map((wd) => (
              <span key={wd} className="text-[11px] font-black uppercase text-slate-400 py-1">
                {wd}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }
              const isSelected = cell.ymd === value;
              const isToday = cell.ymd === todayYMD;
              const isPast = cell.ymd < todayYMD;

              return (
                <button
                  key={cell.ymd}
                  type="button"
                  onClick={() => onChange(cell.ymd)}
                  className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#233B5D] text-white shadow-sm ring-2 ring-[#147D75]/40'
                      : isToday
                      ? 'bg-[#147D75]/15 text-[#147D75] border border-[#147D75]/40 hover:bg-[#147D75]/25'
                      : isPast
                      ? 'text-slate-400 hover:bg-slate-200/70'
                      : 'bg-white text-slate-800 hover:bg-[#D3E4FE] border border-slate-200/60'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
