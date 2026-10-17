export interface User {
  id: number;
  email: string;
  username: string;
  level: UserLevel;
  native_language: string;
  created_at: string;
}

export enum UserLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
}

export interface LearningPlan {
  id: number;
  current_level: UserLevel;
  target_level: UserLevel;
  focus_areas: string[];
  weak_points: string[];
  strong_points: string[];
  next_topics: string[];
  plan_text: string;
  updated_at: string;
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  audio_url?: string;
  corrections?: Correction[];
  feedback?: string;
  created_at: string;
}

export interface Correction {
  type: 'grammar' | 'vocabulary' | 'expression';
  incorrect: string;
  correct: string;
  explanation: string;
}

export interface Conversation {
  id: number;
  title: string;
  topic?: string;
  exercise_type: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  is_active: boolean;
  messages: Message[];
}

export interface UserProgress {
  total_conversations: number;
  total_messages: number;
  total_hours: number;
  vocabulary_size: number;
  fluency_score: number;
  pronunciation_score: number;
  grammar_score: number;
  comprehension_score: number;
  streak_days: number;
  last_activity: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  native_language: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
