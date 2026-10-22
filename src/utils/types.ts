export interface Role {
  main: string;
  sub: string;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export interface InterviewContext {
  role: string;
  specialization: string;
  difficulty: Difficulty;
  totalQuestions: number;
}

export interface EvaluationResult {
  score: number;
  confidenceLevel: number;
  technicalKnowledge: number;
  communication: number;
  clarity: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
  summary?: string;
}

/** An interview that is in progress (or finished but not yet evaluated). */
export interface ActiveInterview {
  id: string;
  context: InterviewContext;
  conversation: ChatMessage[];
  startedAt: string;
  status: 'in_progress' | 'awaiting_evaluation';
}

/** A completed, AI-evaluated interview stored in history. */
export interface InterviewSession {
  id: string;
  role: string;
  specialization: string;
  difficulty: Difficulty;
  date: string;
  score: number;
  confidence: number;
  questionsAnswered: number;
  totalQuestions: number;
  evaluation: EvaluationResult;
}
