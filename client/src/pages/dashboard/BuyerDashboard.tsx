import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Package, Search, ShoppingBag, TrendingUp, 
  MapPin, Clock, CheckCircle2, Truck, 
  ArrowUpRight, IndianRupee, Leaf, ChevronRight, Store
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAppSelector } from '../../store/hooks';

export default function BuyerDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders') as any;
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const ordersList = Array.isArray(orders) ? orders : [];
  const activeOrders = ordersList.filter(o => o.status === 'CREATED' || o.status === 'PROCESSING' || o.status === 'SHIPPED');
  const deliveredOrders = ordersList.filter(o => o.status === 'DELIVERED');
  const totalSpent = ordersList.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const avgOrderValue = ordersList.length > 0 ? totalSpent / ordersList.length : 0;

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* ── Header Banner ── */}
      <div className="bg-white border-b border-gray-100 mb-8 pt-6 pb-8">
        <div className="page-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center border-4 border-indigo-50 shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {greeting}, <span className="gradient-text">{user?.name}</span>
              </h1>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Buyer Dashboard — Fresh from the farm
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link to="/market" className="btn hover:bg-gray-50 border border-gray-200 shadow-sm text-gray-700 text-sm py-2">
              <TrendingUp className="w-4 h-4 mr-2" /> Market Prices
            </Link>
            <Link to="/crops" className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 text-sm py-2">
              <Search className="w-4 h-4 mr-2" /> Browse Crops
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Orders */}
          <div className="card-elevated p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <Truck className="w-5 h-5" />
              </div>
              <Link to="/dashboard/orders" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                Track <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{isLoading ? '—' : activeOrders.length}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Active Orders</p>
            {activeOrders.length > 0 && (
              <div className="absolute top-6 left-20 inline-flex items-center bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeOrders.filter(o => o.status === 'SHIPPED').length} in transit
              </div>
            )}
          </div>

          {/* Completed */}
          <div className="card-elevated p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                Delivered
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{isLoading ? '—' : deliveredOrders.length}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Completed Orders</p>
          </div>

          {/* Total Spent */}
          <div className="card-elevated p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                Lifetime
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">₹{isLoading ? '—' : totalSpent.toLocaleString('en-IN')}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Total Spent</p>
          </div>

          {/* Avg Order Value */}
          <div className="card-elevated p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                Avg
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">₹{isLoading  ? '—' : avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Avg. Order Value</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Active Orders Panel */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-6 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white">
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Order Tracker</h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">{activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}</p>
              </div>
              <Link to="/dashboard/orders" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                All orders <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="p-8 text-center flex justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : ordersList.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {ordersList.slice(0, 6).map((order: any) => (
                  <Link key={order.id} to={`/dashboard/orders/${order.id}`} className="px-6 py-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border border-green-100/50' : 
                        order.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' :
                        order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-600 border border-blue-100/50' : 
                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-100/50' :
                        'bg-amber-50 text-amber-600 border border-amber-100/50'
                      }`}>
                        {order.status === 'DELIVERED' ? <CheckCircle2 className="w-5 h-5" /> : 
                         order.status === 'SHIPPED' ? <Truck className="w-5 h-5" /> :
                         order.status === 'PROCESSING' ? <Clock className="w-5 h-5" /> : 
                         <Package className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">Order #{order.id.substring(0,8)}</h4>
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm border ${
                            order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-100' : 
                            order.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>{order.status}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <span className="text-gray-300">•</span>
                          {order.items ? <span className="text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{order.items.length} items</span> : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-gray-900 tracking-tight">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-gray-100">
                         <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5 border-4 border-indigo-100/30">
                  <ShoppingBag className="w-8 h-8 text-indigo-300" />
                </div>
                <p className="text-xl font-black text-gray-900 tracking-tight">No orders yet</p>
                <p className="text-sm font-medium text-gray-500 mt-2 max-w-xs leading-relaxed">Start by browsing fresh crops directly from verified farmers.</p>
                <Link to="/crops" className="btn btn-primary mt-6 shadow-sm px-6">
                  <Search className="w-4 h-4 mr-1.5" /> Browse Marketplace
                </Link>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Explore Panel */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 blend-overlay" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl group-hover:scale-125 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5 text-indigo-100" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Discover Fresh</h3>
                </div>
                <p className="text-white text-sm mb-6 leading-relaxed font-medium">
                  Buy directly from local farmers. No middlemen, no markups — just pure farm-fresh quality delivered to your door.
                </p>
                <Link to="/crops" className="inline-flex items-center justify-center w-full gap-2 bg-white text-indigo-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                  <Search className="w-4 h-4" /> Browse Marketplace
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-elevated p-6 bg-gradient-to-b from-white to-gray-50/50">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/crops" className="flex items-center p-4 rounded-xl hover:bg-emerald-50 group border border-transparent hover:border-emerald-100 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100/50 text-emerald-600 flex items-center justify-center mr-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Browse Crops</p>
                    <p className="text-xs font-medium text-gray-500">Farm-fresh produce</p>
                  </div>
                </Link>
                <Link to="/store" className="flex items-center p-4 rounded-xl hover:bg-blue-50 group border border-transparent hover:border-blue-100 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-blue-100/50 text-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Farming Store</p>
                    <p className="text-xs font-medium text-gray-500">Tools & seeds delivery</p>
                  </div>
                </Link>
                <Link to="/dashboard/orders" className="flex items-center p-4 rounded-xl hover:bg-amber-50 group border border-transparent hover:border-amber-100 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-amber-100/50 text-amber-600 flex items-center justify-center mr-3 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Track Deliveries</p>
                    <p className="text-xs font-medium text-gray-500">{activeOrders.length} active shipment{activeOrders.length !== 1 ? 's' : ''}</p>
                  </div>
                </Link>
                <Link to="/market" className="flex items-center p-4 rounded-xl hover:bg-indigo-50 group border border-transparent hover:border-indigo-100 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100/50 text-indigo-600 flex items-center justify-center mr-3 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">Market Prices</p>
                    <p className="text-xs font-medium text-gray-500">Track commodity rates</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Account Summary */}
            <div className="card-elevated p-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Account Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Total Orders</span>
                  <span className="font-bold text-gray-900">{ordersList.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Total Spent</span>
                  <span className="font-bold text-gray-900">₹{totalSpent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Avg. Order</span>
                  <span className="font-bold text-gray-900">₹{avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="w-full h-px bg-gray-100 my-2" />
                <div className="flex justify-between items-center text-sm mt-3">
                  <span className="text-gray-400 font-medium text-xs">Member Since</span>
                  <span className="font-bold text-gray-600 text-xs tracking-tight">{new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-bold text-gray-900 text-right">{user?.district || 'Bangalore'}, {user?.state || 'KA'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
