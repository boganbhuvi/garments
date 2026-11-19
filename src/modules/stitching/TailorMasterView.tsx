import React, { useState } from 'react';
import { TailorProfile, TailorSpecialization } from '../../types/stitching';
import {
  Users,
  PlusCircle,
  Edit2,
  Phone,
  Briefcase,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  X,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

interface TailorMasterViewProps {
  tailors: TailorProfile[];
  onAddTailor: (tailor: Omit<TailorProfile, 'id' | 'createdAt'>) => void;
  onUpdateTailor: (id: string, fields: Partial<TailorProfile>) => void;
  onDeleteTailor: (id: string) => void;
}

const SPECIALIZATIONS: TailorSpecialization[] = [
  'Blouse Specialist',
  'Kurti Specialist',
  'Churidar Specialist',
  'Salwar Specialist',
  'Saree / Falls',
  'General Tailoring',
  'Other'
];

export const TailorMasterView: React.FC<TailorMasterViewProps> = ({
  tailors,
  onAddTailor,
  onUpdateTailor,
  onDeleteTailor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTailor, setEditingTailor] = useState<TailorProfile | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSpec, setFormSpec] = useState<TailorSpecialization>('Blouse Specialist');
  const [formExp, setFormExp] = useState<number>(5);
  const [formRate, setFormRate] = useState<number>(250);
  const [formAvailability, setFormAvailability] = useState<'Available' | 'Busy' | 'On Leave'>('Available');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingTailor(null);
    setFormName('');
    setFormPhone('');
    setFormSpec('Blouse Specialist');
    setFormExp(5);
    setFormRate(250);
    setFormAvailability('Available');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TailorProfile) => {
    setEditingTailor(t);
    setFormName(t.name);
    setFormPhone(t.phone);
    setFormSpec(t.specialization);
    setFormExp(t.experienceYears);
    setFormRate(t.defaultPieceRate);
    setFormAvailability(t.availability);
    setFormNotes(t.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter tailor name');
      return;
    }

    if (editingTailor) {
      onUpdateTailor(editingTailor.id, {
        name: formName.trim(),
        phone: formPhone.trim(),
        specialization: formSpec,
        experienceYears: Number(formExp) || 0,
        defaultPieceRate: Number(formRate) || 0,
        availability: formAvailability,
        notes: formNotes.trim()
      });
    } else {
      onAddTailor({
        name: formName.trim(),
        phone: formPhone.trim(),
        specialization: formSpec,
        experienceYears: Number(formExp) || 0,
        defaultPieceRate: Number(formRate) || 0,
        availability: formAvailability,
        active: true,
        notes: formNotes.trim()
      });
    }

    setIsModalOpen(false);
  };

  // Filtered tailors
  const filteredTailors = tailors.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpec = 
      selectedSpecialization === 'ALL' || t.specialization === selectedSpecialization;

    return matchesSearch && matchesSpec;
  });

  return (
    <div className="space-y-6">
      
      {/* Action Bar: Search, Specialization Filter & Add Tailor Button */}
      <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Tailor Name, Phone, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#147D75]"
            />
          </div>

          {/* Filter by Specialization */}
          <select
            value={selectedSpecialization}
            onChange={e => setSelectedSpecialization(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#147D75]"
          >
            <option value="ALL">All Specializations</option>
            {SPECIALIZATIONS.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Add Tailor Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-11 px-5 rounded-xl bg-[#147D75] hover:bg-[#0f635d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Add Master Tailor</span>
        </button>

      </div>

      {/* Tailor Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTailors.map(tailor => (
          <div
            key={tailor.id}
            className={`bg-white rounded-2xl border-2 p-5 shadow-sm space-y-4 transition-all ${
              !tailor.active
                ? 'opacity-60 border-slate-200 bg-slate-50'
                : tailor.availability === 'Busy'
                ? 'border-amber-300'
                : tailor.availability === 'On Leave'
                ? 'border-red-300'
                : 'border-slate-300 hover:border-[#147D75]'
            }`}
          >
            {/* Header: Name, ID, Availability Badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 block">
                  {tailor.id}
                </span>
                <h3 className="text-lg font-black text-[#233B5D]">
                  {tailor.name}
                </h3>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md text-xs font-black bg-[#147D75]/10 text-[#147D75] uppercase">
                  {tailor.specialization}
                </span>
              </div>

              <div className="text-right space-y-1">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                  tailor.availability === 'Available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : tailor.availability === 'Busy'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {tailor.availability}
                </span>
                {!tailor.active && (
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">
                    Deactivated
                  </span>
                )}
              </div>
            </div>

            {/* Metrics & Details */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Default Rate</span>
                <strong className="text-base font-black text-slate-800">
                  ₹{tailor.defaultPieceRate}
                </strong>
                <span className="text-slate-500 font-medium text-[11px] block">per finished piece</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Experience</span>
                <strong className="text-base font-black text-slate-800">
                  {tailor.experienceYears} Years
                </strong>
                <span className="text-slate-500 font-medium text-[11px] block">Bespoke cutting & fit</span>
              </div>
            </div>

            {/* Contact info */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Phone className="w-3.5 h-3.5 text-[#147D75]" />
              <a href={`tel:${tailor.phone}`} className="hover:underline">
                +91 {tailor.phone}
              </a>
            </div>

            {/* Notes if any */}
            {tailor.notes && (
              <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-200">
                "{tailor.notes}"
              </p>
            )}

            {/* Action buttons */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onUpdateTailor(tailor.id, { active: !tailor.active })}
                className={`text-xs font-bold cursor-pointer transition-colors ${
                  tailor.active ? 'text-red-600 hover:text-red-800' : 'text-emerald-600 hover:text-emerald-800'
                }`}
              >
                {tailor.active ? 'Deactivate' : 'Reactivate'}
              </button>

              <button
                type="button"
                onClick={() => handleOpenEdit(tailor)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

          </div>
        ))}

        {filteredTailors.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-bold">No master tailors found matching your search.</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-3 text-sm font-black text-[#147D75] hover:underline"
            >
              + Register New Master Tailor
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Tailor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-[#233B5D]">
                {editingTailor ? 'Edit Master Tailor Profile' : 'Register New Master Tailor'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-bold text-slate-700">
              
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[13px] font-black text-slate-800">Tailor Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Murugan Master"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#147D75] bg-white"
                />
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[13px] font-black text-slate-800">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="e.g. 98401 54321"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#147D75] bg-white"
                />
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[13px] font-black text-slate-800">Specialization</label>
                <select
                  value={formSpec}
                  onChange={e => setFormSpec(e.target.value as TailorSpecialization)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#147D75] bg-white"
                >
                  {SPECIALIZATIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[13px] font-black text-slate-800">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={formExp}
                  onChange={e => setFormExp(Number(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#147D75] bg-white"
                />
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[13px] font-black text-slate-800">Default Piece Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formRate}
                  onChange={e => setFormRate(Number(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#147D75] bg-white"
                />
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[13px] font-black text-slate-800">Availability Status</label>
                <select
                  value={formAvailability}
                  onChange={e => setFormAvailability(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#147D75] bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[13px] font-black text-slate-800">Craftsmanship Notes / Specialty</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Master in bridal padded blouses and Aari neck piping."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#147D75] bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#147D75] hover:bg-[#10655e] text-white text-sm font-black shadow-md cursor-pointer transition-colors"
                >
                  {editingTailor ? 'Save Changes' : 'Register Tailor'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
