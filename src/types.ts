export type Role = 'admin' | 'student';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  telegram_id: string | null;
  role: Role;
  created_at: string;
  last_login: string;
  group_ids?: string[];
  group_names?: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  student_count?: number;
  test_count?: number;
  average_score?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  created_at: string;
  topic_count?: number;
  test_count?: number;
}

export interface Topic {
  id: string;
  book_id: string;
  book_title?: string;
  name: string;
  created_at: string;
  test_count?: number;
}

export type QuestionType = 'single_choice' | 'true_false';

export interface AnswerOption {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct?: boolean; // O'quvchiga test vaqtida yuborilmaydi
  order_index: number;
}

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  explanation?: string; // O'quvchiga faqat natijada ruxsat bo'lsa ko'rsatiladi
  order_index: number;
  answers: AnswerOption[];
}

export interface TestItem {
  id: string;
  title: string;
  description: string;
  book_id: string | null;
  book_title?: string;
  topic_id: string | null;
  topic_name?: string;
  time_limit: number; // daqiqada
  attempts_limit: number;
  passing_percentage: number;
  open_at: string | null;
  close_at: string | null;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_correct_answers: boolean;
  created_at: string;
  created_by: string;
  group_ids: string[];
  group_names?: string[];
  question_count?: number;
  total_points?: number;
  my_attempts_count?: number;
  my_best_percentage?: number | null;
  active_attempt_id?: string | null;
}

export interface AttemptAnswerDetail {
  id: string;
  attempt_id: string;
  question_id: string;
  question_text?: string;
  question_type?: QuestionType;
  max_points?: number;
  answer_id: string | null;
  answer_text: string;
  correct_answer_text?: string;
  explanation?: string;
  is_correct: boolean;
  points_earned: number;
}

export interface Attempt {
  id: string;
  test_id: string;
  test_title?: string;
  book_title?: string;
  topic_name?: string;
  student_id: string;
  student_name?: string;
  student_phone?: string;
  group_name?: string;
  started_at: string;
  finished_at: string | null;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_spent: number; // soniyada
  tab_switch_count: number;
  status: 'in_progress' | 'completed' | 'expired';
  show_correct_answers?: boolean;
  answers_detail?: AttemptAnswerDetail[];
}

export interface QuestionStat {
  question_id: string;
  order_index: number;
  question_text: string;
  total_answers: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy_percentage: number;
}

export interface UnattemptedStudent {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  group_name: string;
  status: string;
}

export interface TelegramNotificationLog {
  id: string;
  sent_at: string;
  recipient_chat_id: string;
  message: string;
  delivered_via_api: boolean;
}

export interface ParsedDocxQuestion {
  tempId: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  explanation: string;
  answers: {
    answer_text: string;
    is_correct: boolean;
  }[];
  errors: string[];
}

export interface LoadTestReport {
  mode: 'live_benchmark' | 'external_k6_required';
  executed_at: string;
  virtual_users_requested: number;
  concurrent_requests_executed: number;
  successful_requests: number;
  failed_requests: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  database_errors: number;
  submission_errors: number;
  completed_attempts: number;
  note: string;
}
