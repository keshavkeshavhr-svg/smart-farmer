import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, MenuIcon, XIcon, LeafIcon, TrendingUpIcon, ShoppingBagIcon, HomeIcon, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { toggleCart } from '../../store/slices/cartSlice';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Market Prices', path: '/market', icon: TrendingUpIcon },
    { name: 'Browse Crops', path: '/crops', icon: LeafIcon },
    { name: 'Farming Store', path: '/store', icon: ShoppingBagIcon },
  ];

  const cartQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-2xl shadow-lg shadow-black/10 border-b border-gray-200/60'
            : 'bg-gray-950/70 backdrop-blur-xl border-b border-white/[0.07]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* ── Brand ── */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/30 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                <img
                  src="/logo.png"
                  alt="Smart Farmer"
                  className="relative h-9 w-9 rounded-xl shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/30 group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <span className={`text-xl font-black tracking-tight transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                Smart<span className="text-primary-500">Farmer</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated && navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive(link.path)
                      ? scrolled ? 'text-primary-600 bg-primary-50' : 'text-emerald-400 bg-white/10'
                      : scrolled
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <link.icon className={`w-3.5 h-3.5 ${isActive(link.path) ? 'text-primary-500' : ''}`} />
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* ── Right Controls ── */}
            <div className="hidden md:flex items-center gap-2">
              {/* Cart */}
              {isAuthenticated && (
                <button
                  onClick={() => dispatch(toggleCart())}
                  className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                    scrolled
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {cartQuantity > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-primary-500/30 animate-in zoom-in-50 duration-200">
                      {cartQuantity}
                    </span>
                  )}
                </button>
              )}

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 pl-2 ml-2 border-l border-gray-200/50">
                  <Link
                    to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      scrolled
                        ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-400 flex items-center justify-center text-white text-xs font-black shadow-sm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="hidden lg:block">{user.name?.split(' ')[0]}</span>
                    <LayoutDashboard className="w-3.5 h-3.5 opacity-50" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 ml-2 border-l border-gray-200/50">
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      scrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-500 hover:from-primary-700 hover:to-emerald-600 shadow-md shadow-primary-500/25 hover:shadow-primary-500/35 hover:scale-[1.03] transition-all duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Controls ── */}
            <div className="flex items-center md:hidden gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => dispatch(toggleCart())}
                  className={`relative p-2.5 rounded-xl transition-all ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {cartQuantity > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {cartQuantity}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2.5 rounded-xl transition-all ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              >
                {isMobileMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl shadow-black/10">
            <div className="px-4 pt-3 pb-5 space-y-1">
              {isAuthenticated && navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive(link.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${isActive(link.path) ? 'text-primary-500' : 'text-gray-400'}`} />
                  {link.name}
                </Link>
              ))}

              <div className={`border-t border-gray-100 pt-3 mt-3 space-y-1 ${!isAuthenticated ? 'border-t-0 pt-0 mt-0' : ''}`}>
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-400 flex items-center justify-center text-white text-xs font-black">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role?.toLowerCase()}</p>
                      </div>
                    </div>
                    <Link
                      to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <XIcon className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link to="/login" className="btn btn-secondary w-full justify-center">Log in</Link>
                    <Link to="/register" className="btn btn-primary w-full justify-center">Sign up free</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
