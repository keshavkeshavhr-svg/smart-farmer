import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wheat, ShoppingBag } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Crop Moderation', path: '/admin/crops', icon: Wheat },
    { name: 'Farm Store', path: '/admin/store', icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Admin Sub-Navigation Context Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto hide-scrollbar gap-1 py-3">
            {navItems.map((item) => {
              // Exact match for root Overview, standard matching for sub-paths
              const isActive = item.path === '/admin' 
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-500/10' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Page Content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
