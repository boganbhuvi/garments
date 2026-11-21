import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Package, AlertTriangle, Plus, ArrowUpRight, ArrowDownLeft, Search, RefreshCw } from 'lucide-react';

interface StockItem {
  itemId: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minStock: number;
  branchId: string;
}

const LEGACY_STORAGE_KEY = 'giriraj_erp_inventory_items_v1';

export const InventoryView: React.FC = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Lining');
  const [newUnit, setNewUnit] = useState('Meters');
  const [newQty, setNewQty] = useState('0');
  const [newMin, setNewMin] = useState('10');
  const [legacyCount, setLegacyCount] = useState(0);

  const loadInventory = async (q = search) => {
    setLoading(true);
    setError(null);
    const res = await api.getInventory(q, 1, 50);
    setLoading(false);
    if (res && Array.isArray(res.data)) {
      setItems(res.data);
    } else {
      setError('Unable to load inventory from MongoDB (verify staff login & connection).');
    }
  };

  useEffect(() => {
    loadInventory();
    try {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed) && parsed.length > 0) setLegacyCount(parsed.length);
      }
    } catch {}
  }, []);

  const handleMigrateLegacy = async () => {
    try {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!legacyRaw) return;
      const parsed = JSON.parse(legacyRaw);
      const res = await api.migrateInventory(parsed);
      if (res) {
        setLegacyCount(0);
        await loadInventory();
      }
    } catch {}
  };

  const recordMovement = async (item: StockItem, type: 'RECEIVED' | 'ISSUED', qty: number) => {
    setError(null);
    const res = await api.recordStockMovement(item.itemId, {
      type,
      quantity: qty,
      note: type === 'RECEIVED' ? 'Stock received' : 'Issued to workshop',
    });
    if (!res.ok) {
      setError(res.error || 'Failed to record stock movement');
      return;
    }
    await loadInventory();
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    const res = await api.createInventoryItem({
      name: newName.trim(),
      category: newCat,
      unit: newUnit,
      quantity: Number(newQty) || 0,
      minStock: Number(newMin) || 10,
    });
    if (!res.ok) {
      setError(res.error || 'Could not add material');
      return;
    }
    setNewName('');
    setNewQty('0');
    setShowAddModal(false);
    await loadInventory();
  };

  const lowStockCount = items.filter((i) => i.quantity > 0 && i.quantity <= i.minStock).length;
  const outOfStockCount = items.filter((i) => i.quantity === 0).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Material Inventory &amp; Stock Control</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            MongoDB-backed stock ledger with traceable movements and low-stock alerts
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {legacyCount > 0 && (
            <button
              type="button"
              onClick={handleMigrateLegacy}
              className="px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold cursor-pointer"
            >
              Import {legacyCount} Legacy Items to MongoDB
            </button>
          )}
          <button
            type="button"
            onClick={() => loadInventory()}
            className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-lg bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-xs font-bold uppercase text-slate-400">Total Stock Items</span>
          <p className="text-3xl font-bold text-slate-900 mt-1">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-5">
          <span className="text-xs font-bold uppercase text-amber-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
          </span>
          <p className="text-3xl font-bold text-amber-700 mt-1">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <span className="text-xs font-bold uppercase text-red-700">Out of Stock</span>
          <p className="text-3xl font-bold text-red-700 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadInventory(search)}
            placeholder="Search material by ID, name, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium"
          />
        </div>
        <button
          type="button"
          onClick={() => loadInventory(search)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold cursor-pointer"
        >
          Search
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading inventory...</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
            <Package className="w-8 h-8 text-slate-300" />
            <span>No inventory items found in MongoDB.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <th className="p-3.5">Item ID</th>
                <th className="p-3.5">Material Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Available</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Stock Movement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.map((item) => {
                const isOut = item.quantity === 0;
                const isLow = !isOut && item.quantity <= item.minStock;
                return (
                  <tr key={item.itemId} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-bold text-slate-900">{item.itemId}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{item.name}</td>
                    <td className="p-3.5 text-slate-600">{item.category}</td>
                    <td className="p-3.5 font-bold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isOut
                            ? 'bg-red-100 text-red-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => recordMovement(item, 'RECEIVED', 10)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" /> +10
                      </button>
                      <button
                        type="button"
                        onClick={() => recordMovement(item, 'ISSUED', 5)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> -5
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleAddItem} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Inventory Material</h2>
            <input required type="text" placeholder="Material Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Category" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
              <input type="text" placeholder="Unit (Meters/Pcs)" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
              <input type="number" placeholder="Initial Qty" value={newQty} onChange={(e) => setNewQty(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
              <input type="number" placeholder="Min Stock Alert" value={newMin} onChange={(e) => setNewMin(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-semibold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#7F1D1D] text-white text-sm font-bold cursor-pointer">Save Material</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
