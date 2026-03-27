import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Leaf, Shield, Zap, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';

const DEMO_ACCOUNTS = [
  { label: 'Farmer', email: 'ramu@farmer.in', password: 'Farmer@123', icon: '🌿', gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200', text: 'text-emerald-800' },
  { label: 'Buyer', email: 'freshmart@buyer.in', password: 'Buyer@123', icon: '🛒', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200', text: 'text-blue-800' },
];

const leftPanelFeatures = [
  { icon: TrendingUp, title: 'Live Market Prices', desc: 'Real-time mandi prices from 500+ markets' },
  { icon: Zap, title: 'AI-Powered Insights', desc: 'Price predictions with 92% accuracy' },
  { icon: Shield, title: 'Secure Payments', desc: 'Razorpay escrow — zero risk trading' },
];

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleDemoClick = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmailOrPhone(account.email);
    setPassword(account.password);
    setActiveDemo(account.label);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user } = await api.post('/auth/login', { emailOrPhone, password });
      dispatch(setCredentials({ user }));
      dispatch(addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${user.name}` }));
      navigate(user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (err: any) {
      dispatch(addToast({ type: 'error', title: 'Login Failed', message: err.message || 'Invalid credentials' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col justify-between bg-gray-950 overflow-hidden p-12">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2232&auto=format&fit=crop"
            alt="Farm background"
            className="w-full h-full object-cover opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-950/95 to-primary-950/80" />
        </div>

        {/* Orbs */}
        <div className="absolute top-24 right-24 w-72 h-72 bg-primary-500 rounded-full blur-[140px] opacity-20" />
        <div className="absolute bottom-32 left-16 w-56 h-56 bg-cyan-500 rounded-full blur-[120px] opacity-15" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        {/* Content */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/40 rounded-xl blur-md" />
              <img src="/logo.png" alt="Smart Farmer" className="relative h-10 w-10 rounded-xl" />
            </div>
            <span className="text-xl font-black text-white">Smart<span className="text-primary-400">Farmer</span></span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider mb-5">
              <Leaf className="w-3 h-3" /> India's #1 AgriTech Platform
            </div>
            <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300">Indian Farmers</span><br />with Smart Technology
            </h1>
            <p className="text-gray-400 mt-4 leading-relaxed text-sm">
              Join 15,000+ farmers and buyers transforming agriculture. Trade directly, earn more, and grow smarter.
            </p>
          </div>

          <div className="space-y-4">
            {leftPanelFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-emerald-500/20 border border-primary-500/20 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold">{feature.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {[['15K+', 'Farmers'], ['₹2.4Cr', 'Traded'], ['500+', 'Mandis']].map(([val, label], i) => (
              <div key={i} className="text-center">
                <p className="text-xl font-black text-white">{val}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} Smart Farmer. All rights reserved.
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <img src="/logo.png" alt="Smart Farmer" className="h-10 w-10 rounded-xl shadow-md" />
            <span className="text-xl font-black text-gray-900">Smart<span className="text-primary-600">Farmer</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900">Welcome back 👋</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {/* Demo Accounts */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  onClick={() => handleDemoClick(account)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-bold transition-all duration-200 ${account.bg} ${account.text} ${activeDemo === account.label ? 'ring-2 ring-primary-400 ring-offset-1 scale-[1.03]' : ''}`}
                >
                  <span className="text-lg">{account.icon}</span>
                  {account.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-semibold text-gray-300 select-none">or sign in manually</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email or Phone</label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="you@example.com or 9876543210"
                className="input-field"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-500 hover:from-primary-700 hover:to-emerald-600 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2.5"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700">
              Create one free →
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-gray-300">
            Protected by Razorpay & 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}
