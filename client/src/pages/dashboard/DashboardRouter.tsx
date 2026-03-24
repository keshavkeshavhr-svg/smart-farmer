import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import FarmerDashboard from './FarmerDashboard';
import BuyerDashboard from './BuyerDashboard';

export default function DashboardRouter() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'FARMER') {
    return <FarmerDashboard />;
  }
  
  if (user.role === 'BUYER') {
    return <BuyerDashboard />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/" replace />;
}
