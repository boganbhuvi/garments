import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { Building2, Plus, MapPin, Users, BookOpen } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  manager: string;
  status: 'ACTIVE' | 'PLANNED';
}

const STORAGE_BRANCHES_KEY = 'giriraj_erp_branches_v1';

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'BR-001',
    name: 'Giriraj City Garments — Main Studio',
    address: 'Primary Workshop & Front Desk',
    manager: 'Store Admin',
    status: 'ACTIVE',
  },
];

export const BranchManagementView: React.FC = () => {
  const { savedOrders, tailors } = useOrder();
  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BRANCHES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BRANCHES;
  });

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const next: Branch = {
      id: `BR-${String(branches.length + 1).padStart(3, '0')}`,
      name: name.trim(),
      address: address.trim() || 'Address pending',
      manager: manager.trim() || 'Unassigned',
      status: 'ACTIVE',
    };
    const updated = [...branches, next];
    setBranches(updated);
    try {
      localStorage.setItem(STORAGE_BRANCHES_KEY, JSON.stringify(updated));
    } catch {}
    setName('');
    setAddress('');
    setManager('');
    setShowAdd(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-[#233B5D] text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Branch Management</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Multi-branch directory and operational readiness for future expansion
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 rounded-xl bg-[#D68B20] hover:bg-[#B47417] text-white text-sm font-black flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Branch</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {branches.map((b, idx) => (
          <div key={b.id} className="bg-white rounded-2xl border border-[#DCE4EE] p-6 space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded bg-slate-100 text-[#233B5D]">
                  {b.id}
                </span>
                <h2 className="text-lg font-black text-[#191C1E] mt-1">{b.name}</h2>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {b.status}
              </span>
            </div>

            <div className="text-sm text-slate-600 space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{b.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Manager: <strong>{b.manager}</strong></span>
              </p>
            </div>

            {idx === 0 && (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-6 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#233B5D]" /> {savedOrders.length} Orders
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#147D75]" /> {tailors.length} Tailors
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-black text-[#191C1E]">Register New Branch</h2>
            <input required type="text" placeholder="Branch Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            <input type="text" placeholder="Branch Manager" value={manager} onChange={(e) => setManager(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#233B5D] text-white text-sm font-black cursor-pointer">Save Branch</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
