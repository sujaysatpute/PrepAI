import React, { useState, useEffect, useRef } from 'react';
import { Brain, CheckCircle2, AlertCircle, ChevronRight, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResultChart from '../components/ResultChart';
import ProgressBar from '../components/ProgressBar';
import { requestEvaluation } from '../services/aiClient';
import { EvaluationResult, InterviewContext, InterviewSession, ChatMessage } from '../utils/types';
import { getSessionById, getStoredSessions, saveInterviewSession } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export default function ResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName } = useAuth();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const evaluationInProgressRef = useRef(false);

  const state = location.state as {
    sessionId?: string;
    context?: InterviewContext;
    history?: ChatMessage[];
  } | undefined;

  const runEvaluation = async (
    sessionId: string,
    context: InterviewContext,
    history: ChatMessage[]
  ) => {
    // If this session is already saved, load it immediately without re-evaluating
    const existing = getSessionById(sessionId, userName || undefined);
    if (existing) {
      setSession(existing);
      setIsEvaluating(false);
      return;
    }

    if (evaluationInProgressRef.current) return;
    evaluationInProgressRef.current = true;

    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const evalResult: EvaluationResult = await requestEvaluation(context, history);
      
      const newSession: InterviewSession = {
        id: sessionId,
        role: context.role,
        specialization: context.specialization,
        difficulty: context.difficulty,
        date: new Date().toISOString(),
        score: evalResult.score,
        confidence: evalResult.confidenceLevel,
        questionsAnswered: history.filter(m => m.role === 'user').length,
        totalQuestions: context.totalQuestions,
        evaluation: evalResult,
      };

      saveInterviewSession(newSession, userName || undefined);
      setSession(newSession);
      setIsEvaluating(false);
    } catch (err: any) {
      setIsEvaluating(false);
      setErrorMessage(
        err?.message || 'Failed to generate evaluation. Please check your connection and try again.'
      );
    } finally {
      evaluationInProgressRef.current = false;
    }
  };

  useEffect(() => {
    // 1. Check if we have incoming state from a completed interview
    if (state?.history && state.history.length > 0 && state.context) {
      const id = state.sessionId || `session_${Date.now()}`;
      runEvaluation(id, state.context, state.history);
      return;
    }

    // 2. Check query params or existing sessions
    const params = new URLSearchParams(location.search);
    const paramId = params.get('id');

    if (paramId) {
      const found = getSessionById(paramId, userName || undefined);
      if (found) {
        setSession(found);
        setIsEvaluating(false);
        return;
      }
    }

    // 3. Fallback to the most recent stored session
    const stored = getStoredSessions(userName || undefined);
    if (stored.length > 0) {
      setSession(stored[0]);
      setIsEvaluating(false);
    } else {
      setIsEvaluating(false);
      // No sessions available
    }
  }, [location.state, location.search, userName]);

  // Loading state
  if (isEvaluating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <Brain className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Evaluating Your Interview...</h2>
        <p className="text-slate-500 text-sm text-center max-w-sm">
          Alex is analyzing your technical depth, clarity, and communication structure.
        </p>
      </div>
    );
  }

  // Error state (never invent fake scores)
  if (errorMessage) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Evaluation Unavailable</h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">{errorMessage}</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              if (state?.history && state.context) {
                const id = state.sessionId || `session_${Date.now()}`;
                runEvaluation(id, state.context, state.history);
              } else {
                navigate('/practice');
              }
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-200 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Empty state when no interview has been completed
  if (!session || !session.evaluation) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
          <Brain className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">No Interview Results Found</h2>
          <p className="text-slate-600 mt-2 text-sm">
            Complete a practice interview session to view your performance evaluation and actionable tips.
          </p>
        </div>
        <button
          onClick={() => navigate('/practice')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-200 transition-all inline-flex items-center gap-2"
        >
          Start Practice Interview <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const { evaluation } = session;
  const score = evaluation.score;

  // Honest performance headline
  const getVerdict = (s: number) => {
    if (s >= 85) return { tag: 'Excellent Performance', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Outstanding technical knowledge and clear communication.' };
    if (s >= 70) return { tag: 'Good Performance', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', desc: 'Solid foundation with clear potential for improvement.' };
    if (s >= 50) return { tag: 'Moderate Performance', bg: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'Demonstrated partial understanding; focus on depth and structured examples.' };
    return { tag: 'Needs Practice', bg: 'bg-rose-100 text-rose-800 border-rose-200', desc: 'Spend time reviewing core concepts and practicing structured responses.' };
  };

  const verdict = getVerdict(score);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/progress')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Progress
        </button>
        <span className="text-xs text-slate-400 font-medium">
          {new Date(session.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-1 border ${verdict.bg}`}>
          {verdict.tag}
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
          Interview Evaluation
        </h1>
        <p className="text-indigo-600 font-semibold text-sm sm:text-base">
          {session.role} • {session.specialization} ({session.difficulty})
        </p>
        {evaluation.summary && (
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base pt-2 italic">
            "{evaluation.summary}"
          </p>
        )}
      </div>

      {/* Score Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <ResultChart score={score} />
          <h3 className="text-lg font-semibold text-slate-900 mt-6">Overall Score</h3>
          <p className="text-slate-500 text-sm mt-1">{verdict.desc}</p>
          <div className="text-xs text-slate-400 mt-3">
            {session.questionsAnswered} of {session.totalQuestions} questions answered
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Performance Breakdown</h3>
          <div className="space-y-5">
            {[
              { label: "Technical Knowledge", score: evaluation.technicalKnowledge },
              { label: "Confidence Level", score: evaluation.confidenceLevel },
              { label: "Clarity & Structure", score: evaluation.clarity },
              { label: "Communication Skills", score: evaluation.communication },
            ].map((m, i) => (
              <ProgressBar 
                key={m.label}
                label={m.label}
                value={`${m.score}%`}
                percentage={m.score}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Observed Strengths</h3>
          </div>
          <ul className="space-y-3">
            {evaluation.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-orange-50/50 rounded-2xl border border-orange-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Areas to Improve</h3>
          </div>
          <ul className="space-y-3">
            {evaluation.improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Tips */}
      <div className="bg-gradient-to-br from-indigo-50/80 to-white rounded-2xl border border-indigo-100 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900">Actionable AI Recommendations</h3>
        </div>
        <p className="text-slate-600 mb-4 text-sm">Targeted advice for your next interview:</p>
        <ul className="space-y-2.5 text-slate-700 text-sm">
          {evaluation.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-bold text-indigo-600 mr-1">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm text-center"
        >
          Dashboard
        </button>
        <button 
          onClick={() => navigate('/setup')} 
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200 transition-all text-center"
        >
          Practice Again
        </button>
        <button 
          onClick={() => navigate('/practice')} 
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-md transition-all flex items-center justify-center gap-2"
        >
          Try Different Role <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
