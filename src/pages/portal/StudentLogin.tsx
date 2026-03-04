import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, GraduationCap, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function StudentLogin() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admission_number: admissionNumber, pin }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/portal/student');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-navy-900 p-8 text-center relative">
          <Link to="/portal" className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-gold-500">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-2">Student Login</h1>
          <p className="text-slate-300 text-sm">Access your dashboard</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Admission Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter admission number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">PIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter PIN"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

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
