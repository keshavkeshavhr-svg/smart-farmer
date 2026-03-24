import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Sprout, Package, TrendingUp, Plus, IndianRupee, Eye,
  BarChart3, CheckCircle2,
  Leaf, ArrowUpRight, Star
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAppSelector } from '../../store/hooks';
import WeatherWidget from '../../components/ui/WeatherWidget';

export default function FarmerDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  const { data: crops, isLoading: isCropsLoading } = useQuery({
    queryKey: ['my-crops'],
    queryFn: async () => {
      const res = await api.get('/crops/my');
      return res as unknown as any[];
    },
  });

  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders') as any;
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const cropsList = Array.isArray(crops) ? crops : [];
  const ordersList = Array.isArray(orders) ? orders : [];

  const activeListings = cropsList.length;
  const pendingOrders = ordersList.filter(o => o.status === 'CREATED' || o.status === 'PROCESSING').length;
  const deliveredOrders = ordersList.filter(o => o.status === 'DELIVERED').length;
  const totalOrders = ordersList.length;
  
  const revenue = ordersList
    .filter(o => o.status === 'DELIVERED')
    .reduce((acc, order) => {
      const myItems = order.items?.filter((i: any) => cropsList.some((c: any) => c.id === i.cropId)) || [];
      return acc + myItems.reduce((sum: number, i: any) => sum + ((i.unitPrice || i.price || 0) * (i.quantityKg || i.quantity || 0)), 0);
    }, 0);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* ── Header Banner ── */}
      <div className="bg-white border-b border-gray-100 mb-8 pt-6 pb-8">
        <div className="page-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center border-4 border-emerald-50 shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {greeting}, <span className="gradient-text">{user?.name}</span>
              </h1>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Farmer Dashboard — {user?.district || 'Karnataka'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link to="/market" className="btn btn-secondary shadow-sm text-sm py-2">
              <BarChart3 className="w-4 h-4 mr-2" /> Market Prices
            </Link>
            <Link to="/dashboard/add-crop" className="btn btn-primary shadow-md text-sm py-2">
              <Plus className="w-4 h-4 mr-2" /> Add New Crop
            </Link>
          </div>
        </div>
      </div>
          <div className="page-container">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Listings */}
          <div className="card-elevated p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <Sprout className="w-5 h-5" />
              </div>
              <Link to="/dashboard/crops" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                View <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{isCropsLoading ? '—' : activeListings}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Active Listings</p>
          </div>

          {/* Total Orders */}
          <div className="card-elevated p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <Package className="w-5 h-5" />
              </div>
              <Link to="/dashboard/orders" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                View <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{isOrdersLoading ? '—' : totalOrders}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Total Orders</p>
            {pendingOrders > 0 && (
              <span className="absolute top-6 left-20 inline-flex items-center bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingOrders} new
              </span>
            )}
          </div>

          {/* Revenue */}
          <div className="card-elevated p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                Earned
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">₹{isOrdersLoading ? '—' : revenue.toLocaleString()}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Total Revenue</p>
          </div>

          {/* Fulfillment Rate */}
          <div className="card-elevated p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                Rate
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              {isOrdersLoading ? '—' : totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Fulfillment Rate</p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all duration-1000" 
                style={{ width: `${totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Listings & Orders */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Listings */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white">
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">My Crop Listings</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">{activeListings} active listings</p>
                </div>
                <Link to="/dashboard/add-crop" className="btn btn-primary shadow-sm text-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Add Crop
                </Link>
              </div>

              <div className="p-6">
                {isCropsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cropsList.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Sprout className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-base font-bold text-gray-900">No active crops</h3>
                    <p className="mt-1 text-sm text-gray-500 mb-4 max-w-sm mx-auto">You haven't added any crops yet. Start selling by listing your first harvest.</p>
                    <Link to="/dashboard/add-crop" className="btn btn-primary px-6 shadow-sm">List Your First Crop</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cropsList.slice(0, 4).map((crop: any) => (
                      <div key={crop.id} className="group border border-gray-100 rounded-2xl p-4 hover:border-emerald-200 hover:shadow-primary-md transition-all duration-300 bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-inner bg-gradient-to-br from-emerald-400 to-green-600">
                            {crop.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{crop.name}</h4>
                            <p className="text-xs text-gray-500 truncate mb-1">{crop.variety}</p>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-black text-gray-900 tracking-tight">₹{crop.pricePerKg}/kg</span>
                              <span className="text-[10px] uppercase font-bold text-gray-400">{crop.quantityKg}kg available</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50">
                            Active
                          </span>
                          <Link to={`/dashboard/crops`} className="text-gray-400 hover:text-emerald-600 transition-colors p-1.5 hover:bg-emerald-50 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {cropsList.length > 4 && (
                  <div className="mt-6 text-center">
                    <Link to="/dashboard/crops" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
                      View all {activeListings} listings →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white">
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Orders</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">{pendingOrders} awaiting action</p>
                </div>
                <Link to="/dashboard/orders" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  All Orders <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              <div className="p-0">
                {isOrdersLoading ? (
                  <div className="p-6 flex justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div></div>
                ) : ordersList.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="font-medium text-gray-900">No orders yet</p>
                    <p className="text-sm mt-1">When buyers purchase your crops, orders will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {ordersList.slice(0, 3).map((order: any) => (
                      <div key={order.id} className="p-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm
                            ${order.status === 'CREATED' || order.status === 'PROCESSING' ? 'bg-blue-500 shadow-blue-500/40' : 
                              order.status === 'SHIPPED' ? 'bg-amber-500 shadow-amber-500/40' : 
                              order.status === 'DELIVERED' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-red-500 shadow-red-500/40'}
                          `} />
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              Order <span className="text-gray-500">#{order.id.slice(-6)}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-2 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                              ₹{order.totalAmount.toLocaleString()} • {order.items?.length || 0} items
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border
                            ${order.status === 'CREATED' || order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                              order.status === 'SHIPPED' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                              order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                              'bg-red-50 text-red-700 border-red-100'}
                          `}>
                            {order.status === 'CREATED' ? 'NEW' : order.status}
                          </span>
                          <Link to={`/dashboard/orders`} className="btn btn-secondary px-3 py-1.5 text-xs">
                            Manage
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Widgets */}
          <div className="space-y-8">
            <WeatherWidget />

            <div className="card-elevated p-6 bg-gradient-to-b from-white to-gray-50/50">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/dashboard/add-crop" 
                  className="flex items-center p-4 rounded-xl hover:bg-emerald-50 group border border-transparent hover:border-emerald-100 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100/50 text-emerald-600 flex items-center justify-center mr-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Add New Crop</p>
                    <p className="text-xs text-gray-500 font-medium">List a new produce</p>
                  </div>
                </Link>

                <Link 
                  to="/dashboard/orders" 
                  className="flex items-center p-4 rounded-xl hover:bg-blue-50 group border border-transparent hover:border-blue-100 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100/50 text-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Manage Orders</p>
                    <p className="text-xs text-gray-500 font-medium">{pendingOrders} awaiting action</p>
                  </div>
                </Link>

                <Link 
                  to="/market" 
                  className="flex items-center p-4 rounded-xl hover:bg-amber-50 group border border-transparent hover:border-amber-100 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100/50 text-amber-600 flex items-center justify-center mr-3 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Market Prices</p>
                    <p className="text-xs text-gray-500 font-medium">View live mandi rates</p>
                  </div>
                </Link>

                <Link 
                  to="/store" 
                  className="flex items-center p-4 rounded-xl hover:bg-purple-50 group border border-transparent hover:border-purple-100 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100/50 text-purple-600 flex items-center justify-center mr-3 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Farming Store</p>
                    <p className="text-xs text-gray-500 font-medium">Seeds, tools & supplies</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
              <div className="absolute bottom-0 right-0 p-4 opacity-10">
                <BarChart3 className="w-16 h-16" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-2 relative z-10">Performance</h3>
              <p className="text-2xl font-black mb-1 relative z-10 tracking-tight">Top 15%</p>
              <p className="text-xs text-emerald-100 mb-5 relative z-10 font-medium leading-relaxed">Your crops are selling faster than the regional average.</p>
              
              <Link to="/dashboard" className="inline-flex items-center text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors relative z-10 border border-white/10">
                View Analytics <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
