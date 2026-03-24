import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Target, BrainCircuit } from 'lucide-react';
import { api } from '../lib/api';
import { indianStates, getDistrictsByState } from '../data/indianStatesDistricts';

interface PriceSummary {
  cropName: string;
  district: string;
  state: string;
  avg7d: number;
  avg30d: number;
  minPrice: number;
  maxPrice: number;
  lastUpdatedAt: string;
}

interface PriceDataPoint {
  date: string;
  price: number;
}

export default function MarketPrices() {
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [district, setDistrict] = useState('Bangalore');
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');

  const availableDistricts = useMemo(() => getDistrictsByState(selectedState), [selectedState]);

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['market-summary', { selectedCrop, district }],
    queryFn: async () => {
      const res = await api.get('/market/summary', { params: { cropName: selectedCrop, state: 'Karnataka', district } });
      const arr = Array.isArray(res) ? res : [];
      return arr[0] as PriceSummary | undefined;
    },
  });

  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ['market-history', { selectedCrop, district }],
    queryFn: async () => {
      const res = await api.get('/market/prices', { 
        params: { cropName: selectedCrop, state: 'Karnataka', district, range: '30' } 
      });
      // Backend returns { cropName, data: [...] }
      const points = (res as any)?.data || [];
      return points.map((p: any) => ({
        date: format(new Date(p.observedAt), 'MMM dd'),
        price: p.pricePerKg
      })).reverse() as PriceDataPoint[];
    },
    enabled: !!selectedCrop,
  });

  const { data: aiPrediction, isLoading: isPredictionLoading } = useQuery({
    queryKey: ['ai-predict', { selectedCrop, district }],
    queryFn: async () => {
      const currentMonth = new Date().getMonth() + 1;
      const recentAvg = summary?.avg7d || 25;
      const res = await api.post('/ai/price-predict', { 
        cropName: selectedCrop, state: 'Karnataka', district, month: currentMonth, recentAvgPrice: recentAvg 
      });
      const data = res as any;
      const predicted = ((data.predictedMin || 0) + (data.predictedMax || 0)) / 2;
      const trend = predicted > recentAvg ? 'UP' : predicted < recentAvg ? 'DOWN' : 'STABLE';
      return {
        predictedPrice: predicted,
        confidenceText: `${Math.round((data.confidence || 0.6) * 100)}% confidence (${data.modelId || 'heuristic'})`,
        trend: trend as 'UP' | 'DOWN' | 'STABLE',
      };
    },
    enabled: !!selectedCrop && !!summary,
  });

  const crops = ['Tomato', 'Onion', 'Potato', 'Cabbage', 'Brinjal'];

  // Calculate 7d trend percentage if summary available
  const trendPercent = summary && summary.avg30d > 0 
    ? ((summary.avg7d - summary.avg30d) / summary.avg30d * 100).toFixed(1) 
    : '0.0';
  const isUp = parseFloat(trendPercent) > 0;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* ── Header Banner ── */}
      <div className="bg-white border-b border-gray-100 mb-8 pt-8 pb-10">
        <div className="page-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-widest mb-3 border border-primary-100">
              <TrendingUp className="w-3.5 h-3.5" /> Market Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Mandi <span className="gradient-text">Price Insights</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500 max-w-lg leading-relaxed">
              Real-time Agmarknet data and AI predictions for better decision making.
            </p>
          </div>
          
          <div className="flex gap-2 bg-gray-50/80 backdrop-blur-md rounded-xl border border-gray-200/60 p-1.5 shadow-sm">
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setDistrict(''); }}
              className="border-none text-sm font-semibold text-gray-700 focus:ring-0 py-2.5 pl-4 pr-10 bg-white cursor-pointer hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
            >
              {indianStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border-none text-sm font-semibold text-gray-700 focus:ring-0 py-2.5 pl-4 pr-10 bg-white cursor-pointer hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
            >
              <option value="">All Districts</option>
              {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="page-container">
        {isSummaryLoading ? (
        <div className="animate-pulse flex gap-6 mb-8">
           <div className="h-32 bg-gray-200 rounded-xl flex-1"></div>
           <div className="h-32 bg-gray-200 rounded-xl flex-1"></div>
           <div className="h-32 bg-gray-200 rounded-xl flex-1"></div>
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Card */}
          <div className="card-elevated p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500">
              <Target className="w-24 h-24" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Weekly Average (7d)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900 tracking-tight">₹{summary.avg7d.toFixed(2)}</p>
              <p className="text-sm font-bold text-gray-400">/ kg</p>
            </div>
            <div className={`mt-5 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
              isUp ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
            }`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {Math.abs(parseFloat(trendPercent))}% vs last 30d
            </div>
          </div>

          {/* Range Card */}
          <div className="card-elevated p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Monthly Range (30d)</p>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Low</p>
                <p className="text-2xl font-black text-gray-900">₹{summary.minPrice.toFixed(2)}</p>
              </div>
              <div className="h-10 w-px bg-gray-100"></div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">High</p>
                <p className="text-2xl font-black text-gray-900">₹{summary.maxPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-6 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
               <div className="bg-gradient-to-r from-primary-400 to-emerald-500 h-2 rounded-full relative" style={{ width: '50%', marginLeft: '25%' }}>
                 <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
               </div>
            </div>
          </div>

          {/* AI Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 border border-indigo-400/50 shadow-lg shadow-indigo-500/20 relative overflow-hidden text-white group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 blend-overlay" />
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-500">
              <BrainCircuit className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-200" /> AI Next Week Forecast
              </p>
              {isPredictionLoading ? (
                <div className="animate-pulse mt-4 h-10 bg-white/20 rounded-lg w-2/3 backdrop-blur-sm"></div>
              ) : aiPrediction ? (
                <>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-4xl font-black tracking-tight">₹{aiPrediction.predictedPrice.toFixed(2)}</p>
                    <p className="text-sm font-bold text-indigo-200">/ kg</p>
                    <span className={`ml-3 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase shadow-sm ${
                      aiPrediction.trend === 'UP' ? 'bg-red-500/90 text-white' : 
                      aiPrediction.trend === 'DOWN' ? 'bg-emerald-500/90 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {aiPrediction.trend}
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-semibold text-indigo-100 bg-white/10 backdrop-blur-md border border-white/20 inline-block px-3 py-1.5 rounded-lg shadow-inner">
                    {aiPrediction.confidenceText}
                  </p>
                </>
              ) : (
                <p className="text-sm text-indigo-200 mt-4 font-medium">No prediction available.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 mb-8 text-sm text-center">
          No market data available for {district}. Next ingestion runs tonight.
        </div>
      )}

      {/* Charts Section */}
      <div className="card-elevated overflow-hidden border-t-4 border-t-primary-500">
        <div className="border-b border-gray-100 p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 bg-gradient-to-b from-gray-50/50 to-white">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">30-Day Crop Price History</h2>
          
          <div className="flex gap-1.5 p-1 bg-gray-100/80 rounded-xl overflow-x-auto w-full sm:w-auto hide-scrollbar border border-gray-200/50">
            {crops.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-200 ${
                  selectedCrop === c 
                    ? 'bg-white text-primary-700 shadow-sm border border-gray-200/50 scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-5 sm:p-8">
          {isChartLoading ? (
            <div className="h-80 flex items-center justify-center">
               <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : chartData && chartData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value) => `₹${value}`}
                    dx={-15}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    formatter={(value: number) => [`₹${value.toFixed(2)} / kg`, 'Market Price']}
                    labelStyle={{ color: '#64748b', fontWeight: 700, marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    itemStyle={{ color: '#0f172a', fontSize: '14px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '25px', fontSize: '12px', fontWeight: 700, color: '#64748b' }}/>
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    name={`${selectedCrop} Average Price`}
                    stroke="#10b981" 
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[400px] flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <TrendingUp className="h-8 w-8 text-gray-300" />
               </div>
               <p className="text-gray-900 font-bold text-lg mb-1">No price history available</p>
               <p className="text-sm text-gray-500 max-w-sm">Data for {selectedCrop} in {district} will be recorded tonight. Please check back later.</p>
             </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
