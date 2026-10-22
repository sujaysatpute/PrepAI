import React from 'react';
import { ChevronRight } from 'lucide-react';

interface RoleCardProps {
  key?: React.Key;
  role: any;
  onClick: () => void;
}

export default function RoleCard({ role, onClick }: RoleCardProps) {
  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex flex-col h-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center text-white mb-6 shadow-md ${role.shadow} group-hover:scale-110 transition-transform`}>
        <role.icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{role.title}</h3>
      <p className="text-slate-500 text-sm flex-grow mb-6 leading-relaxed">{role.desc}</p>
      <div className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
        Select Track <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
