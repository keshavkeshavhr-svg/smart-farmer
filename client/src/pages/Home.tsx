import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowRight, Leaf, TrendingUp, DollarSign, Users, Store,
  CloudSun, Cpu, BarChart3, Truck, Star, Play,
  Zap, Globe, Award, Heart, Sparkles, ArrowUpRight, Check,
  Shield, Wheat, IndianRupee, Timer, Smartphone
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import type { Variants } from 'framer-motion';


/* ═══════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════ */
function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return { count, ref };
}

function useTypingEffect(words: string[], typingSpeed = 100, deleteSpeed = 50, pauseTime = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(word.substring(0, text.length + 1));
        if (text === word) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        setText(word.substring(0, text.length - 1));
        if (text === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? deleteSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deleteSpeed, pauseTime]);

  return text;
}

/* ═══════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════ */
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const fadeRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */
const stats = [
  { label: 'Active Farmers', value: 15000, suffix: '+', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
  { label: 'Live Mandi Prices', value: 2500, suffix: '+', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20' },
  { label: 'Orders Fulfilled', value: 48000, suffix: '+', icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20' },
  { label: 'Extra Profit', value: 30, suffix: '%', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10', ring: 'ring-purple-500/20' },
];

const features = [
  { icon: BarChart3, title: 'Live Mandi Prices', desc: 'Real-time APMC & mandi price tracking from 500+ markets across India with instant alerts.', color: 'from-blue-600 to-cyan-500', shadow: 'shadow-blue-500/25', path: '/market' },
  { icon: Cpu, title: 'AI Price Prediction', desc: 'ML models trained on 5 years of market data forecast crop prices 7 days ahead — 92% accuracy.', color: 'from-violet-600 to-purple-500', shadow: 'shadow-purple-500/25', path: '/market' },
  { icon: CloudSun, title: 'Weather Intelligence', desc: 'Hyper-local weather data with crop-specific advisories for sowing, irrigation & harvest timing.', color: 'from-amber-500 to-orange-500', shadow: 'shadow-orange-500/25', path: '/dashboard' },
  { icon: Store, title: 'Farming Store', desc: 'Premium seeds, fertilizers & equipment at factory-direct prices with doorstep delivery.', color: 'from-emerald-600 to-green-500', shadow: 'shadow-emerald-500/25', path: '/store' },
  { icon: Shield, title: 'Secure Payments', desc: 'Razorpay-powered escrow ensures zero-risk transactions. Get paid on time, every time.', color: 'from-indigo-600 to-blue-500', shadow: 'shadow-indigo-500/25', path: '/register' },
  { icon: Globe, title: 'Pan-India Network', desc: 'Connect with KYC-verified buyers & sellers across every state. Zero listing fees, forever.', color: 'from-rose-600 to-pink-500', shadow: 'shadow-rose-500/25', path: '/crops' },
];

const howItWorks = [
  { step: '01', title: 'Register Free', desc: 'Create your account as a Farmer or Buyer in under 2 minutes. No charges, ever.', icon: Smartphone },
  { step: '02', title: 'List or Browse', desc: 'Farmers list crops with photos & pricing. Buyers browse, filter & compare.', icon: Wheat },
  { step: '03', title: 'Trade Direct', desc: 'Negotiate, place orders, and confirm deals — zero middlemen involved.', icon: IndianRupee },
  { step: '04', title: 'Get Paid Securely', desc: 'Secure Razorpay escrow payment with real-time order tracking & delivery.', icon: Timer },
];

const testimonials = [
  {
    name: 'Rajesh Patel',
    role: 'Cotton Farmer • Gujarat',
    text: 'Smart Farmer helped me earn 35% more for my cotton crop this season. The AI price prediction told me exactly when to sell — I would have lost ₹2 lakhs without it!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    highlight: '+35% Revenue',
  },
  {
    name: 'Priya Sharma',
    role: 'Procurement Head • Maharashtra',
    text: 'Direct connection with farmers cut our supply chain costs by 20%. The quality assurance and escrow payments give us complete peace of mind.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    highlight: '-20% Costs',
  },
  {
    name: 'Vikram Singh',
    role: 'Wheat Farmer • Punjab',
    text: 'The weather alerts saved my entire wheat crop during last monsoon. And the mandi tracker? Every farmer in my village now uses Smart Farmer.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    highlight: 'Crop Saved',
  },
];



const partners = ['Agmarknet', 'Razorpay', 'OpenWeatherMap', 'AWS', 'NABARD', 'IFFCO', 'ICAR'];

/* ═══════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════ */
function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const { count, ref } = useCountUp(stat.value);
  const Icon = stat.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.04] transition-all duration-300"
    >
      <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} ring-1 ${stat.ring} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-3xl font-black text-white tabular-nums tracking-tight">
          {stat.value >= 1000 ? `${(count / 1000).toFixed(count >= stat.value ? 0 : 1)}K` : count}
          <span className="text-primary-500 ml-0.5">{stat.suffix}</span>
        </p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em]">{stat.label}</p>
      </div>
    </motion.div>
  );
}



/* ═══════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════ */
export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const typedText = useTypingEffect(['Zero Middlemen.', 'Maximum Profits.', 'AI-Powered.', 'Pan-India.'], 80, 40, 2500);

  return (
    <div className="bg-gray-950 overflow-hidden selection:bg-primary-500 selection:text-white">

      {/* ═══════════════════════════════════════
          1 · HERO
          ═══════════════════════════════════════ */}
      <div ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-gray-950">
        {/* Parallax BG */}
        <motion.div style={{ y: yBg, scale: scaleHero }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=2670&auto=format&fit=crop"
            alt="Indian Farmer in field"
            className="w-full h-full object-cover opacity-35 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/40 to-gray-950" />
        </motion.div>

        {/* Animated orbs */}
        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-primary-500 rounded-full mix-blend-screen filter blur-[200px] opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-32 left-10 w-[500px] h-[500px] bg-cyan-400 rounded-full mix-blend-screen filter blur-[180px] opacity-15 animate-float" />
        <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-purple-500 rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-float-delayed" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Content */}
        <motion.div style={{ opacity: opacityHero }} className="relative z-10 w-full max-w-7xl px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Logo badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <img src="/logo.png" alt="Smart Farmer" className="w-16 h-16 rounded-2xl shadow-2xl shadow-primary-500/30 ring-1 ring-white/10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.07] border border-white/[0.12] backdrop-blur-xl text-white/80 text-sm font-semibold mb-10 shadow-xl shadow-black/20"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            India's #1 Smart Agriculture Platform
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight text-white mb-4 leading-[1.05]"
          >
            Farm to Market.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-[4.5rem] sm:h-[5.5rem] md:h-[6rem] flex items-center"
          >
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-300 to-cyan-400">
              {typedText}
            </span>
            <span className="w-[3px] h-[2.5rem] sm:h-[3.5rem] bg-primary-400 ml-1 animate-pulse" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-lg sm:text-xl text-gray-400 max-w-2xl font-light leading-relaxed"
          >
            The ultimate ecosystem for Indian farmers. Track market trends with AI,
            access premium supplies, and sell directly to buyers nationwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-500 rounded-2xl hover:shadow-[0_20px_60px_rgba(22,163,74,0.35)] hover:scale-[1.03] transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              to="/market"
              className="group inline-flex items-center gap-3 px-8 py-4 text-base font-semibold text-white/90 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all duration-300"
            >
              <Play className="w-4 h-4 text-primary-400" />
              View Live Markets
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16 flex items-center gap-6 text-gray-500 text-xs font-medium"
          >
            <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Free Forever</div>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-400" /> Razorpay Secured</div>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-400" /> 15,000+ Users</div>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent z-20" />
      </div>

      {/* ═══════════════════════════════════════
          2 · STATS
          ═══════════════════════════════════════ */}
      <div className="relative z-30 -mt-24 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          3 · FEATURES — BENTO GRID
          ═══════════════════════════════════════ */}
      <section className="relative py-28 sm:py-36 bg-gray-950 overflow-hidden">
        {/* Advanced background elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary-600 rounded-full blur-[200px] mix-blend-screen" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[220px] mix-blend-screen -translate-y-1/2" />
        </div>
        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/[0.1] text-primary-400 text-xs font-bold uppercase tracking-[0.15em] mb-6 shadow-lg shadow-black/20">
                <Zap className="w-3.5 h-3.5" /> Platform Features
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Everything you need
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-400 to-cyan-400">to thrive</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
              A complete smart agriculture ecosystem — from price intelligence and AI predictions to secure payments and logistics.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  variants={fadeUp}
                  key={i}
                  className={`group relative bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.08] transition-all duration-500 overflow-hidden shadow-2xl shadow-black/40 ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                >
                  <Link to={f.path} className="block p-8 h-full w-full relative z-10">
                    {/* Hover glow */}
                    <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${f.color} rounded-full opacity-0 group-hover:opacity-[0.07] blur-3xl transition-all duration-700 group-hover:scale-150`} />

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} text-white mb-6 ${f.shadow} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">{f.desc}</p>

                    <div className="flex items-center gap-2 text-primary-400 text-sm font-bold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Explore <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4 · HOW IT WORKS
          ═══════════════════════════════════════ */}
      <section className="relative py-28 sm:py-36 bg-gray-950 overflow-hidden border-t border-white/5">
        {/* Advanced background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[200px] mix-blend-screen" />
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[250px] mix-blend-screen" />
        </div>
        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/[0.1] text-blue-400 text-xs font-bold uppercase tracking-[0.15em] mb-6 shadow-lg shadow-black/20">
                <Award className="w-3.5 h-3.5" /> Simple 4-Step Process
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
              Start trading in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">minutes</span>
            </motion.h2>
          </motion.div>

          <div className="relative">
            {/* Animated connector */}
            <div className="hidden lg:block absolute top-24 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-0.5">
              <div className="w-full h-full bg-gradient-to-r from-primary-500/20 via-blue-500/20 to-purple-500/20 rounded-full" />
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"
                initial={{ width: '0%' }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
              />
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {howItWorks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div variants={fadeUp} key={i} className="relative text-center group">
                    <div className="relative z-10 mx-auto w-20 h-20 rounded-3xl bg-white/[0.04] backdrop-blur-xl border-2 border-white/[0.08] group-hover:border-primary-500/50 flex items-center justify-center transition-all duration-500 shadow-2xl shadow-black/40 group-hover:shadow-primary-500/20 mb-8 group-hover:-translate-y-1">
                      <Icon className="w-8 h-8 text-gray-400 group-hover:text-primary-400 transition-colors duration-300" />
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-cyan-400 text-[10px] font-black text-white flex items-center justify-center shadow-md shadow-black/30">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed max-w-[200px] mx-auto font-light">{item.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5 · MARKET INTELLIGENCE
          ═══════════════════════════════════════ */}
      <section className="relative py-28 sm:py-36 bg-gray-950 overflow-hidden border-t border-white/5">
        {/* Advanced background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600 rounded-full blur-[200px] mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600 rounded-full blur-[250px] mix-blend-screen" />
        </div>
        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <motion.div variants={fadeLeft}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/[0.1] text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] mb-6 shadow-lg shadow-black/20">
                  <TrendingUp className="w-3.5 h-3.5" /> Market Intelligence
                </span>
              </motion.div>
              <motion.h2 variants={fadeLeft} className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-[1.1]">
                Never sell blind.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Know the true price.
                </span>
              </motion.h2>
              <motion.p variants={fadeLeft} className="text-lg text-gray-400 mb-8 leading-relaxed font-light">
                Smart Farmer aggregates daily mandi prices from Agmarknet and uses AI to forecast upcoming trends. Maximize your harvest value with data.
              </motion.p>
              <motion.ul variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-4 mb-8">
                {[
                  'District-level tracking from 500+ mandis',
                  '7-day AI forecasts with 92% accuracy',
                  'Instant SMS alerts for price spikes',
                ].map((item, i) => (
                  <motion.li variants={fadeUp} key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Check className="w-4 h-4" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={fadeUp}>
                <Link to="/market" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-sm hover:from-emerald-500 hover:to-cyan-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]">
                  Explore Market Prices <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2670&auto=format&fit=crop" alt="Market data" className="w-full aspect-[4/3] object-cover" />
                {/* Glass overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <div className="bg-gray-950/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.15em]">AI Predicted — Tomato</p>
                        <p className="text-2xl font-black text-white">₹32.50<span className="text-sm font-medium text-gray-400 ml-1">/ kg</span></p>
                      </div>
                      <div className="h-11 w-11 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '85%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' as const }}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-emerald-600 font-bold">↑ 15% next week</p>
                      <p className="text-xs text-gray-400 font-medium">92% confidence</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/20 blur-xl rounded-3xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-500/20 blur-xl rounded-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6 · DIRECT TRADING
          ═══════════════════════════════════════ */}
      <section className="relative py-28 sm:py-36 bg-gray-950 overflow-hidden border-t border-white/5">
        {/* Advanced background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-orange-600 rounded-full blur-[200px] mix-blend-screen" />
          <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-600 rounded-full blur-[250px] mix-blend-screen" />
        </div>
        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-last lg:order-first relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop" alt="Fresh produce" className="w-full aspect-[4/3] object-cover opacity-90" />
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  className="absolute top-5 right-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2.5 px-5 rounded-2xl shadow-xl shadow-black/50 text-sm ring-1 ring-white/20"
                >
                  🤝 Direct to Buyer
                </motion.div>
                <div className="absolute bottom-5 left-5 bg-gray-950/80 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Avg. Monthly Savings</p>
                  <p className="text-xl font-black text-emerald-400">₹12,500</p>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-500/20 blur-xl rounded-3xl -z-10" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/20 blur-xl rounded-3xl -z-10" />
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="order-first lg:order-last">
              <motion.div variants={fadeRight}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/[0.1] text-orange-400 text-xs font-bold uppercase tracking-[0.15em] mb-6 shadow-lg shadow-black/20">
                  <Store className="w-3.5 h-3.5" /> Direct Trading Hub
                </span>
              </motion.div>
              <motion.h2 variants={fadeRight} className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-[1.1]">
                Skip middlemen.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Keep your profits.</span>
              </motion.h2>
              <motion.p variants={fadeRight} className="text-lg text-gray-400 mb-10 leading-relaxed font-light">
                Connect directly with commercial buyers, grocery chains, and local markets. Zero listing fees, forever.
              </motion.p>
              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 gap-4">
                {[
                  { icon: Leaf, title: 'Quality Control', desc: 'Buyer ratings reward top-tier farmers' },
                  { icon: Shield, title: '100% Secure', desc: 'Escrow payments — zero default risk' },
                  { icon: Truck, title: 'Logistics Help', desc: 'Integrated delivery partners' },
                  { icon: Award, title: 'Verified Buyers', desc: 'KYC-verified, genuine transactions' },
                ].map((card, i) => (
                  <motion.div variants={fadeUp} key={i} className="group bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.08] transition-all duration-300 shadow-2xl shadow-black/40 hover:shadow-orange-500/10">
                    <card.icon className="w-6 h-6 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white mb-1 text-sm">{card.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">{card.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7 · AI SHOWCASE (dark)
          ═══════════════════════════════════════ */}
      <section className="relative py-28 sm:py-36 bg-gray-950 overflow-hidden">
        {/* Mesh gradient */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-primary-600 rounded-full blur-[250px]" />
          <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[220px]" />
          <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[180px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-20">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/[0.1] text-white/70 text-xs font-bold uppercase tracking-[0.15em] mb-6">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Powered by AI
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Intelligence at your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">fingertips</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Advanced ML algorithms analyze historical data, weather patterns, and market signals to give you an unfair advantage.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {[
              { icon: BarChart3, title: 'Price Prediction', desc: 'ML models trained on 5 years of APMC data predict crop prices 7 days ahead with remarkable accuracy.', gradient: 'from-cyan-500 to-blue-600', glow: 'group-hover:shadow-cyan-500/20', path: '/market' },
              { icon: CloudSun, title: 'Weather Advisory', desc: 'Hyper-local forecasts with crop-specific advisories — know when to sow, irrigate, and harvest.', gradient: 'from-amber-500 to-orange-600', glow: 'group-hover:shadow-amber-500/20', path: '/dashboard' },
              { icon: TrendingUp, title: 'Demand Forecasting', desc: 'Understand buyer demand trends and optimize your crop mix for maximum profitability.', gradient: 'from-purple-500 to-pink-600', glow: 'group-hover:shadow-purple-500/20', path: '/market' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  variants={fadeUp}
                  key={i}
                  className={`group relative bg-white/[0.04] backdrop-blur-md rounded-3xl border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.08] transition-all duration-500 ${item.glow} hover:shadow-2xl overflow-hidden`}
                >
                  <Link to={item.path} className="block p-8 h-full w-full">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8 · TESTIMONIALS
          ═══════════════════════════════════════ */}
      <section className="relative py-28 sm:py-36 bg-gray-950 overflow-hidden border-t border-white/5">
        {/* Advanced background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-orange-600 rounded-full blur-[200px] mix-blend-screen" />
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-amber-600 rounded-full blur-[250px] mix-blend-screen" />
        </div>
        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-20">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/[0.1] text-amber-400 text-xs font-bold uppercase tracking-[0.15em] mb-6 shadow-lg shadow-black/20">
                <Heart className="w-3.5 h-3.5" /> Community Love
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
              Loved by farmers
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">across India</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                variants={fadeUp}
                key={i}
                className="group relative bg-white/[0.04] backdrop-blur-xl rounded-3xl p-8 border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.08] transition-all duration-500 shadow-2xl shadow-black/40 hover:shadow-orange-500/10"
              >
                {/* Highlight badge */}
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md shadow-black/30">
                  {t.highlight}
                </div>

                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-400 mb-8 leading-relaxed text-[15px] font-light">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/10" />
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          9 · PARTNERS
          ═══════════════════════════════════════ */}
      <section className="py-16 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-[11px] font-bold text-gray-300 uppercase tracking-[0.25em] mb-10">
            Trusted Integrations & Partners
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            {partners.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-xl font-black text-gray-200 hover:text-primary-500 transition-colors duration-300 cursor-default select-none"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          10 · FINAL CTA
          ═══════════════════════════════════════ */}
      <section className="relative isolate py-32 sm:py-40 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gray-950" />
        <div className="absolute -top-40 right-0 -z-10 transform-gpu blur-[100px] opacity-30">
          <div className="w-[80rem] h-[40rem] bg-gradient-to-r from-primary-400 to-emerald-500 rounded-full" />
        </div>
        <div className="absolute -bottom-40 left-0 -z-10 transform-gpu blur-[100px] opacity-20">
          <div className="w-[60rem] h-[30rem] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
        </div>
        <div className="absolute inset-0 opacity-[0.04] -z-[5]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src="/logo.png" alt="Smart Farmer" className="w-14 h-14 rounded-2xl mx-auto mb-8 shadow-2xl shadow-primary-500/20 ring-1 ring-white/10" />

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]">
              Ready to transform your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-400 to-cyan-400">farming business</span>?
            </h2>
            <p className="mx-auto max-w-xl text-lg text-gray-400 mb-12 leading-relaxed">
              Join 15,000+ farmers and buyers transforming Indian agriculture. Free forever, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group relative inline-flex items-center px-10 py-4 text-base font-bold rounded-2xl bg-white text-gray-900 hover:bg-gray-50 shadow-2xl shadow-black/20 transition-all hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
              >
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/crops"
                className="group inline-flex items-center px-10 py-4 text-base font-semibold rounded-2xl bg-white/[0.06] text-white backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.12] hover:border-white/20 transition-all"
              >
                Browse Marketplace
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
