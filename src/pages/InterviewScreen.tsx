import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Clock, Volume2, Brain, Mic, Send, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Difficulty, Role } from '../utils/types';
import QuestionCard from '../components/QuestionCard';
import { useInterview } from '../hooks/useInterview';
import { useAuth } from '../context/AuthContext';
import { getStoredRole } from '../utils/storage';

export default function InterviewScreen({ selectedRole }: { selectedRole: Role | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName } = useAuth();
  
  const storedRole = getStoredRole();
  const locState = location.state as any;

  const role = locState?.role || selectedRole?.main || storedRole?.main || 'Software Developer';
  const specialization = locState?.specialization || selectedRole?.sub || storedRole?.sub || 'Frontend Developer';
  const difficulty: Difficulty = locState?.difficulty || 'Intermediate';
  const totalQuestions = Number(locState?.numberOfQuestions || 10);

  const {
    activeId,
    context,
    conversation,
    isAiTyping,
    error,
    isCompleted,
    startInterview,
    sendAnswer,
    retryLastTurn,
    finishInterview,
  } = useInterview(userName || undefined);

  const [answer, setAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || (window as any).SpeechRecognition)) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
        }
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      setRecognition(rec);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize Interview Session
  useEffect(() => {
    if (conversation.length === 0) {
      startInterview(role, specialization, difficulty, totalQuestions);
    }
  }, [role, specialization, difficulty, totalQuestions, startInterview, conversation.length]);

  // Turn timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAiTyping && !isCompleted) {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isAiTyping, isCompleted]);

  // Scroll to bottom & Auto-read question
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    const lastMsg = conversation[conversation.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && !isAiTyping) {
      const timer = setTimeout(() => {
        replayLastQuestion();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [conversation, isAiTyping]);

  const replayLastQuestion = () => {
    const aiMessages = conversation.filter(m => m.role === 'assistant');
    const lastAiMsg = aiMessages[aiMessages.length - 1];
    if (lastAiMsg && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lastAiMsg.content.trim());
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isAiTyping) return;
    
    const currentAnswer = answer;
    setAnswer('');
    
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    await sendAnswer(currentAnswer);
    setTimeElapsed(0);
  };

  const handleEndInterview = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const answeredCount = conversation.filter(m => m.role === 'user').length;
    if (answeredCount === 0) {
      if (confirm('You have not answered any questions yet. Do you want to return to role selection?')) {
        finishInterview();
        navigate('/practice');
      }
      return;
    }

    finishInterview();
    navigate('/results', {
      state: {
        sessionId: activeId,
        context: context.role ? context : { role, specialization, difficulty, totalQuestions },
        history: conversation,
      },
    });
  };

  const assistantCount = conversation.filter(m => m.role === 'assistant').length;
  const answeredCount = conversation.filter(m => m.role === 'user').length;
  const targetTotal = context.totalQuestions || totalQuestions;
  const displayTurn = Math.min(assistantCount, targetTotal);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-indigo-50/30 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-4 sm:space-y-6">
        
        {/* Top Info Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              {role} • {specialization}
            </p>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs sm:text-sm font-medium text-slate-600 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatTime(timeElapsed)}
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Question {displayTurn} of {targetTotal}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {difficulty}
              </span>
            </div>
          </div>
          <button 
            onClick={handleEndInterview} 
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm font-medium transition-colors bg-white shadow-sm"
          >
            {isCompleted ? 'View Evaluation' : 'End Interview'}
          </button>
        </div>

        {/* Main Interview Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-14rem)] min-h-[480px] max-h-[720px]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-sm">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=f8fafc" 
                      alt="Alex Interviewer" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  Alex <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md border border-indigo-200">AI Interviewer</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">Senior Technical Evaluator</p>
              </div>
            </div>
            <button 
              onClick={replayLastQuestion}
              aria-label="Replay current question audio"
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto bg-slate-50/40">
            {conversation.map((msg, idx) => (
              <QuestionCard key={`${msg.role}-${idx}`} msg={msg} />
            ))}
            
            {isAiTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 sm:gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-indigo-200">
                  <Brain className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 rounded-tl-none flex items-center gap-2 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium mr-1">Alex is thinking</span>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </motion.div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={retryLastTurn}
                  disabled={isAiTyping}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            {/* Completion Prompt */}
            {isCompleted && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>All planned questions completed!</span>
                </div>
                <p className="text-sm text-emerald-800">
                  You answered {answeredCount} question{answeredCount === 1 ? '' : 's'}. Click below to receive your personalized evaluation, performance breakdown, and improvement tips.
                </p>
                <button
                  onClick={handleEndInterview}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-200"
                >
                  Generate Evaluation & Results
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Response Box - kept stable and accessible */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
            <div className={`relative rounded-2xl border ${error ? 'border-red-300' : 'border-slate-200'} bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600 transition-all shadow-sm overflow-hidden flex flex-col`}>
              <label htmlFor="candidate-answer" className="sr-only">Your Response</label>
              <textarea 
                id="candidate-answer"
                disabled={isAiTyping || isCompleted}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitAnswer();
                  }
                }}
                placeholder={isCompleted ? "Interview finished. View results above!" : "Type your response here (Press Enter to send, Shift+Enter for newline)..."}
                className="w-full h-20 sm:h-24 p-3 sm:p-4 bg-transparent resize-none outline-none text-slate-700 disabled:opacity-60 text-sm sm:text-base"
              ></textarea>
              
              <div className="px-3 pb-3 flex items-center justify-between">
                {speechSupported ? (
                  <button 
                    type="button"
                    disabled={isAiTyping || isCompleted}
                    onClick={() => {
                      if (isListening) {
                        recognition?.stop();
                        setIsListening(false);
                      } else {
                        recognition?.start();
                        setIsListening(true);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${isListening ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm disabled:opacity-50'}`}
                  >
                    {isListening ? (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        Listening...
                      </>
                    ) : (
                      <><Mic className="w-4 h-4" /> Voice Input</>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Microphone not supported in this browser</span>
                )}
                
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">{answer.length} chars</span>
                  <button 
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={!answer.trim() || isAiTyping || isCompleted}
                    aria-label="Send response"
                    className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-200 transition-all"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
