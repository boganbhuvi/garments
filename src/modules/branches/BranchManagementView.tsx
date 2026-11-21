import React, { useState, useEffect } from 'react';
import { useOrder } from '../../context/OrderContext';
import { api } from '../../services/api';
import { Building2, Plus, MapPin, Users, BookOpen, RefreshCw } from 'lucide-react';

interface Branch {
  branchId: string;
  name: string;
  address: string;
  phone?: string;
  managerName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PLANNED';
}

export const BranchManagementView: React.FC = () => {
  const { savedOrders, tailors } = useOrder();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('');

  const loadBranches = async () => {
    setLoading(true);
    setError(null);
    const data = await api.getBranches();
    setLoading(false);
    if (data && Array.isArray(data)) {
      setBranches(data);
    } else {
      setError('Unable to load branches from MongoDB (verify staff login & permissions).');
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    const res = await api.createBranch({
      name: name.trim(),
      address: address.trim() || 'Address pending',
      managerName: manager.trim() || 'Unassigned',
    });
    if (!res.ok) {
      setError(res.error || 'Failed to create branch');
      return;
    }
    setName('');
    setAddress('');
    setManager('');
    setShowAdd(false);
    await loadBranches();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branch Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Persistent MongoDB branch directory and multi-branch operations control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadBranches}
            className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="px-4 py-2.5 rounded-lg bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          Loading branches...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {branches.map((b, idx) => (
            <div key={b.branchId} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {b.branchId}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{b.name}</h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
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
                  <span>Manager: <strong>{b.managerName || 'Unassigned'}</strong></span>
                </p>
              </div>

              {idx === 0 && (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-6 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#7F1D1D]" /> {savedOrders.length} Orders
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-600" /> {tailors.length} Tailors
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Register New Branch</h2>
            <input required type="text" placeholder="Branch Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            <input type="text" placeholder="Branch Manager" value={manager} onChange={(e) => setManager(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-semibold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#7F1D1D] text-white text-sm font-bold cursor-pointer">Save Branch</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
