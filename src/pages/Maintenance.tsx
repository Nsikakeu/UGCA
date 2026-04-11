import { motion } from "motion/react";
import { Settings, Wrench, GraduationCap } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-gold-500 rounded-full blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border-2 border-dashed border-gold-500/50 rounded-full"
            />
            <div className="w-20 h-20 bg-gold-500 rounded-2xl flex items-center justify-center text-navy-900 shadow-lg transform rotate-3">
              <Wrench size={40} />
            </div>
          </div>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
          We'll Be Right Back
        </h1>

        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
          Uyo Golden City Academy is currently undergoing scheduled maintenance
          and upgrades to serve you better. We apologize for any inconvenience
          and appreciate your patience.
        </p>

        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full text-gold-400 font-medium">
          <Settings className="animate-spin-slow" size={20} />
          <span>System Upgrade in Progress...</span>
        </div>
      </motion.div>

      <div className="absolute bottom-8 text-slate-400 text-sm flex items-center gap-2">
        <GraduationCap size={16} />
        <span>&copy; {new Date().getFullYear()} Uyo Golden City Academy</span>
      </div>
    </div>
  );
}
