import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, Star, ChevronDown, Leaf } from 'lucide-react';
import { api } from '../lib/api';
import { indianStates, getDistrictsByState } from '../data/indianStatesDistricts';

interface Crop {
  id: string;
  name: string;
  variety: string;
  grade: string;
  pricePerKg: number;
  minOrderKg: number;
  images: string[];
  locationDistrict: string;
  locationState: string;
  farmer: { id: string; name: string; farmerProfile: { farmName: string; rating: number } };
}

export default function BrowseCrops() {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [page, setPage] = useState(1);

  const availableDistricts = useMemo(() => getDistrictsByState(selectedState), [selectedState]);

  const { data, isLoading } = useQuery({
    queryKey: ['crops', { search, district, page }],
    queryFn: async () => {
      const res = await api.get('/crops', { params: { search, district, page, limit: 12 } });
      return res as { data: Crop[]; pagination: any };
    },
    placeholderData: (prev) => prev,
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* ── Header Banner ── */}
      <div className="bg-white border-b border-gray-100 mb-8 pt-8 pb-10">
        <div className="page-container flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-3 border border-emerald-100">
              <Leaf className="w-3.5 h-3.5" /> Direct Marketplace
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Browse <span className="gradient-text">Fresh Harvests</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500 max-w-lg leading-relaxed">
              Source premium quality crops directly from verified Indian farmers. Fair prices, zero middlemen.
            </p>
          </div>
        </div>
      </div>

      <div className="page-container flex flex-col lg:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
          <div className="card-elevated p-6 sticky top-24">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <Filter className="w-4 h-4 text-primary-500" /> Refine Search
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Crop</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="input-field pl-10 py-2 border"
                    placeholder="e.g. Tomato, Onion"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setDistrict(''); setPage(1); }}
                    className="input-field py-2 px-3 border bg-white appearance-none pr-8"
                  >
                    {indianStates.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District ({selectedState})</label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
                    className="input-field py-2 px-3 border bg-white appearance-none pr-8"
                  >
                    <option value="">All Districts</option>
                    {availableDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
              <h3 className="text-lg font-medium text-gray-900">No crops found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
              <button onClick={() => { setSearch(''); setDistrict(''); }} className="mt-4 text-primary-600 font-medium hover:text-primary-700">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {data?.data.map((crop) => (
                  <Link key={crop.id} to={`/crops/${crop.id}`} className="card group hover:shadow-primary-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 relative">
                      <img
                        src={crop.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={crop.name}
                        className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg shadow-black/10 border border-white/20">
                        <span className="text-sm font-black text-gray-900">₹{crop.pricePerKg}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase ml-0.5">/kg</span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{crop.name}</h3>
                        {crop.grade && (
                          <span className="badge badge-green ml-2 flex-shrink-0">
                            Grade {crop.grade}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-500 mb-4">{crop.variety}</p>
                      
                      <div className="flex items-center text-xs font-semibold text-gray-500 mb-4 bg-gray-50 w-fit px-2.5 py-1.5 rounded-lg border border-gray-100">
                        <MapPin className="w-3.5 h-3.5 text-primary-500 mr-1.5" />
                        {crop.locationDistrict}, {crop.locationState}
                      </div>

                      <div className="border-t border-gray-100/80 mt-4 pt-4 flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-emerald-100 flex items-center justify-center text-primary-700 font-bold text-xs ring-2 ring-white shadow-sm">
                            {crop.farmer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Farmer</p>
                            <p className="text-xs font-bold text-gray-900">{crop.farmer.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-bold text-amber-700">{crop.farmer.farmerProfile.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn border border-gray-300 bg-white px-3 py-1 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm text-gray-700">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <button
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="btn border border-gray-300 bg-white px-3 py-1 hover:bg-gray-50"
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
