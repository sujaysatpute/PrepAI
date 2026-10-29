import React, { useEffect, useState } from 'react';
import { ChevronRight, Trash2, Calendar, Award, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import { InterviewSession } from '../utils/types';
import { getStoredSessions } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

function calculateStreak(sessions: InterviewSession[]): number {
  if (sessions.length === 0) return 0;
  const dates = Array.from(
    new Set(
      sessions.map(s => {
        const d = new Date(s.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    )
  ).sort().reverse();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let expected = new Date(dates[0]);

  for (const dateStr of dates) {
    const cur = new Date(dateStr);
    const diff = Math.round((expected.getTime() - cur.getTime()) / (1000 * 3600 * 24));
    if (diff === 0) {
      streak += 1;
      expected.setDate(expected.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export default function Progress() {
  const navigate = useNavigate();
  const { userName, storageId } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  useEffect(() => {
    const stored = getStoredSessions(storageId);
    setSessions(stored);
  }, [storageId]);

  const totalInterviews = sessions.length;
  const averageScore = totalInterviews > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalInterviews) 
    : 0;
  const avgConfidence = totalInterviews > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.confidence || 0), 0) / totalInterviews) 
    : 0;
  
  const streak = calculateStreak(sessions);

  // Role stats aggregation
  const roleCounts: Record<string, number> = {};
  sessions.forEach(s => {
    const r = s.specialization || s.role || 'General';
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  });
  
  const roleStats = Object.entries(roleCounts)
    .map(([role, count]) => ({ 
      role, 
      count, 
      pct: Math.round((count / Math.max(1, totalInterviews)) * 100) 
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const formatRelativeTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your local interview history? This cannot be undone.')) {
      const safeKey = (storageId || 'guest').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      localStorage.removeItem(`prepAI_sessions_${safeKey}`);
      localStorage.removeItem('interviewSessions');
      setSessions([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Your Progress</h1>
          <p className="text-slate-600 mt-1">Track your performance improvement and practice history</p>
        </div>
        {sessions.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard 
          variant="progress" 
          label="Interviews Completed" 
          value={totalInterviews.toString()} 
          sub="Total practice sessions" 
          valueColor="text-blue-600" 
        />
        <MetricCard 
          variant="progress" 
          label="Average Score" 
          value={totalInterviews > 0 ? `${averageScore}` : '—'} 
          sub="Out of 100" 
          valueColor="text-indigo-600" 
        />
        <MetricCard 
          variant="progress" 
          label="Confidence Level" 
          value={totalInterviews > 0 ? `${avgConfidence}%` : '—'} 
          sub="Based on AI evaluation" 
          valueColor="text-emerald-600" 
        />
        <MetricCard 
          variant="progress" 
          label="Practice Streak" 
          value={streak.toString()} 
          sub={streak === 1 ? 'day in a row' : 'days in a row'} 
          valueColor="text-orange-600" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interview History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Interview History</h2>
            <span className="text-xs text-slate-400 font-medium">Click session to view evaluation</span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
              <Award className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-medium text-slate-700">No interviews completed yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select your target role and complete a mock interview to start building your record.
              </p>
              <button
                onClick={() => navigate('/practice')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                Start Practice
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {sessions.map((s) => {
                const title = s.specialization || s.role || 'Software Interview';
                const subtitle = s.role && s.specialization && s.role !== s.specialization
                  ? `${s.role} • ${s.difficulty || 'Intermediate'}`
                  : `${s.difficulty || 'Intermediate'} difficulty`;

                return (
                  <div 
                    key={s.id} 
                    onClick={() => navigate(`/results?id=${s.id}`)}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all cursor-pointer group bg-slate-50/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-sm group-hover:scale-105 transition-transform">
                        {s.score}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                          {title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {subtitle} • {formatRelativeTime(s.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-600 hidden sm:inline">
                        View Results
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Roles Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Role Practice Distribution</h2>
          {roleStats.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm">
              No practice data yet.
            </div>
          ) : (
            <div className="space-y-5">
              {roleStats.map((r, i) => (
                <ProgressBar 
                  key={r.role}
                  label={r.role}
                  value={`${r.count} session${r.count === 1 ? '' : 's'}`}
                  percentage={r.pct}
                  delay={i * 0.1}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
