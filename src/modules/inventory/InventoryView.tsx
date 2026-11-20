import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minStock: number;
  branch: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'RECEIVED' | 'ISSUED' | 'ADJUSTMENT';
  quantity: number;
  note: string;
  timestamp: string;
}

const STORAGE_ITEMS_KEY = 'giriraj_erp_inventory_items_v1';
const STORAGE_MOVES_KEY = 'giriraj_erp_inventory_moves_v1';

const INITIAL_ITEMS: StockItem[] = [
  { id: 'MAT-001', name: 'Cotton Lining (White / Cream)', category: 'Lining', unit: 'Meters', quantity: 120, minStock: 30, branch: 'Main Studio' },
  { id: 'MAT-002', name: 'Polyester Silk Lining', category: 'Lining', unit: 'Meters', quantity: 45, minStock: 25, branch: 'Main Studio' },
  { id: 'MAT-003', name: 'Concealed Zippers (16 inch)', category: 'Trims', unit: 'Pieces', quantity: 18, minStock: 25, branch: 'Main Studio' },
  { id: 'MAT-004', name: 'Saree Falls (Assorted Colors)', category: 'Finishing', unit: 'Pieces', quantity: 85, minStock: 20, branch: 'Main Studio' },
];

export const InventoryView: React.FC = () => {
  const [items, setItems] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ITEMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ITEMS;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MOVES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Lining');
  const [newUnit, setNewUnit] = useState('Meters');
  const [newQty, setNewQty] = useState('0');
  const [newMin, setNewMin] = useState('10');

  const persist = (nextItems: StockItem[], nextMoves: StockMovement[]) => {
    setItems(nextItems);
    setMovements(nextMoves);
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(nextItems));
      localStorage.setItem(STORAGE_MOVES_KEY, JSON.stringify(nextMoves));
    } catch {}
  };

  const recordMovement = (item: StockItem, type: 'RECEIVED' | 'ISSUED', delta: number) => {
    const nextQty = Math.max(0, item.quantity + (type === 'RECEIVED' ? delta : -delta));
    const nextItems = items.map((i) => (i.id === item.id ? { ...i, quantity: nextQty } : i));
    const move: StockMovement = {
      id: `MOV-${Date.now().toString().slice(-5)}`,
      itemId: item.id,
      itemName: item.name,
      type,
      quantity: delta,
      note: type === 'RECEIVED' ? 'Stock received' : 'Issued to workshop',
      timestamp: new Date().toISOString(),
    };
    persist(nextItems, [move, ...movements]);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const item: StockItem = {
      id: `MAT-${String(items.length + 1).padStart(3, '0')}`,
      name: newName.trim(),
      category: newCat,
      unit: newUnit,
      quantity: Number(newQty) || 0,
      minStock: Number(newMin) || 10,
      branch: 'Main Studio',
    };
    const move: StockMovement = {
      id: `MOV-${Date.now().toString().slice(-5)}`,
      itemId: item.id,
      itemName: item.name,
      type: 'RECEIVED',
      quantity: item.quantity,
      note: 'Initial stock entry',
      timestamp: new Date().toISOString(),
    };
    persist([item, ...items], [move, ...movements]);
    setNewName('');
    setNewQty('0');
    setShowAddModal(false);
  };

  const lowStockCount = items.filter((i) => i.quantity > 0 && i.quantity <= i.minStock).length;
  const outOfStockCount = items.filter((i) => i.quantity === 0).length;
  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-[#233B5D] text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Material Inventory &amp; Stock Control</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Track fabrics, linings, trims, low-stock alerts, and workshop stock movements
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#D68B20] hover:bg-[#B47417] text-white text-sm font-black flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material</span>
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-5">
          <span className="text-xs font-bold uppercase text-slate-400">Total Stock Items</span>
          <p className="text-3xl font-black text-[#191C1E] mt-1">{items.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 p-5">
          <span className="text-xs font-bold uppercase text-amber-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
          </span>
          <p className="text-3xl font-black text-amber-700 mt-1">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-5">
          <span className="text-xs font-bold uppercase text-red-600">Out of Stock</span>
          <p className="text-3xl font-black text-red-700 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search material by ID, name, or category..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DCE4EE] text-sm font-semibold"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#DCE4EE] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-[#DCE4EE] text-xs font-black uppercase text-slate-500">
              <th className="p-3.5">Item ID</th>
              <th className="p-3.5">Material Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Available</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Quick Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map((item) => {
              const isOut = item.quantity === 0;
              const isLow = !isOut && item.quantity <= item.minStock;
              return (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="p-3.5 font-black text-[#233B5D]">{item.id}</td>
                  <td className="p-3.5 font-bold text-[#191C1E]">{item.name}</td>
                  <td className="p-3.5 text-slate-600">{item.category}</td>
                  <td className="p-3.5 font-black">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full ${
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
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" /> +10
                    </button>
                    <button
                      type="button"
                      onClick={() => recordMovement(item, 'ISSUED', 5)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> -5
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Movement History */}
      {movements.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-5 space-y-3">
          <h3 className="text-sm font-black uppercase text-[#233B5D] flex items-center gap-2">
            <Package className="w-4 h-4" /> Recent Stock Movements
          </h3>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {movements.slice(0, 15).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs bg-slate-50 px-3.5 py-2 rounded-lg">
                <span>
                  <strong className="text-[#233B5D]">{m.itemName}</strong> · {m.type} ({m.quantity}) — {m.note}
                </span>
                <span className="text-slate-400">{new Date(m.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleAddItem} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-black text-[#191C1E]">Add Inventory Material</h2>
            <input required type="text" placeholder="Material Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Category" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
              <input type="text" placeholder="Unit (Meters/Pcs)" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
              <input type="number" placeholder="Initial Qty" value={newQty} onChange={(e) => setNewQty(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
              <input type="number" placeholder="Min Stock Alert" value={newMin} onChange={(e) => setNewMin(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#233B5D] text-white text-sm font-black cursor-pointer">Save Material</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
