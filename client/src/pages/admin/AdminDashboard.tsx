import { useQuery, useMutation } from '@tanstack/react-query';
import { Users, ShoppingBag, Map, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const res = await api.get('/admin/metrics');
      return res as unknown as {
        totalUsers: number;
        totalOrders: number;
        totalGMV: number;
        activeCrops: number;
      };
    },
  });

  const ingestMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/admin/market/ingest');
    },
    onSuccess: () => {
      dispatch(addToast({ type: 'success', title: 'Ingestion Triggered', message: 'Market prices sync started in background' }));
    },
    onError: (err: any) => {
      dispatch(addToast({ type: 'error', title: 'Ingestion Failed', message: err.message || 'Failed to start sync' }));
    }
  });

  const statCards = [
    { label: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: metrics?.totalOrders || 0, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total GMV', value: `₹${(metrics?.totalGMV || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Crop Listings', value: metrics?.activeCrops || 0, icon: Map, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Key metrics and administration shortcuts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {isLoading ? <span className="animate-pulse bg-gray-200 text-transparent rounded">0000</span> : stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Data Controls */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Market Data Management</h2>
            <p className="text-sm text-gray-500 mb-6">
              Market data is pulled nightly. You can manually trigger a synchronization with the Agmarknet database mock.
            </p>
            <div className="flex gap-4">
               <button 
                  onClick={() => ingestMutation.mutate()}
                  disabled={ingestMutation.isPending}
                  className="btn btn-primary flex items-center gap-2"
               >
                 {ingestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                 Force Market Sync
               </button>
            </div>
         </div>

         {/* System Health */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">API Gateway</span>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">Operational</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">PostgreSQL DB</span>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">Operational</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Redis Cache & Queues</span>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">Operational</span>
              </li>
               <li className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">AI Core Engine</span>
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Mocked</span>
              </li>
            </ul>
         </div>
      </div>
    </div>
  );
}
