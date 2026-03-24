import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Database, RefreshCw, Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';
import { indianStates, getDistrictsByState } from '../../data/indianStatesDistricts';

export default function AdminMarketPage() {
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [district, setDistrict] = useState('Bangalore');
  const dispatch = useAppDispatch();

  const availableDistricts = useMemo(() => getDistrictsByState(selectedState), [selectedState]);

  // Test fetch the summary to see if data exists
  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['admin-market-summary', { district }],
    queryFn: async () => {
      const res = await api.get('/market/summary', { params: { cropName: 'Tomato', state: 'Karnataka', district } });
      return res as unknown as any;
    },
  });

  const ingestMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/admin/market/ingest');
    },
    onSuccess: () => {
      dispatch(addToast({ type: 'success', title: 'Sync Started', message: 'Market prices sync started in background' }));
      setTimeout(refetch, 3000);
    },
    onError: (err: any) => {
      dispatch(addToast({ type: 'error', title: 'Sync Failed', message: err.message || 'Failed to start sync' }));
    }
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-primary-600" /> Market Data Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configure and synchronize external mandi prices for AI and user dashboards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Data Sync Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
           <div>
             <h2 className="text-lg font-medium text-gray-900 mb-2">Agmarknet Sync (Mock)</h2>
             <p className="text-sm text-gray-500 mb-6">
               The background cron job runs nightly to fetch new prices. You can manually force an ingestion now to update local summaries.
             </p>
           </div>
           
           <button 
              onClick={() => ingestMutation.mutate()}
              disabled={ingestMutation.isPending}
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
           >
             {ingestMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
             Force Ingest Now
           </button>
        </div>

        {/* Data Health Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
           <div className="flex justify-between items-start mb-4">
             <h2 className="text-lg font-medium text-gray-900">Data Health</h2>
              <select 
                className="text-sm border-gray-200 rounded-lg bg-gray-50 py-1 mr-2"
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setDistrict(''); }}
              >
                {indianStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              <select 
                className="text-sm border-gray-200 rounded-lg bg-gray-50 py-1"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">All Districts</option>
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
           </div>
           
           {isLoading ? (
             <div className="animate-pulse space-y-4 pt-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
             </div>
           ) : summary ? (
             <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-2">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-2 text-sm">
                  <CheckCircle className="w-4 h-4" /> Valid Data Found for {district}
                </div>
                <p className="text-xs text-green-800">
                  Last updated: <span className="font-bold">{new Date(summary.lastUpdatedAt).toLocaleString()}</span>
                </p>
                <div className="mt-3 text-xs text-green-700 bg-white/50 p-2 rounded-md font-medium border border-green-200 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> AI Prediction models are trained.
                </div>
             </div>
           ) : (
             <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mt-2">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-2 text-sm">
                  <AlertTriangle className="w-4 h-4" /> No Data for {district}
                </div>
                <p className="text-xs text-amber-800">
                   Triger an ingestion to fetch prices for this region to build the 30-day index.
                </p>
             </div>
           )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
         <h3 className="font-semibold text-gray-900 mb-2">Technical Implementation Details</h3>
         <ul className="list-disc pl-5 space-y-1">
           <li>Prices are cached in Redis `price_summary:*` keys.</li>
           <li>Ingestion jobs run on BullMQ queue.</li>
           <li>AI linear regression evaluates on the last 30 `PricePoint` records.</li>
           <li>Cron runs at 2:00 AM daily.</li>
         </ul>
      </div>

    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
