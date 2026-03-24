import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ShoppingCart, Plus, Minus, Store, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useAppDispatch } from '../store/hooks';
import { addItem } from '../store/slices/cartSlice';

// ── Category-specific curated Unsplash images ──────────────────────────────
const PRODUCT_IMAGES: Record<string, string> = {
  // Seeds
  'Hybrid Tomato Seeds (50g)': 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=400&fit=crop',
  'Onion Seeds - Nasik Red (100g)': 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400&fit=crop',
  'Okra (Bhindi) Seeds (250g)': 'https://images.unsplash.com/photo-1587411768638-ec71f8e33b08?w=400&fit=crop',
  'Chilli Seeds - Byadgi (50g)': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&fit=crop',
  'Paddy Seeds IR-36 (5kg)': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&fit=crop',
  'Maize Seeds - Pro 311 (2kg)': 'https://images.unsplash.com/photo-1601593768799-76b653de6848?w=400&fit=crop',
  // Fertilizers
  'NPK 19-19-19 Fertilizer (5kg)': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&fit=crop',
  'Urea Fertilizer (45kg bag)': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&fit=crop',
  'DAP Fertilizer (50kg)': 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&fit=crop',
  'Vermicompost Organic (25kg)': 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&fit=crop',
  'Potash MOP (25kg)': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&fit=crop&sat=-100',
  // Pesticides
  'Bayer Champion Fungicide (500ml)': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&fit=crop',
  'Syngenta Ampligo Insecticide (250ml)': 'https://images.unsplash.com/photo-1585771731081-c11dbf98e4d4?w=400&fit=crop',
  'Neem Oil Organic Spray (1L)': 'https://images.unsplash.com/photo-1610614819513-58e34989848b?w=400&fit=crop',
  'Confidor Imidacloprid (100ml)': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&fit=crop&hue-rotate=40',
  // Tools
  'Garden Trowel Set - 3pcs': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&fit=crop',
  'Knapsack Sprayer 16L': 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&fit=crop',
  'Pruning Secateurs (8 inch)': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&fit=crop',
  'Khurpi (Weeder) - Steel': 'https://images.unsplash.com/photo-1562113530-57ba467cea38?w=400&fit=crop',
  'Garden Rake (Heavy Duty)': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&fit=crop',
  'Water Sprinkler (Rotating)': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&fit=crop',
  'Drip Irrigation Kit (100 plants)': 'https://images.unsplash.com/photo-1530836176759-510e56823d4a?w=400&fit=crop',
  // Other
  'Mulching Sheet Black (100m roll)': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&fit=crop',
  'Grow Bags (12x12 inch) - Pack of 10': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&fit=crop',
  'Soil Testing Kit': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&fit=crop',
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  SEEDS: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=400&fit=crop',
  FERTILIZERS: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&fit=crop',
  PESTICIDES: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&fit=crop',
  TOOLS: 'https://images.unsplash.com/photo-1562113530-57ba467cea38?w=400&fit=crop',
  OTHER: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&fit=crop',
};

const CATEGORY_COLORS: Record<string, { badge: string; dot: string }> = {
  SEEDS: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-700/10', dot: 'bg-emerald-500' },
  FERTILIZERS: { badge: 'bg-amber-50 text-amber-700 ring-amber-700/10', dot: 'bg-amber-500' },
  PESTICIDES: { badge: 'bg-rose-50 text-rose-700 ring-rose-700/10', dot: 'bg-rose-500' },
  TOOLS: { badge: 'bg-blue-50 text-blue-700 ring-blue-700/10', dot: 'bg-blue-500' },
  OTHER: { badge: 'bg-purple-50 text-purple-700 ring-purple-700/10', dot: 'bg-purple-500' },
};

function getProductImage(name: string, category: string, dbImages: string[]): string {
  // If DB has a custom non-placeholder image, use it
  if (dbImages?.[0] && !dbImages[0].includes('416879595882')) return dbImages[0];
  return PRODUCT_IMAGES[name] || CATEGORY_FALLBACKS[category] || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&fit=crop';
}

interface StoreProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
}

export default function FarmingStore() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const dispatch = useAppDispatch();

  const { data, isLoading } = useQuery({
    queryKey: ['store', { search, category, page }],
    queryFn: async () => {
      const apiCategory = category ? category.toUpperCase() : undefined;
      const res = await api.get('/store/products', { params: { search, category: apiCategory, page, limit: 12 } });
      return res as unknown as { data: StoreProduct[]; pagination: any };
    },
    placeholderData: (prev) => prev,
  });

  const categories = ['Fertilizers', 'Seeds', 'Pesticides', 'Tools', 'Equipment', 'Other'];

  const handleQuantity = (id: string, delta: number, max: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(current + delta, max));
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (product: StoreProduct) => {
    const qty = quantities[product.id] || 1;
    dispatch(addItem({
      id: product.id,
      type: 'STORE',
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.images[0],
      maxAvailable: product.stock,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Factory Direct Prices</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">Farming Supplies Store</h1>
              <p className="mt-1 text-sm text-emerald-200">Certified seeds, fertilizers &amp; tools — delivered to your farm.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" /> Filters
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="input-field pl-10 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. Urea, Tractor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="category"
                      checked={category === ''}
                      onChange={() => { setCategory(''); setPage(1); }}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                    <span className="text-sm text-gray-700">All Categories</span>
                  </label>
                  {categories.map((c) => (
                    <label key={c} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="category"
                        checked={category === c}
                        onChange={() => { setCategory(c); setPage(1); }}
                        className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                      />
                      <span className="text-sm text-gray-700">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-80 border border-gray-100 shadow-sm">
                  <div className="bg-gray-200 h-48 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
              <button onClick={() => { setSearch(''); setCategory(''); }} className="mt-4 text-primary-600 font-medium hover:text-primary-700">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.data.map((product) => {
                  const catColors = CATEGORY_COLORS[product.category] || CATEGORY_COLORS['OTHER'];
                  const imgSrc = getProductImage(product.name, product.category, product.images);
                  return (
                  <div key={product.id} className="group bg-white flex flex-col rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                    <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&fit=crop'; }}
                      />
                      <span className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset shadow-sm ${catColors.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${catColors.dot}`} />
                        {product.category}
                      </span>
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                          Only {product.stock} left!
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors" title={product.name}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1 flex-1 min-h-[40px] leading-relaxed">
                        {product.description}
                      </p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-bold text-gray-900">₹{product.price}</p>
                      </div>

                      {product.stock > 0 ? (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                            <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden h-9">
                              <button 
                                onClick={() => handleQuantity(product.id, -1, product.stock)}
                                className="px-2.5 h-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-8 text-center text-sm font-semibold text-gray-900 border-x border-gray-200 h-full flex items-center justify-center">
                                {quantities[product.id] || 1}
                              </div>
                              <button 
                                onClick={() => handleQuantity(product.id, 1, product.stock)}
                                className="px-2.5 h-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="btn btn-primary flex-1 py-1.5 h-9 text-sm font-semibold shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-1.5"
                            >
                              <ShoppingCart className="w-4 h-4" /> Add
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button
                            disabled
                            className="w-full text-center py-2.5 rounded-lg bg-gray-100 text-gray-500 font-semibold cursor-not-allowed border border-gray-200"
                          >
                            Out of Stock
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn border border-gray-300 bg-white px-3 py-1 hover:bg-gray-50 font-medium"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <button
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="btn border border-gray-300 bg-white px-3 py-1 hover:bg-gray-50 font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
