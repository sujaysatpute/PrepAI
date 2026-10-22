import React from 'react';
import { motion } from 'motion/react';
import { Brain, CheckCircle2, TrendingUp, Sparkles, ChevronRight, Mic, ShieldCheck, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleStart = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleScrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-white to-white"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-indigo-50/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-medium mb-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>AI-Powered Technical Interview Simulator</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-slate-900 leading-[1.1]">
            Master Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Technical Interview</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Practice realistic mock interviews tailored to your exact role and seniority. Get real-time adaptive questioning and instant, actionable feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <button 
              type="button"
              onClick={handleStart} 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Start Practicing Free'} <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={handleScrollToFeatures} 
              className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-base"
            >
              How It Works <ArrowDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>No sign-up or credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-indigo-500" />
              <span>Voice speech-to-text input</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-violet-500" />
              <span>Gemini 2.5 Flash evaluation</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div id="features" className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mt-20 sm:mt-28 w-full text-left">
          {[
            { 
              icon: Brain, 
              title: "Contextual AI Questions", 
              desc: "Alex listens to your previous answers and dynamically asks follow-up questions tailored to your exact discipline and seniority." 
            },
            { 
              icon: CheckCircle2, 
              title: "Transparent Scoring", 
              desc: "Receive real scores across technical depth, clarity, communication, and confidence with specific strengths and areas for growth." 
            },
            { 
              icon: TrendingUp, 
              title: "Track Your Improvement", 
              desc: "Every completed interview is saved in your browser history so you can review feedback, track your scores, and measure progress." 
            }
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
