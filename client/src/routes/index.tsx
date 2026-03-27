import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Lazy loaded pages (to be implemented)
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import BrowseCrops from '../pages/BrowseCrops';
import CropDetail from '../pages/CropDetail';
import FarmingStore from '../pages/FarmingStore';
import MarketPrices from '../pages/MarketPrices';
import Checkout from '../pages/Checkout';
import Contact from '../pages/Contact';

// Dashboard Routes
import DashboardRouter from '../pages/dashboard/DashboardRouter';
import OrdersList from '../pages/dashboard/OrdersList';
import OrderTracking from '../pages/dashboard/OrderTracking';
import AddCrop from '../pages/dashboard/AddCrop';

// Admin Routes
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersManager from '../pages/admin/UsersManager';
import AdminCropsPage from '../pages/admin/AdminCropsPage';
import AdminStorePage from '../pages/admin/AdminStorePage';
import AdminMarketPage from '../pages/admin/AdminMarketPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'crops', element: <BrowseCrops /> },
      { path: 'crops/:id', element: <CropDetail /> },
      { path: 'store', element: <FarmingStore /> },
      { path: 'market', element: <MarketPrices /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'contact', element: <Contact /> },
      // Protected Routes
      {
        path: 'dashboard',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <DashboardRouter /> },
          { path: 'orders', element: <OrdersList /> },
          { path: 'orders/:id', element: <OrderTracking /> },
          { path: 'add-crop', element: <AddCrop /> },
        ]
      },
      
      // Admin Routes
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: 'users', element: <UsersManager /> },
              { path: 'crops', element: <AdminCropsPage /> },
              { path: 'store', element: <AdminStorePage /> },
              { path: 'market', element: <AdminMarketPage /> },
            ]
          }
        ]
      }
    ]
  },
  { path: '*', element: <Navigate to="/" replace /> }
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
    // @ts-ignore - Flag is valid but might not be in the exact type defs
    v7_startTransition: true,
  }
});
