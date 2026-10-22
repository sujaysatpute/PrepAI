import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, Difficulty, InterviewContext } from '../utils/types';
import { requestNextQuestion, AIRequestError } from '../services/aiClient';
import { getActiveInterview, saveActiveInterview, clearActiveInterview } from '../utils/storage';

export function useInterview(userName?: string) {
  const [activeId, setActiveId] = useState<string>('');
  const [context, setContext] = useState<InterviewContext>({
    role: '',
    specialization: '',
    difficulty: 'Intermediate',
    totalQuestions: 10,
  });
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Restore active interview from storage if exists
  useEffect(() => {
    const saved = getActiveInterview(userName);
    if (saved && saved.conversation.length > 0) {
      setActiveId(saved.id);
      setContext(saved.context);
      setConversation(saved.conversation);
      const asked = saved.conversation.filter(m => m.role === 'assistant').length;
      const answered = saved.conversation.filter(m => m.role === 'user').length;
      if (asked >= saved.context.totalQuestions && answered >= asked) {
        setIsCompleted(true);
      }
    }
  }, [userName]);

  // Synchronize state changes to storage
  const syncToStorage = useCallback((
    id: string,
    ctx: InterviewContext,
    conv: ChatMessage[]
  ) => {
    if (!id || conv.length === 0) return;
    saveActiveInterview({
      id,
      context: ctx,
      conversation: conv,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
    }, userName);
  }, [userName]);

  const startInterview = useCallback((
    role: string,
    specialization: string,
    difficulty: Difficulty,
    totalQuestions: number
  ) => {
    const existing = getActiveInterview(userName);
    if (
      existing &&
      existing.context.role === role &&
      existing.context.specialization === specialization &&
      existing.conversation.length > 0
    ) {
      // Resume existing
      setActiveId(existing.id);
      setContext(existing.context);
      setConversation(existing.conversation);
      setError(null);
      setIsCompleted(false);
      return;
    }

    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const ctx: InterviewContext = { role, specialization, difficulty, totalQuestions };
    const initialConv: ChatMessage[] = [
      {
        role: 'assistant',
        content: `Hello! Welcome to your ${difficulty.toLowerCase()}-level interview for the ${specialization} position. To start off, could you briefly introduce yourself and share a bit about your technical background?`
      }
    ];

    setActiveId(id);
    setContext(ctx);
    setConversation(initialConv);
    setError(null);
    setIsCompleted(false);
    saveActiveInterview({
      id,
      context: ctx,
      conversation: initialConv,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
    }, userName);
  }, [userName]);

  const sendAnswer = useCallback(async (answerText: string): Promise<boolean> => {
    const clean = answerText.trim();
    if (!clean || isAiTyping) return false;

    const userMessage: ChatMessage = { role: 'user', content: clean };
    const updatedHistory = [...conversation, userMessage];

    setConversation(updatedHistory);
    syncToStorage(activeId, context, updatedHistory);
    setError(null);

    const askedCount = updatedHistory.filter(m => m.role === 'assistant').length;

    // Check if question limit reached
    if (askedCount >= context.totalQuestions) {
      setIsCompleted(true);
      return true;
    }

    setIsAiTyping(true);
    try {
      const nextQuestion = await requestNextQuestion(context, updatedHistory);
      const withAssistant: ChatMessage[] = [
        ...updatedHistory,
        { role: 'assistant', content: nextQuestion }
      ];
      setConversation(withAssistant);
      syncToStorage(activeId, context, withAssistant);
      setIsAiTyping(false);
      return true;
    } catch (err: any) {
      setIsAiTyping(false);
      const msg = err instanceof AIRequestError
        ? err.message
        : 'Failed to connect to the interviewer. Please try again.';
      setError(msg);
      return false;
    }
  }, [conversation, activeId, context, isAiTyping, syncToStorage]);

  const retryLastTurn = useCallback(async () => {
    if (conversation.length === 0 || conversation[conversation.length - 1].role !== 'user') {
      return;
    }
    setError(null);
    setIsAiTyping(true);
    try {
      const nextQuestion = await requestNextQuestion(context, conversation);
      const withAssistant: ChatMessage[] = [
        ...conversation,
        { role: 'assistant', content: nextQuestion }
      ];
      setConversation(withAssistant);
      syncToStorage(activeId, context, withAssistant);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to the interviewer. Please try again.');
    } finally {
      setIsAiTyping(false);
    }
  }, [conversation, context, activeId, syncToStorage]);

  const finishInterview = useCallback(() => {
    clearActiveInterview(userName);
  }, [userName]);

  return {
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
  };
}