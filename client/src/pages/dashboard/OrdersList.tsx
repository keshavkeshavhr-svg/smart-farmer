import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Map, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAppSelector } from '../../store/hooks';

export default function OrdersList() {
  const { user } = useAppSelector((state) => state.auth);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders') as any;
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'FARMER' ? 'Sales Orders' : 'My Purchases'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.role === 'FARMER' ? 'Manage your crop sales and track fulfillment.' : 'Track your purchases from farmers and the store.'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        ) : ordersList.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {ordersList.map((order: any) => (
              <li key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-100 rounded-lg text-gray-500 hidden sm:block">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-gray-900">Order #{order.id.substring(0,8)}</h4>
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                          order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                          order.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' : 
                          order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 
                          'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      
                      <div className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3 w-fit mb-3">
                        <span className="font-semibold">{order.items.length} items</span> totaling <span className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                      </div>

                      {/* Contact Info - Farmer sees Buyer, Buyer sees Farmer */}
                      {user?.role === 'FARMER' && order.buyer && (
                        <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-3 py-2 w-fit border border-blue-100">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {order.buyer.name?.charAt(0)?.toUpperCase() || 'B'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{order.buyer.name}</p>
                            {order.buyer.phone && (
                              <a href={`tel:${order.buyer.phone}`} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                📞 {order.buyer.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      {user?.role === 'BUYER' && order.farmer && (
                        <div className="flex items-center gap-3 bg-emerald-50 rounded-lg px-3 py-2 w-fit border border-emerald-100">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {order.farmer.name?.charAt(0)?.toUpperCase() || 'F'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{order.farmer.name}</p>
                            {order.farmer.phone && (
                              <a href={`tel:${order.farmer.phone}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                📞 {order.farmer.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 items-start md:items-end min-w-[200px]">
                    <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                       <Map className="w-4 h-4 text-gray-400" />
                       Delivery to: <span className="text-gray-900 truncate max-w-[150px]" title={order.deliveryAddress}>{order.shippingDistrict || order.deliveryAddress}</span>
                    </div>
                    
                    <Link to={`/dashboard/orders/${order.id}`} className="btn btn-primary sm:w-auto w-full py-2 flex items-center justify-center gap-2">
                      View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <Package className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-xl font-medium text-gray-900">No orders found</p>
            <p className="text-base mt-2">
              {user?.role === 'FARMER' ? "You haven't made any sales yet." : "You haven't placed any orders yet."}
            </p>
            {user?.role === 'BUYER' && (
              <Link to="/crops" className="mt-6 btn btn-primary">
                Browse Marketplace
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
