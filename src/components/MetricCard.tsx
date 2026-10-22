import React from 'react';

interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  bgColor?: string;
  textColor?: string;
  valueColor?: string;
  variant?: 'dashboard' | 'progress';
}

export default function MetricCard({ 
  icon, 
  label, 
  value, 
  sub, 
  bgColor = 'bg-blue-50', 
  textColor = 'text-blue-600', 
  valueColor = 'text-slate-900', 
  variant = 'dashboard' 
}: MetricCardProps) {
  if (variant === 'progress') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-sm font-medium text-slate-500 mb-4">{label}</h3>
        <div className={`text-4xl font-display font-bold ${valueColor} mb-2`}>{value}</div>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    );
  }

  // Dashboard variant
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center ${textColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
