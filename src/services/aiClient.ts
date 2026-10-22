import { ChatMessage, EvaluationResult, InterviewContext } from '../utils/types';

/**
 * Browser-side client for the PrepAI server endpoint (/api/interview).
 * No API keys live in the frontend; the server function talks to Gemini.
 */

export class AIRequestError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AIRequestError';
  }
}

const NEXT_TIMEOUT_MS = 30_000;
const EVAL_TIMEOUT_MS = 50_000;

async function post<T>(body: unknown, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new AIRequestError('The AI took too long to respond. Please try again.', 'timeout');
    }
    throw new AIRequestError('Network error. Check your connection and try again.', 'network');
  } finally {
    clearTimeout(timer);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON response handled below */
  }
  if (!response.ok) {
    throw new AIRequestError(
      data?.error || `Request failed (${response.status}). Please try again.`,
      data?.code || 'http_error'
    );
  }
  return data as T;
}

export async function requestNextQuestion(context: InterviewContext, history: ChatMessage[]): Promise<string> {
  const data = await post<{ message?: string }>({ action: 'next', context, history }, NEXT_TIMEOUT_MS);
  if (!data?.message) throw new AIRequestError('The AI returned an empty response.', 'invalid_ai_response');
  return data.message;
}

export async function requestEvaluation(context: InterviewContext, history: ChatMessage[]): Promise<EvaluationResult> {
  const data = await post<{ evaluation?: EvaluationResult }>({ action: 'evaluate', context, history }, EVAL_TIMEOUT_MS);
  if (!data?.evaluation) throw new AIRequestError('The AI returned an invalid evaluation.', 'invalid_ai_response');
  return data.evaluation;
}
