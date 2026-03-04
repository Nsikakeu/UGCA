import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, User, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function PortalLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-navy-900 p-8 text-center relative">
          <Link to="/" className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-gold-500">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-2">Portal Access</h1>
          <p className="text-slate-300 text-sm">Select your role to continue</p>
        </div>

        <div className="p-8 space-y-4">
          <button
            onClick={() => navigate('/portal/staff-login')}
            className="w-full flex items-center p-4 rounded-xl border-2 border-slate-100 hover:border-gold-500 hover:bg-gold-50 transition-all group"
          >
            <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center text-navy-900 group-hover:bg-gold-500 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <div className="ml-4 text-left">
              <h3 className="font-bold text-navy-900">Staff Login</h3>
              <p className="text-sm text-slate-500">Teachers and Administrators</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/portal/student-login')}
            className="w-full flex items-center p-4 rounded-xl border-2 border-slate-100 hover:border-gold-500 hover:bg-gold-50 transition-all group"
          >
            <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center text-navy-900 group-hover:bg-gold-500 group-hover:text-white transition-colors">
              <User size={24} />
            </div>
            <div className="ml-4 text-left">
              <h3 className="font-bold text-navy-900">Student Login</h3>
              <p className="text-sm text-slate-500">Students and Parents</p>
            </div>
          </button>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-4">Are you a parent?</p>
            <button
              onClick={() => navigate('/portal/check-result')}
              className="text-navy-700 font-medium hover:text-gold-600 transition-colors text-sm"
            >
              Check Student Result &rarr;
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
