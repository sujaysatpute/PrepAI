import React from 'react';
import { Brain } from 'lucide-react';
import { motion } from 'motion/react';

interface QuestionCardProps {
  key?: React.Key;
  msg: { role: string; content: string };
}

export default function QuestionCard({ msg }: QuestionCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
    >
      {msg.role === 'assistant' && (
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-[1px] shadow-sm shrink-0">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=f8fafc" alt="Alex - AI Interviewer" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
      )}
      <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${msg.role === 'assistant' ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none border border-indigo-700'}`}>
        {msg.role === 'assistant' && (
          <div className="mb-1">
            <span className="text-xs font-bold text-indigo-600">Alex (AI Interviewer):</span>
          </div>
        )}
        {msg.role === 'user' && (
          <div className="mb-1 text-right">
            <span className="text-xs font-bold text-indigo-200">You:</span>
          </div>
        )}
        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
      </div>
    </motion.div>
  );
}
