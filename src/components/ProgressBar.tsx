import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  key?: React.Key;
  label: string;
  value: string;
  percentage: number;
  delay?: number;
}

export default function ProgressBar({ label, value, percentage, delay = 0 }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-indigo-600">{value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay }}
          className="h-full bg-indigo-600 rounded-full" 
        />
      </div>
    </div>
  );
}
