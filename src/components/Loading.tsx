import React from 'react';
import { motion } from 'motion/react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
        className="w-16 h-16 border-4 border-navy-900 border-t-gold-500 rounded-full"
      />
    </div>
  );
}
