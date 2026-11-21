import React, { useState } from 'react';
import { Search, ShoppingBag, Scissors, X, Check } from 'lucide-react';

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  customizable: boolean;
  sizes: string[];
  fabricNote: string;
}

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'CAT-BLOUSE-01',
    name: 'Custom Fitted Designer Blouse',
    category: 'Blouse',
    description: 'Tailored to your exact bust, waist, shoulder, and sleeve measurements with optional lining.',
    customizable: true,
    sizes: ['Custom Fit'],
    fabricNote: 'Customer-supplied fabric or studio lining options',
  },
  {
    id: 'CAT-TOPS-01',
    name: 'Tailored Salwar Top / Kurti',
    category: 'Tops',
    description: 'Precision-cut straight, A-line, or flared kurti/top with custom neck, slit, and sleeve styling.',
    customizable: true,
    sizes: ['Custom Fit'],
    fabricNote: 'Cotton, Silk, Georgette, or Linen compatible',
  },
  {
    id: 'CAT-BOTTOM-01',
    name: 'Custom Salwar / Pant / Palazzo',
    category: 'Bottom',
    description: 'Comfortable tailored bottom wear with exact hip, thigh, and ankle round measurements.',
    customizable: true,
    sizes: ['Custom Fit'],
    fabricNote: 'Matching or contrast lining available',
  },
  {
    id: 'CAT-SAREE-01',
    name: 'Saree Falls & Pico Finishing',
    category: 'Saree',
    description: 'Neat, durable falls stitching and pico edging for silk, cotton, and designer sarees.',
    customizable: true,
    sizes: ['Standard Saree'],
    fabricNote: 'Color-matched falls & thread',
  },
  {
    id: 'CAT-NIGHTY-01',
    name: 'Tailored Cotton Nighty',
    category: 'Nighty',
    description: 'Breathable, comfortable custom-length nightwear with zip or button front options.',
    customizable: true,
    sizes: ['Custom Fit'],
    fabricNote: 'Pure cotton & soft blends',
  },
  {
    id: 'CAT-DHUPATTA-01',
    name: 'Dhupatta Edging & Finishing',
    category: 'Dhupatta',
    description: 'Clean pico, tassel, or border finishing for festive and daily-wear dhupattas.',
    customizable: true,
    sizes: ['Standard'],
    fabricNote: 'Chiffon, Georgette, Net, Silk',
  },
  {
    id: 'CAT-LONGDRESS-01',
    name: 'Custom Tailored Long Dress',
    category: 'Long Dress',
    description: 'Bespoke full-length dress tailored with our guided 13-point measurement experience.',
    customizable: true,
    sizes: ['Custom Fit'],
    fabricNote: 'Silk, Georgette, Crepe, Cotton, or Designer Fabrics',
  },
];

interface ShopPageProps {
  onAddToCart: (item: CatalogItem, notes?: string) => void;
  onBookTailoring: (category: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onAddToCart, onBookTailoring }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [customNotes, setCustomNotes] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  const categories = ['ALL', 'Blouse', 'Tops', 'Bottom', 'Saree', 'Nighty', 'Dhupatta'];

  const filtered = CATALOG_ITEMS.filter((item) => {
    const matchCat = category === 'ALL' || item.category === category;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleAdd = (item: CatalogItem) => {
    onAddToCart(item, customNotes);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1800);
    setCustomNotes('');
    setSelectedProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">Collections &amp; Services</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">
          Garment &amp; Tailoring Catalogue
        </h1>
        <p className="text-sm text-[#57534E] mt-1">
          Select a garment category to add to your enquiry bag or start a custom tailoring booking.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-[#7F1D1D] text-white'
                  : 'bg-white border border-[#E7E5E4] text-[#57534E] hover:border-[#1C1917]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search garments..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E7E5E4] text-sm focus:outline-none focus:border-[#7F1D1D]"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div
                onClick={() => setSelectedProduct(item)}
                className="aspect-[4/3] bg-gradient-to-br from-[#F5F5F4] to-[#E7E5E4] p-6 flex flex-col justify-between cursor-pointer"
              >
                <span className="self-start text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-[#7F1D1D]">
                  {item.category}
                </span>
                <Scissors className="w-8 h-8 text-[#7F1D1D]/40 self-end" />
              </div>

              <div className="p-5 space-y-2">
                <h3
                  onClick={() => setSelectedProduct(item)}
                  className="font-serif text-lg font-bold text-[#1C1917] cursor-pointer hover:text-[#7F1D1D]"
                >
                  {item.name}
                </h3>
                <p className="text-xs text-[#57534E] leading-relaxed">{item.description}</p>
                <p className="text-xs font-semibold text-[#B45309] pt-1">
                  Price: Quoted on customisation &amp; fabric
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdd(item)}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#1C1917] hover:bg-[#7F1D1D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {addedId === item.id ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                <span>{addedId === item.id ? 'Added' : 'Add to Bag'}</span>
              </button>
              <button
                type="button"
                onClick={() => onBookTailoring(item.category)}
                className="py-2.5 px-4 rounded-full border border-[#D6D3D1] hover:border-[#7F1D1D] text-xs font-semibold text-[#1C1917] cursor-pointer"
              >
                Customise
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7F1D1D]">
                  {selectedProduct.category}
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1C1917] mt-0.5">
                  {selectedProduct.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-full hover:bg-[#F5F5F4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#57534E] leading-relaxed">{selectedProduct.description}</p>
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E5E4] text-xs space-y-1.5">
              <p><strong>Sizing:</strong> {selectedProduct.sizes.join(', ')}</p>
              <p><strong>Fabric / Notes:</strong> {selectedProduct.fabricNote}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
                Customisation / Stitching Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Lining required, boat neck, 3/4 sleeve..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAdd(selectedProduct)}
                className="flex-1 py-3 rounded-full bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-semibold cursor-pointer"
              >
                Add to Bag
              </button>
              <button
                type="button"
                onClick={() => {
                  const cat = selectedProduct.category;
                  setSelectedProduct(null);
                  onBookTailoring(cat);
                }}
                className="flex-1 py-3 rounded-full border border-[#1C1917] text-[#1C1917] text-sm font-semibold cursor-pointer"
              >
                Book Tailoring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
