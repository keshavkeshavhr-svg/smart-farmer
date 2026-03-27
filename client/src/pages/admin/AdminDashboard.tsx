import { useQuery, useMutation } from '@tanstack/react-query';
import { Users, ShoppingBag, Map, TrendingUp, RefreshCw, Loader2, Activity, Database, Server, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const res = await api.get('/admin/metrics');
      const data = res as unknown as {
        metrics: {
          totalUsers: number;
          totalOrders: number;
          gmv: number;
          activeListings: number;
        };
        charts: {
          gmvOverTime: { month: string; amount: number }[];
        };
      };
      return data;
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
    { label: 'Total Users', value: data?.metrics?.totalUsers || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', shadow: 'shadow-indigo-500/20' },
    { label: 'Total Orders', value: data?.metrics?.totalOrders || 0, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/20' },
    { label: 'Total GMV', value: `₹${(data?.metrics?.gmv || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20', shadow: 'shadow-violet-500/20' },
    { label: 'Active Crop Listings', value: data?.metrics?.activeListings || 0, icon: Map, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20', shadow: 'shadow-amber-500/20' },
  ];

  const containerVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // Format month (e.g., '2023-10' -> 'Oct')
  const chartData = data?.charts?.gmvOverTime?.map(d => ({
    ...d,
    monthLabel: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short' })
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
          <p className="text-gray-500 mt-1.5 font-medium">Real-time metrics and administration shortcuts.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-sm font-semibold text-gray-600">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" /> Live Status
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 overflow-hidden border ${stat.border} shadow-lg shadow-gray-200/50 transition-all cursor-default group`}
            >
              {/* Background gradient blob */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 ${stat.bg} group-hover:scale-150 transition-transform duration-700`} />
              
              <div className="relative flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                    {isLoading ? <span className="animate-pulse bg-gray-200 text-transparent rounded">0000</span> : stat.value}
                  </h3>
                </div>
                <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} ${stat.shadow} shadow-sm group-hover:rotate-12 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Revenue Growth</h2>
              <p className="text-sm text-gray-500 font-medium">Gross Merchandise Value over the last 6 months</p>
            </div>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                     formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorGmv)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                 Not enough data points yet.
               </div>
            )}
          </div>
        </motion.div>

        {/* Action & Status Stack */}
        <div className="flex flex-col gap-8">
          {/* Market Data Controls */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4 }}
             className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-xl shadow-gray-900/20 border border-gray-700 p-6 text-white relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Database className="w-32 h-32" />
             </div>
             <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2">Market Data Sync</h2>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Market prices are pulled nightly. Trigger a manual synchronization with the Agmarknet database mock instantly.
                </p>
                <button 
                  onClick={() => ingestMutation.mutate()}
                  disabled={ingestMutation.isPending}
                  className="w-full btn bg-emerald-500 hover:bg-emerald-400 text-white border-0 shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2 group transition-all"
                >
                  {ingestMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />}
                  Force Immediate Sync
                </button>
             </div>
          </motion.div>

          {/* System Health */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
             className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 flex-1"
          >
             <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-500" /> System Health
             </h2>
             <ul className="space-y-5">
               <li className="flex items-center justify-between group cursor-default">
                 <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    API Gateway
                 </span>
                 <span className="inline-flex items-center rounded-lg bg-green-50/80 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 group-hover:bg-green-100 transition-colors">Operational</span>
               </li>
               <li className="flex items-center justify-between group cursor-default">
                 <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    PostgreSQL DB
                 </span>
                 <span className="inline-flex items-center rounded-lg bg-green-50/80 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 group-hover:bg-green-100 transition-colors">Operational</span>
               </li>
               <li className="flex items-center justify-between group cursor-default">
                 <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    Redis Cache
                 </span>
                 <span className="inline-flex items-center rounded-lg bg-green-50/80 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 group-hover:bg-green-100 transition-colors">Operational</span>
               </li>
                <li className="flex items-center justify-between group cursor-default pt-4 border-t border-gray-100">
                 <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-500" />
                    AI Core Engine
                 </span>
                 <span className="inline-flex items-center rounded-lg bg-amber-50/80 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20 group-hover:bg-amber-100 transition-colors">Mocked</span>
               </li>
             </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

