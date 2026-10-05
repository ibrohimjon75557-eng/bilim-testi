-- ============================================================================
-- BILIMTEST PRO — SUPABASE POSTGRESQL DATABASE MIGRATION & RLS POLICIES
-- 500+ bir vaqtdagi foydalanuvchilar uchun optimallashtirilgan arxitektura
-- ============================================================================

-- Kerakli kengaytmalar
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS JADVALI
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  telegram_id TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 2. GROUPS JADVALI
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. GROUP_MEMBERS JADVALI
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);

-- 4. BOOKS JADVALI
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TOPICS JADVALI
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_book_id ON public.topics(book_id);

-- 6. TESTS JADVALI
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  time_limit INTEGER NOT NULL DEFAULT 20, -- daqiqalarda
  attempts_limit INTEGER NOT NULL DEFAULT 1,
  passing_percentage NUMERIC(5,2) NOT NULL DEFAULT 60.00,
  open_at TIMESTAMPTZ,
  close_at TIMESTAMPTZ,
  shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
  shuffle_answers BOOLEAN NOT NULL DEFAULT FALSE,
  show_correct_answers BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tests_book_topic ON public.tests(book_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_tests_open_close ON public.tests(open_at, close_at);

-- 7. QUESTIONS JADVALI
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'single_choice' CHECK (question_type IN ('single_choice', 'true_false')),
  points NUMERIC(6,2) NOT NULL DEFAULT 1.00,
  explanation TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_questions_test_id_order ON public.questions(test_id, order_index);

-- 8. ANSWERS JADVALI
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);

-- 9. TEST_GROUPS JADVALI
CREATE TABLE IF NOT EXISTS public.test_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  UNIQUE(test_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_test_groups_test_id ON public.test_groups(test_id);
CREATE INDEX IF NOT EXISTS idx_test_groups_group_id ON public.test_groups(group_id);

-- 10. ATTEMPTS JADVALI
CREATE TABLE IF NOT EXISTS public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  score NUMERIC(8,2) NOT NULL DEFAULT 0,
  max_score NUMERIC(8,2) NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent INTEGER NOT NULL DEFAULT 0, -- soniyalarda
  tab_switch_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_attempts_test_student ON public.attempts(test_id, student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student_status ON public.attempts(student_id, status);
CREATE INDEX IF NOT EXISTS idx_attempts_started_at ON public.attempts(started_at DESC);

-- 11. ATTEMPT_ANSWERS JADVALI
CREATE TABLE IF NOT EXISTS public.attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.answers(id) ON DELETE SET NULL,
  answer_text TEXT DEFAULT '',
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  points_earned NUMERIC(6,2) NOT NULL DEFAULT 0,
  UNIQUE(attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON public.attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_question_id ON public.attempt_answers(question_id);

-- 12. TELEGRAM_CODES JADVALI
CREATE TABLE IF NOT EXISTS public.telegram_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT NOT NULL,
  phone TEXT,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_codes_lookup ON public.telegram_codes(code_hash, expires_at);

-- 13. AUDIT_LOGS JADVALI
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) SIYOSATLARI
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Yordamchi funksiya: Foydalanuvchi admin ekanligini tekshirish
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS RLS: O'quvchi faqat o'z profilini ko'radi, Admin barchasini boshqaradi
CREATE POLICY "Users view own profile or admin all" ON public.users
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin manages users" ON public.users
  FOR ALL USING (public.is_admin());

-- GROUPS & GROUP_MEMBERS RLS
CREATE POLICY "Students view joined groups, admin all" ON public.groups
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin manages groups" ON public.groups
  FOR ALL USING (public.is_admin());

CREATE POLICY "Students view own memberships, admin all" ON public.group_members
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin manages group memberships" ON public.group_members
  FOR ALL USING (public.is_admin());

-- BOOKS & TOPICS RLS
CREATE POLICY "Authenticated read books" ON public.books
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages books" ON public.books
  FOR ALL USING (public.is_admin());

CREATE POLICY "Authenticated read topics" ON public.topics
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages topics" ON public.topics
  FOR ALL USING (public.is_admin());

-- TESTS RLS: O'quvchi faqat o'z guruhiga biriktirilgan testlarni ko'ra oladi
CREATE POLICY "Students view group tests, admin all" ON public.tests
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.test_groups tg
      JOIN public.group_members gm ON gm.group_id = tg.group_id
      WHERE tg.test_id = tests.id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin manages tests" ON public.tests
  FOR ALL USING (public.is_admin());

-- QUESTIONS & ANSWERS RLS
CREATE POLICY "Students view questions of accessible tests" ON public.questions
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.test_groups tg
      JOIN public.group_members gm ON gm.group_id = tg.group_id
      WHERE tg.test_id = questions.test_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin manages questions" ON public.questions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Students view answers of accessible tests" ON public.answers
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.test_groups tg ON tg.test_id = q.test_id
      JOIN public.group_members gm ON gm.group_id = tg.group_id
      WHERE q.id = answers.question_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin manages answers" ON public.answers
  FOR ALL USING (public.is_admin());

-- ATTEMPTS & ATTEMPT_ANSWERS RLS: O'quvchi faqat o'z natijalarini ko'radi
CREATE POLICY "Students view own attempts, admin all" ON public.attempts
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students insert own attempts" ON public.attempts
  FOR INSERT WITH CHECK (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students update own in-progress attempts, admin all" ON public.attempts
  FOR UPDATE USING (
    (student_id = auth.uid() AND status = 'in_progress') OR public.is_admin()
  );

CREATE POLICY "Admin deletes attempts" ON public.attempts
  FOR DELETE USING (public.is_admin());

CREATE POLICY "Students view own attempt answers, admin all" ON public.attempt_answers
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = attempt_answers.attempt_id AND a.student_id = auth.uid()
    )
  );

-- TELEGRAM_CODES RLS: Faqat server service_role orqali boshqariladi
CREATE POLICY "Service role only for telegram_codes" ON public.telegram_codes
  FOR ALL USING (public.is_admin());

-- AUDIT_LOGS RLS
CREATE POLICY "Admin reads audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());
