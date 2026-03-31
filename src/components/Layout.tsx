import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import WhatsAppButton from './WhatsAppButton';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50">
      {/* Top Bar */}
      <div className="bg-navy-900 text-white py-2 px-4 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <a href="tel:081363215668" className="flex items-center gap-1 hover:text-gold-400 transition-colors">
              <Phone size={14} />
              <span>081363215668</span>
            </a>
            <a href="mailto:ugcaekomiman23@gmail.com" className="flex items-center gap-1 hover:text-gold-400 transition-colors">
              <Mail size={14} />
              <span>ugcaekomiman23@gmail.com</span>
            </a>
          </div>
          <div className="flex items-center gap-1 opacity-80">
            <MapPin size={14} />
            <span>Obot Ndom, Ekom Iman, Etinan, AKS</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors duration-300">
                <GraduationCap size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl text-navy-900 leading-none">Uyo Golden City</span>
                <span className="text-xs font-medium text-gold-600 tracking-wider uppercase">Academy</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-gold-600 ${
                    location.pathname === link.path ? 'text-navy-900 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/portal"
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Portal
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-navy-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-navy-50 text-navy-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/portal"
                className="mt-2 bg-gold-500 text-navy-900 px-4 py-3 rounded-lg text-sm font-semibold text-center"
              >
                Portal
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gold-500">
                  <GraduationCap size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-xl text-white leading-none">Uyo Golden City</span>
                  <span className="text-xs font-medium text-gold-500 tracking-wider uppercase">Academy</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
                Nurturing the leaders of tomorrow with excellence, integrity, and a passion for learning.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-serif text-lg font-semibold mb-6 text-gold-500">Quick Links</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/admissions" className="hover:text-white transition-colors">Admissions</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/portal" className="hover:text-white transition-colors">Student Portal</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-serif text-lg font-semibold mb-6 text-gold-500">Contact Us</h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold-500 shrink-0 mt-0.5" />
                  <span>Obot Ndom, Ekom Iman,<br />Etinan, AKS, Nigeria</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-gold-500 shrink-0" />
                  <div className="flex flex-col">
                    <a href="tel:081363215668" className="hover:text-white transition-colors">081363215668</a>
                    <a href="tel:07064718334" className="hover:text-white transition-colors">07064718334</a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-gold-500 shrink-0" />
                  <a href="mailto:ugcaekomiman23@gmail.com" className="hover:text-white transition-colors">ugcaekomiman23@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} Uyo Golden City Academy. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
