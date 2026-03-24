import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, ArrowRight, Mail, MapPin, Phone, Heart } from 'lucide-react';

const footerLinks = {
  marketplace: [
    { name: 'Browse Crops', path: '/crops' },
    { name: 'Market Prices', path: '/market' },
    { name: 'Farming Store', path: '/store' },
    { name: 'Top Farmers', path: '/farmers' },
  ],
  support: [
    { name: 'Help Center', path: '/help' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQs', path: '/faq' },
    { name: 'Shipping Info', path: '/shipping' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Refund Policy', path: '/refund' },
  ],
};

const socials = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">
      {/* Top gradient line */}
      <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-emerald-400 to-cyan-400" />

      {/* BG glow */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary-600 rounded-full blur-[250px] opacity-5" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[200px] opacity-5" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <img src="/logo.png" alt="Smart Farmer" className="h-10 w-10 rounded-xl shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow" />
              <span className="text-2xl font-black text-white">
                Smart<span className="text-primary-400">Farmer</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-sm">
              Empowering Indian agriculture by connecting farmers and buyers directly, with fair prices, AI intelligence, and secure payments.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>Bangalore, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>support@smartfarmer.in</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>+91-80-1234-5678</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary-600 hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
                  aria-label={s.label}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-5">Marketplace</h3>
            <ul className="space-y-3">
              {footerLinks.marketplace.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm hover:text-primary-400 transition-colors duration-200 flex items-center gap-1 group">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-5">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm hover:text-primary-400 transition-colors duration-200 flex items-center gap-1 group">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-5">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm hover:text-primary-400 transition-colors duration-200 flex items-center gap-1 group">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Smart Farmer Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-bounce-gentle" />
            <span>for India</span>
            <span className="ml-1">🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
