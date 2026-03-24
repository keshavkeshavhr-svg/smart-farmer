import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastContainer from '../ui/ToastContainer';
import CartDrawer from '../../store/CartDrawer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full bg-gray-50 pt-16">
        <Outlet />
      </main>
      <Footer />
      
      {/* Global UI Components */}
      <ToastContainer />
      <CartDrawer />
    </div>
  );
}
