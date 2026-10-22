import React, { useState } from 'react';
import { Sparkles, Target, Brain, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Difficulty, Role } from '../utils/types';
import { getStoredRole } from '../utils/storage';

export default function InterviewSetup({ selectedRole }: { selectedRole: Role | null }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [questions, setQuestions] = useState(10);
  const navigate = useNavigate();

  const storedRole = getStoredRole();
  const activeRole = selectedRole || storedRole || {
    main: 'Software Developer',
    sub: 'Frontend Developer',
  };

  const difficulties: { id: Difficulty; desc: string; icon: any; color: string; bg: string; border: string }[] = [
    { id: 'Beginner', desc: 'Core fundamentals & junior-level concepts', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'Intermediate', desc: 'Practical problem solving & system logic', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'Advanced', desc: 'Deep architecture, edge cases & trade-offs', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate('/practice')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Change Role
        </button>
        <h1 className="text-3xl font-display font-bold text-slate-900">Configure Your Interview</h1>
        <p className="text-indigo-600 font-semibold mt-1.5 flex items-center gap-2 text-sm sm:text-base">
          <span>{activeRole.main}</span>
          <span className="text-slate-300">•</span>
          <span className="bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">{activeRole.sub}</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Difficulty Selection */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Difficulty Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {difficulties.map((d) => (
              <button 
                type="button"
                key={d.id} 
                onClick={() => setDifficulty(d.id)}
                className={`relative flex flex-col p-4 sm:p-5 rounded-xl border-2 text-left cursor-pointer transition-all ${difficulty === d.id ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {difficulty === d.id && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`w-9 h-9 rounded-lg ${d.bg} flex items-center justify-center ${d.color} mb-3`}>
                  <d.icon className="w-4 h-4" />
                </div>
                <div className={`font-bold text-sm sm:text-base ${difficulty === d.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                  {d.id}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <label htmlFor="question-count-slider" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Number of Questions
            </label>
            <span className="text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
              {questions}
            </span>
          </div>
          <div className="relative pt-2">
            <input 
              id="question-count-slider"
              type="range" 
              min="5" 
              max="20" 
              step="1"
              value={questions}
              onChange={(e) => setQuestions(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 relative z-10"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
              <span>5 (Quick 15 min)</span>
              <span>10 (Standard 30 min)</span>
              <span>15</span>
              <span>20 (Deep dive)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Recommended: 10 questions for a comprehensive mock interview session.</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate('/practice')} 
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm sm:text-base"
          >
            Back
          </button>
          <button 
            type="button"
            onClick={() => navigate('/interview', { 
              state: { 
                role: activeRole.main,
                specialization: activeRole.sub,
                difficulty,
                numberOfQuestions: questions
              }
            })} 
            className="flex-[2] py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 text-sm sm:text-base"
          >
            Start Interview <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
