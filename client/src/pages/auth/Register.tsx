import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Briefcase, Sprout, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import { indianStates, getDistrictsByState } from '../../data/indianStatesDistricts';

export default function Register() {
  const [role, setRole] = useState<'FARMER' | 'BUYER'>('FARMER');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    district: '',
    state: 'Karnataka',
    farmName: '',
    company: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData({ ...formData, state: value, district: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const availableDistricts = useMemo(() => getDistrictsByState(formData.state), [formData.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...formData, role };
      const { user } = await api.post('/auth/register', payload);
      dispatch(setCredentials({ user }));
      dispatch(addToast({ type: 'success', title: 'Registration Successful', message: 'Welcome to Smart Farmer!' }));
      navigate(user.role === 'FARMER' ? '/dashboard' : '/');
    } catch (err: any) {
      dispatch(addToast({ type: 'error', title: 'Registration Failed', message: err.message || 'Please check your inputs' }));
    } finally {
      setIsLoading(false);
    }
  };

  const isFarmer = role === 'FARMER';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl shadow-lg transition-all duration-500 ${isFarmer ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
            {isFarmer ? <Sprout className="w-7 h-7 text-white" /> : <Briefcase className="w-7 h-7 text-white" />}
          </div>
          <span className="text-2xl font-black text-gray-900">Smart Farmer</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Create your account</h1>
        <p className="mt-2 text-sm text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">

          {/* ── ROLE SELECTOR ─────────────────────────────────── */}
          <div className="mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">I am joining as</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Farmer Card */}
              <button
                type="button"
                onClick={() => setRole('FARMER')}
                className={`relative overflow-hidden flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                  isFarmer
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-500/15'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isFarmer && (
                  <motion.div
                    layoutId="role-glow"
                    className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-400/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isFarmer ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Leaf className={`w-6 h-6 ${isFarmer ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="relative z-10 text-center">
                  <p className={`font-bold text-sm ${isFarmer ? 'text-emerald-700' : 'text-gray-700'}`}>Farmer</p>
                  <p className={`text-xs mt-0.5 ${isFarmer ? 'text-emerald-600/70' : 'text-gray-400'}`}>Sell crops directly</p>
                </div>
                {isFarmer && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                )}
              </button>

              {/* Buyer Card */}
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`relative overflow-hidden flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                  !isFarmer
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/15'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {!isFarmer && (
                  <motion.div
                    layoutId="role-glow"
                    className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  !isFarmer ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Briefcase className={`w-6 h-6 ${!isFarmer ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="relative z-10 text-center">
                  <p className={`font-bold text-sm ${!isFarmer ? 'text-blue-700' : 'text-gray-700'}`}>Buyer</p>
                  <p className={`text-xs mt-0.5 ${!isFarmer ? 'text-blue-600/70' : 'text-gray-400'}`}>Source fresh produce</p>
                </div>
                {!isFarmer && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Animated colored accent bar */}
          <div className={`h-1 rounded-full mb-8 transition-all duration-500 ${isFarmer ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`} />

          {/* ── FORM ────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  placeholder="Ramu Gowda"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="text" name="phone" required placeholder="10-digit number" value={formData.phone} onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email" name="email" required value={formData.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <p className="text-xs text-gray-400 mb-1.5">Min 8 chars with uppercase, lowercase & number</p>
                <input
                  type="password" name="password" required value={formData.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <AnimatePresence mode="wait">
                {isFarmer ? (
                  <motion.div key="farmName" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Farm Name <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text" name="farmName" value={formData.farmName} onChange={handleChange}
                      placeholder="e.g. Gowda Organic Farm"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </motion.div>
                ) : (
                  <motion.div key="company" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text" name="company" value={formData.company} onChange={handleChange}
                      placeholder="e.g. FreshMart Pvt Ltd"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <select name="state" required value={formData.state} onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                  {indianStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                <select name="district" required value={formData.district} onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                  <option value="">Select district</option>
                  {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg mt-2 ${
                isFarmer
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-emerald-500/30 hover:shadow-xl'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/30 hover:shadow-xl'
              } disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
            >
              {isLoading ? 'Creating account...' : `Register as ${isFarmer ? '🌿 Farmer' : '🛒 Buyer'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
