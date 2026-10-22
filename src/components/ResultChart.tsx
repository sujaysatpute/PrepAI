import React from 'react';
import { motion } from 'motion/react';

export default function ResultChart({ score }: { score: number }) {
  const dashArray = 283;
  const dashOffset = dashArray - (dashArray * score) / 100;
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <motion.circle 
          cx="50" cy="50" r="45" fill="none" stroke="#4f46e5" strokeWidth="8" 
          strokeDasharray="283" 
          initial={{ strokeDashoffset: 283 }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-display font-bold text-slate-900">{score}</span>
        <span className="text-sm text-slate-500 font-medium">/ 100</span>
      </div>
    </div>
  );
}
