import React from 'react';
import { Target, TrendingUp, Play, ChevronRight, Briefcase, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveInterview, getStoredSessions, setStoredRole } from '../utils/storage';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userName, storageId } = useAuth();
  
  const displayName = userName || 'Candidate';
  const activeSession = getActiveInterview(storageId);
  const recentSessions = getStoredSessions(storageId);
  const lastSession = recentSessions[0];

  const handleContinueLast = () => {
    if (activeSession && activeSession.conversation.length > 0) {
      navigate('/interview', {
        state: {
          role: activeSession.context.role,
          specialization: activeSession.context.specialization,
          difficulty: activeSession.context.difficulty,
          numberOfQuestions: activeSession.context.totalQuestions,
        }
      });
      return;
    }

    if (lastSession) {
      setStoredRole({ main: lastSession.role, sub: lastSession.specialization });
      navigate('/setup');
      return;
    }

    navigate('/practice');
  };

  const handleRoleSelect = (roleName: string, subRole: string) => {
    setStoredRole({ main: roleName, sub: subRole });
    navigate('/setup');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Welcome back, {displayName}!
          </h1>
          <p className="text-slate-600 mt-1 text-base sm:text-lg">
            Ready to sharpen your technical interview skills?
          </p>
        </div>
        <button 
          onClick={() => navigate('/practice')} 
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 md:w-fit w-full"
        >
          <Plus className="w-5 h-5" /> Start Practice Interview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Quick Actions & Overview */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Quick Actions */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                type="button"
                onClick={() => navigate('/practice')}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group gap-3 shadow-sm hover:shadow-md h-full text-center"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-900">Start New Role</span>
                <span className="text-xs text-slate-500">Explore 6 engineering domains</span>
              </button>
              
              <button 
                type="button"
                onClick={handleContinueLast}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-all group gap-3 shadow-sm hover:shadow-md h-full text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Play className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-900">
                  {activeSession ? 'Resume Interview' : 'Repeat Last Practice'}
                </span>
                <span className="text-xs text-slate-500">
                  {activeSession 
                    ? `${activeSession.context.specialization} in progress` 
                    : lastSession 
                    ? `${lastSession.specialization}` 
                    : 'Quick setup'}
                </span>
              </button>
              
              <button 
                type="button"
                onClick={() => navigate('/progress')}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-all group gap-3 shadow-sm hover:shadow-md h-full text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-900">View Progress</span>
                <span className="text-xs text-slate-500">
                  {recentSessions.length} completed session{recentSessions.length === 1 ? '' : 's'}
                </span>
              </button>
            </div>
          </section>

          {/* Platform Overview */}
          <section className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-900/20">
            <div className="absolute -top-10 -right-10 p-8 opacity-10">
              <Info className="w-48 h-48" />
            </div>
            <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen -z-0"></div>
            
            <div className="relative z-10 max-w-xl">
              <h2 className="text-xs font-semibold mb-2 flex items-center gap-2 text-indigo-300 uppercase tracking-wider">
                How PrepAI Works
              </h2>
              <h3 className="text-2xl font-bold mb-3">Realistic AI Mock Interviews</h3>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
                Alex, your AI interviewer, asks contextual follow-up questions tailored to your responses. At the end of each session, receive an in-depth scorecard with strengths and targeted improvement tips.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300 border-t border-slate-800 pt-4">
                <div>✓ 6 Core Tech Disciplines</div>
                <div>✓ Adaptive Follow-up Logic</div>
                <div>✓ Voice & Text Modes</div>
                <div>✓ Privacy-First Local Storage</div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Suggested Roles */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              Popular Tracks
            </h2>
            <p className="text-xs text-slate-500 mb-4">Click to jump directly to interview setup:</p>
            <div className="space-y-3 flex-1 flex flex-col justify-start">
              {[
                { name: "Frontend Developer", role: "Software Developer", icon: Briefcase },
                { name: "Backend Developer", role: "Software Developer", icon: Briefcase },
                { name: "AWS Solutions Architect", role: "Cloud Engineer", icon: Target },
                { name: "Machine Learning Engineer", role: "Data Scientist", icon: TrendingUp }
              ].map((roleItem, i) => (
                <button 
                  key={i}
                  type="button"
                  onClick={() => handleRoleSelect(roleItem.role, roleItem.name)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group bg-slate-50/50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                      <roleItem.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 group-hover:text-slate-900 text-sm block">
                        {roleItem.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {roleItem.role}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
