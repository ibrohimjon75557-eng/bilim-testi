import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DBUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  telegram_id: string | null;
  role: 'admin' | 'student';
  created_at: string;
  last_login: string;
}

export interface DBGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface DBGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface DBBook {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface DBTopic {
  id: string;
  book_id: string;
  name: string;
  created_at: string;
}

export interface DBTest {
  id: string;
  title: string;
  description: string;
  book_id: string | null;
  topic_id: string | null;
  time_limit: number;
  attempts_limit: number;
  passing_percentage: number;
  open_at: string | null;
  close_at: string | null;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_correct_answers: boolean;
  created_at: string;
  created_by: string;
}

export interface DBQuestion {
  id: string;
  test_id: string;
  question_text: string;
  question_type: 'single_choice' | 'true_false';
  points: number;
  explanation: string;
  order_index: number;
}

export interface DBAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface DBTestGroup {
  id: string;
  test_id: string;
  group_id: string;
}

export interface DBAttempt {
  id: string;
  test_id: string;
  student_id: string;
  started_at: string;
  finished_at: string | null;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_spent: number;
  tab_switch_count: number;
  status: 'in_progress' | 'completed' | 'expired';
  question_order?: string[];
}

export interface DBAttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer_id: string | null;
  answer_text: string;
  is_correct: boolean;
  points_earned: number;
}

export interface DBTelegramCode {
  id: string;
  telegram_id: string;
  phone: string;
  code_hash: string;
  expires_at: string;
  used_at: string | null;
  attempts_count: number;
}

export interface DBAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DBTelegramLog {
  id: string;
  sent_at: string;
  recipient_chat_id: string;
  message: string;
  delivered_via_api: boolean;
}

export interface DatabaseSchema {
  users: DBUser[];
  groups: DBGroup[];
  group_members: DBGroupMember[];
  books: DBBook[];
  topics: DBTopic[];
  tests: DBTest[];
  questions: DBQuestion[];
  answers: DBAnswer[];
  test_groups: DBTestGroup[];
  attempts: DBAttempt[];
  attempt_answers: DBAttemptAnswer[];
  telegram_codes: DBTelegramCode[];
  audit_logs: DBAuditLog[];
  telegram_logs: DBTelegramLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

function createInitialData(): DatabaseSchema {
  const now = new Date();
  const isoNow = now.toISOString();
  const yesterday = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  const twoDaysAgo = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();
  const threeDaysAgo = new Date(now.getTime() - 72 * 3600 * 1000).toISOString();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();

  const users: DBUser[] = [
    {
      id: 'user-admin-1',
      first_name: 'Sardorbek',
      last_name: 'Usmonov',
      phone: '+998 90 123 45 67',
      telegram_id: '100998877',
      role: 'admin',
      created_at: threeDaysAgo,
      last_login: isoNow,
    },
    {
      id: 'user-student-1',
      first_name: 'Ali',
      last_name: 'Valiyev',
      phone: '+998 90 987 65 43',
      telegram_id: '200112233',
      role: 'student',
      created_at: threeDaysAgo,
      last_login: isoNow,
    },
    {
      id: 'user-student-2',
      first_name: 'Madina',
      last_name: 'Karimova',
      phone: '+998 93 456 78 90',
      telegram_id: '200445566',
      role: 'student',
      created_at: threeDaysAgo,
      last_login: yesterday,
    },
    {
      id: 'user-student-3',
      first_name: 'Javohir',
      last_name: 'Tursunov',
      phone: '+998 99 321 11 22',
      telegram_id: '200778899',
      role: 'student',
      created_at: twoDaysAgo,
      last_login: yesterday,
    },
    {
      id: 'user-student-4',
      first_name: 'Dilnoza',
      last_name: 'Rahimova',
      phone: '+998 97 555 44 33',
      telegram_id: '200990011',
      role: 'student',
      created_at: twoDaysAgo,
      last_login: twoDaysAgo,
    },
    {
      id: 'user-student-5',
      first_name: 'Bekzod',
      last_name: 'Aliyev',
      phone: '+998 91 777 88 99',
      telegram_id: '200334455',
      role: 'student',
      created_at: yesterday,
      last_login: yesterday,
    },
  ];

  const groups: DBGroup[] = [
    {
      id: 'group-9a',
      name: '9-A (Ingliz tili IELTS)',
      description: 'Ingliz tili grammatikasi va IELTS Foundation guruhi (Dushanba-Chorshanba-Juma)',
      created_at: threeDaysAgo,
    },
    {
      id: 'group-10b',
      name: '10-B (Aniq fanlar)',
      description: 'Matematika va Fizika chuqurlashtirilgan tayyorlov guruhi',
      created_at: threeDaysAgo,
    },
    {
      id: 'group-11a',
      name: '11-A (Milliy Sertifikat)',
      description: 'Oliy ta’lim muassasalariga va Milliy sertifikatga intensiv tayyorlov guruhi',
      created_at: twoDaysAgo,
    },
  ];

  const group_members: DBGroupMember[] = [
    { id: 'gm-1', group_id: 'group-9a', user_id: 'user-student-1', joined_at: threeDaysAgo },
    { id: 'gm-2', group_id: 'group-10b', user_id: 'user-student-1', joined_at: threeDaysAgo },
    { id: 'gm-3', group_id: 'group-9a', user_id: 'user-student-2', joined_at: threeDaysAgo },
    { id: 'gm-4', group_id: 'group-9a', user_id: 'user-student-3', joined_at: twoDaysAgo },
    { id: 'gm-5', group_id: 'group-10b', user_id: 'user-student-4', joined_at: twoDaysAgo },
    { id: 'gm-6', group_id: 'group-11a', user_id: 'user-student-5', joined_at: yesterday },
    { id: 'gm-7', group_id: 'group-9a', user_id: 'user-student-5', joined_at: yesterday },
  ];

  const books: DBBook[] = [
    {
      id: 'book-eng',
      title: 'English Grammar in Use (Murphy)',
      description: 'Ingliz tili zamonlari, modal fe’llar va murakkab grammatik tuzilmalar to‘plami',
      created_at: threeDaysAgo,
    },
    {
      id: 'book-math',
      title: 'Matematika — Algebra va Analiz Asoslari',
      description: 'Tenglamalar, funksiyalar, hosila va mantiqiy masalalar to‘plami',
      created_at: threeDaysAgo,
    },
    {
      id: 'book-phys',
      title: 'Fizika — Mexanika va Termodinamika',
      description: 'Kinematika, dinamika qonunlari va energiya saqlanish qonuni',
      created_at: twoDaysAgo,
    },
  ];

  const topics: DBTopic[] = [
    { id: 'topic-eng-1', book_id: 'book-eng', name: 'Present Simple & Present Continuous', created_at: threeDaysAgo },
    { id: 'topic-eng-2', book_id: 'book-eng', name: 'Past Simple & Present Perfect', created_at: threeDaysAgo },
    { id: 'topic-eng-3', book_id: 'book-eng', name: 'Modal Verbs (Can, Must, Should)', created_at: twoDaysAgo },
    { id: 'topic-math-1', book_id: 'book-math', name: 'Kvadrat tenglamalar va Viyet teoremasi', created_at: threeDaysAgo },
    { id: 'topic-phys-1', book_id: 'book-phys', name: 'Nyuton qonunlari va Harakat', created_at: twoDaysAgo },
  ];

  const tests: DBTest[] = [
    {
      id: 'test-eng-1',
      title: 'Present Simple va Continuous — Nazorat testi',
      description: 'Hozirgi zamon shakllari, signal so‘zlar va inkor/so‘roq gaplar bo‘yicha 8 ta savoldan iborat sinov testi.',
      book_id: 'book-eng',
      topic_id: 'topic-eng-1',
      time_limit: 20,
      attempts_limit: 3,
      passing_percentage: 70,
      open_at: threeDaysAgo,
      close_at: nextMonth,
      shuffle_questions: false,
      shuffle_answers: false,
      show_correct_answers: true,
      created_at: threeDaysAgo,
      created_by: 'user-admin-1',
    },
    {
      id: 'test-eng-2',
      title: 'Modal Verbs & Past Tenses — Oraliq imtihon',
      description: 'Modal fe’llar hamda o‘tgan zamon shakllarini farqlash bo‘yicha amaliy test.',
      book_id: 'book-eng',
      topic_id: 'topic-eng-3',
      time_limit: 15,
      attempts_limit: 2,
      passing_percentage: 65,
      open_at: twoDaysAgo,
      close_at: nextMonth,
      shuffle_questions: true,
      shuffle_answers: true,
      show_correct_answers: true,
      created_at: twoDaysAgo,
      created_by: 'user-admin-1',
    },
    {
      id: 'test-math-1',
      title: 'Kvadrat tenglamalar va Diskriminant',
      description: 'Kvadrat tenglama ildizlarini topish, Viyet teoremasi va haqiqiy ildizlar sharti.',
      book_id: 'book-math',
      topic_id: 'topic-math-1',
      time_limit: 25,
      attempts_limit: 2,
      passing_percentage: 60,
      open_at: twoDaysAgo,
      close_at: nextMonth,
      shuffle_questions: false,
      shuffle_answers: false,
      show_correct_answers: true,
      created_at: twoDaysAgo,
      created_by: 'user-admin-1',
    },
  ];

  const test_groups: DBTestGroup[] = [
    { id: 'tg-1', test_id: 'test-eng-1', group_id: 'group-9a' },
    { id: 'tg-2', test_id: 'test-eng-1', group_id: 'group-11a' },
    { id: 'tg-3', test_id: 'test-eng-2', group_id: 'group-9a' },
    { id: 'tg-4', test_id: 'test-math-1', group_id: 'group-10b' },
    { id: 'tg-5', test_id: 'test-math-1', group_id: 'group-11a' },
  ];

  const questions: DBQuestion[] = [
    // Test 1: Present Simple & Continuous (8 savol, jami 100 ball)
    {
      id: 'q-101',
      test_id: 'test-eng-1',
      question_text: 'My brother ___ in a software company in Tashkent every day.',
      question_type: 'single_choice',
      points: 10,
      explanation: '3-shaxs birlikda (My brother = He) Present Simple zamonida fe’lga "-s" qo‘shimchasi qo‘shiladi: works.',
      order_index: 1,
    },
    {
      id: 'q-102',
      test_id: 'test-eng-1',
      question_text: 'Listen! Somebody ___ the piano in the next room right now.',
      question_type: 'single_choice',
      points: 15,
      explanation: '"Listen!" va "right now" nutq paytida davom etayotgan ish-harakatni bildiradi, shuning uchun Present Continuous (is playing) ishlatiladi.',
      order_index: 2,
    },
    {
      id: 'q-103',
      test_id: 'test-eng-1',
      question_text: 'Water boils at 100 degrees Celsius at standard atmospheric pressure.',
      question_type: 'true_false',
      points: 10,
      explanation: 'Tabiat qonunlari va ilmiy haqiqatlar doimo to‘g‘ri bo‘lib, Present Simple zamonida ifodalanadi.',
      order_index: 3,
    },
    {
      id: 'q-104',
      test_id: 'test-eng-1',
      question_text: 'How often ___ you ___ English grammar exercises?',
      question_type: 'single_choice',
      points: 15,
      explanation: '"How often" odatiy takrorlanadigan harakatni so‘raydi. "You" olmoshiga Present Simple so‘roq shaklida "do ... practice" mos keladi.',
      order_index: 4,
    },
    {
      id: 'q-105',
      test_id: 'test-eng-1',
      question_text: '"I am knowing the answer to this question" — grammatik jihatdan to‘g‘ri gap hisoblanadi.',
      question_type: 'true_false',
      points: 10,
      explanation: '"Know" — holat fe’li (stative verb) bo‘lib, Continuous (-ing) zamonida ishlatilmaydi. To‘g‘ri shakl: "I know the answer".',
      order_index: 5,
    },
    {
      id: 'q-106',
      test_id: 'test-eng-1',
      question_text: 'She usually ___ coffee in the morning, but today she ___ green tea.',
      question_type: 'single_choice',
      points: 15,
      explanation: '"Usually" — odatiy holat (drinks), "today" esa vaqtinchalik bugungi holat (is drinking) ekanligini ko‘rsatadi.',
      order_index: 6,
    },
    {
      id: 'q-107',
      test_id: 'test-eng-1',
      question_text: 'Why ___ they ___ so fast? Is there an emergency?',
      question_type: 'single_choice',
      points: 15,
      explanation: 'Ayni vaqtdagi vaziyat haqida so‘ralayotgani sababli Present Continuous so‘roq shakli: "are they running" ishlatiladi.',
      order_index: 7,
    },
    {
      id: 'q-108',
      test_id: 'test-eng-1',
      question_text: 'The train to Samarkand ___ at 08:00 AM tomorrow morning according to the schedule.',
      question_type: 'single_choice',
      points: 10,
      explanation: 'Transport va dars jadvallari (timetables) kelasi zamonga tegishli bo‘lsa ham Present Simple (leaves) orqali ifodalanadi.',
      order_index: 8,
    },

    // Test 2: Modal Verbs (5 savol, jami 50 ball)
    {
      id: 'q-201',
      test_id: 'test-eng-2',
      question_text: 'You ___ stop when the traffic light turns red. It is the law.',
      question_type: 'single_choice',
      points: 10,
      explanation: 'Qat’iy qonun va majburiyatlar uchun "must" modal fe’li qo‘llaniladi.',
      order_index: 1,
    },
    {
      id: 'q-202',
      test_id: 'test-eng-2',
      question_text: 'Modal fe’llardan keyin asosiy fe’l har doim "to" yuklamasisiz (bare infinitive) keladi (masalan: must go, can speak).',
      question_type: 'true_false',
      points: 10,
      explanation: 'Asosiy modal fe’llar (can, could, may, might, must, should, will, would) dan so‘ng "to" ishlatilmaydi.',
      order_index: 2,
    },
    {
      id: 'q-203',
      test_id: 'test-eng-2',
      question_text: 'I ___ swim very well when I was seven years old.',
      question_type: 'single_choice',
      points: 10,
      explanation: 'O‘tgan zamondagi umumiy qobiliyatni bildirish uchun "could" ishlatiladi.',
      order_index: 3,
    },
    {
      id: 'q-204',
      test_id: 'test-eng-2',
      question_text: 'You look tired. You ___ get some rest before the exam.',
      question_type: 'single_choice',
      points: 10,
      explanation: 'Maslahat va tavsiya berishda "should" modal fe’li eng mos tanlov hisoblanadi.',
      order_index: 4,
    },
    {
      id: 'q-205',
      test_id: 'test-eng-2',
      question_text: 'We ___ hurry; we still have plenty of time before the flight.',
      question_type: 'single_choice',
      points: 10,
      explanation: 'Zarurat yo‘qligini ("shart emas") ifodalash uchun "don’t have to" / "needn’t" ishlatiladi.',
      order_index: 5,
    },

    // Test 3: Matematika (5 savol, jami 50 ball)
    {
      id: 'q-301',
      test_id: 'test-math-1',
      question_text: 'x² - 7x + 12 = 0 kvadrat tenglamaning ildizlarini toping.',
      question_type: 'single_choice',
      points: 10,
      explanation: 'Viyet teoremasiga ko‘ra x₁ + x₂ = 7 va x₁ · x₂ = 12. Demak ildizlar 3 va 4 ga teng.',
      order_index: 1,
    },
    {
      id: 'q-302',
      test_id: 'test-math-1',
      question_text: 'Agar kvadrat tenglamaning diskriminanti D < 0 bo‘lsa, tenglama haqiqiy sonlar to‘plamida 2 ta turli ildizga ega bo‘ladi.',
      question_type: 'true_false',
      points: 10,
      explanation: 'Agar D < 0 bo‘lsa, kvadrat tenglama haqiqiy ildizga ega bo‘lmaydi.',
      order_index: 2,
    },
    {
      id: 'q-303',
      test_id: 'test-math-1',
      question_text: '2x² - 8x + 8 = 0 tenglamaning diskriminantini (D) hisoblang.',
      question_type: 'single_choice',
      points: 10,
      explanation: 'D = b² - 4ac = (-8)² - 4·2·8 = 64 - 64 = 0.',
      order_index: 3,
    },
    {
      id: 'q-304',
      test_id: 'test-math-1',
      question_text: 'x² - 5x + 6 = 0 tenglama ildizlarining kvadratlari yig‘indisini (x₁² + x₂²) toping.',
      question_type: 'single_choice',
      points: 10,
      explanation: 'Ildizlar 2 va 3. Ularning kvadratlari yig‘indisi: 2² + 3² = 4 + 9 = 13.',
      order_index: 4,
    },
    {
      id: 'q-305',
      test_id: 'test-math-1',
      question_text: 'Har qanday keltirilgan x² + px + q = 0 kvadrat tenglamada ildizlar yig‘indisi (-p) ga teng.',
      question_type: 'true_false',
      points: 10,
      explanation: 'Viyet teoremasiga binoan haqiqiy ildizlarga ega keltirilgan kvadrat tenglamada x₁ + x₂ = -p va x₁ · x₂ = q bo‘ladi.',
      order_index: 5,
    },
  ];

  const answers: DBAnswer[] = [
    // q-101
    { id: 'a-101-1', question_id: 'q-101', answer_text: 'work', is_correct: false, order_index: 1 },
    { id: 'a-101-2', question_id: 'q-101', answer_text: 'works', is_correct: true, order_index: 2 },
    { id: 'a-101-3', question_id: 'q-101', answer_text: 'is working', is_correct: false, order_index: 3 },
    { id: 'a-101-4', question_id: 'q-101', answer_text: 'working', is_correct: false, order_index: 4 },
    // q-102
    { id: 'a-102-1', question_id: 'q-102', answer_text: 'plays', is_correct: false, order_index: 1 },
    { id: 'a-102-2', question_id: 'q-102', answer_text: 'play', is_correct: false, order_index: 2 },
    { id: 'a-102-3', question_id: 'q-102', answer_text: 'is playing', is_correct: true, order_index: 3 },
    { id: 'a-102-4', question_id: 'q-102', answer_text: 'are playing', is_correct: false, order_index: 4 },
    // q-103 (True/False)
    { id: 'a-103-1', question_id: 'q-103', answer_text: "TO'G'RI", is_correct: true, order_index: 1 },
    { id: 'a-103-2', question_id: 'q-103', answer_text: "NOTO'G'RI", is_correct: false, order_index: 2 },
    // q-104
    { id: 'a-104-1', question_id: 'q-104', answer_text: 'do / practice', is_correct: true, order_index: 1 },
    { id: 'a-104-2', question_id: 'q-104', answer_text: 'does / practice', is_correct: false, order_index: 2 },
    { id: 'a-104-3', question_id: 'q-104', answer_text: 'are / practicing', is_correct: false, order_index: 3 },
    { id: 'a-104-4', question_id: 'q-104', answer_text: 'have / practiced', is_correct: false, order_index: 4 },
    // q-105 (True/False)
    { id: 'a-105-1', question_id: 'q-105', answer_text: "TO'G'RI", is_correct: false, order_index: 1 },
    { id: 'a-105-2', question_id: 'q-105', answer_text: "NOTO'G'RI", is_correct: true, order_index: 2 },
    // q-106
    { id: 'a-106-1', question_id: 'q-106', answer_text: 'drinks / is drinking', is_correct: true, order_index: 1 },
    { id: 'a-106-2', question_id: 'q-106', answer_text: 'is drinking / drinks', is_correct: false, order_index: 2 },
    { id: 'a-106-3', question_id: 'q-106', answer_text: 'drink / drinks', is_correct: false, order_index: 3 },
    { id: 'a-106-4', question_id: 'q-106', answer_text: 'drank / is drinking', is_correct: false, order_index: 4 },
    // q-107
    { id: 'a-107-1', question_id: 'q-107', answer_text: 'do / run', is_correct: false, order_index: 1 },
    { id: 'a-107-2', question_id: 'q-107', answer_text: 'are / running', is_correct: true, order_index: 2 },
    { id: 'a-107-3', question_id: 'q-107', answer_text: 'is / running', is_correct: false, order_index: 3 },
    { id: 'a-107-4', question_id: 'q-107', answer_text: 'does / run', is_correct: false, order_index: 4 },
    // q-108
    { id: 'a-108-1', question_id: 'q-108', answer_text: 'leave', is_correct: false, order_index: 1 },
    { id: 'a-108-2', question_id: 'q-108', answer_text: 'leaves', is_correct: true, order_index: 2 },
    { id: 'a-108-3', question_id: 'q-108', answer_text: 'leaving', is_correct: false, order_index: 3 },
    { id: 'a-108-4', question_id: 'q-108', answer_text: 'is leave', is_correct: false, order_index: 4 },

    // Test 2 answers
    { id: 'a-201-1', question_id: 'q-201', answer_text: 'must', is_correct: true, order_index: 1 },
    { id: 'a-201-2', question_id: 'q-201', answer_text: 'may', is_correct: false, order_index: 2 },
    { id: 'a-201-3', question_id: 'q-201', answer_text: 'might', is_correct: false, order_index: 3 },
    { id: 'a-201-4', question_id: 'q-201', answer_text: 'could', is_correct: false, order_index: 4 },

    { id: 'a-202-1', question_id: 'q-202', answer_text: "TO'G'RI", is_correct: true, order_index: 1 },
    { id: 'a-202-2', question_id: 'q-202', answer_text: "NOTO'G'RI", is_correct: false, order_index: 2 },

    { id: 'a-203-1', question_id: 'q-203', answer_text: 'can', is_correct: false, order_index: 1 },
    { id: 'a-203-2', question_id: 'q-203', answer_text: 'could', is_correct: true, order_index: 2 },
    { id: 'a-203-3', question_id: 'q-203', answer_text: 'must', is_correct: false, order_index: 3 },
    { id: 'a-203-4', question_id: 'q-203', answer_text: 'should', is_correct: false, order_index: 4 },

    { id: 'a-204-1', question_id: 'q-204', answer_text: 'should', is_correct: true, order_index: 1 },
    { id: 'a-204-2', question_id: 'q-204', answer_text: 'must not', is_correct: false, order_index: 2 },
    { id: 'a-204-3', question_id: 'q-204', answer_text: 'cannot', is_correct: false, order_index: 3 },
    { id: 'a-204-4', question_id: 'q-204', answer_text: 'may not', is_correct: false, order_index: 4 },

    { id: 'a-205-1', question_id: 'q-205', answer_text: 'must', is_correct: false, order_index: 1 },
    { id: 'a-205-2', question_id: 'q-205', answer_text: 'don’t have to', is_correct: true, order_index: 2 },
    { id: 'a-205-3', question_id: 'q-205', answer_text: 'should', is_correct: false, order_index: 3 },
    { id: 'a-205-4', question_id: 'q-205', answer_text: 'have to', is_correct: false, order_index: 4 },

    // Test 3 answers
    { id: 'a-301-1', question_id: 'q-301', answer_text: '3 va 4', is_correct: true, order_index: 1 },
    { id: 'a-301-2', question_id: 'q-301', answer_text: '-3 va -4', is_correct: false, order_index: 2 },
    { id: 'a-301-3', question_id: 'q-301', answer_text: '2 va 6', is_correct: false, order_index: 3 },
    { id: 'a-301-4', question_id: 'q-301', answer_text: '1 va 12', is_correct: false, order_index: 4 },

    { id: 'a-302-1', question_id: 'q-302', answer_text: "TO'G'RI", is_correct: false, order_index: 1 },
    { id: 'a-302-2', question_id: 'q-302', answer_text: "NOTO'G'RI", is_correct: true, order_index: 2 },

    { id: 'a-303-1', question_id: 'q-303', answer_text: '0', is_correct: true, order_index: 1 },
    { id: 'a-303-2', question_id: 'q-303', answer_text: '16', is_correct: false, order_index: 2 },
    { id: 'a-303-3', question_id: 'q-303', answer_text: '64', is_correct: false, order_index: 3 },
    { id: 'a-303-4', question_id: 'q-303', answer_text: '-32', is_correct: false, order_index: 4 },

    { id: 'a-304-1', question_id: 'q-304', answer_text: '13', is_correct: true, order_index: 1 },
    { id: 'a-304-2', question_id: 'q-304', answer_text: '25', is_correct: false, order_index: 2 },
    { id: 'a-304-3', question_id: 'q-304', answer_text: '11', is_correct: false, order_index: 3 },
    { id: 'a-304-4', question_id: 'q-304', answer_text: '19', is_correct: false, order_index: 4 },

    { id: 'a-305-1', question_id: 'q-305', answer_text: "TO'G'RI", is_correct: true, order_index: 1 },
    { id: 'a-305-2', question_id: 'q-305', answer_text: "NOTO'G'RI", is_correct: false, order_index: 2 },
  ];

  const attempts: DBAttempt[] = [
    {
      id: 'att-1',
      test_id: 'test-eng-1',
      student_id: 'user-student-1',
      started_at: twoDaysAgo,
      finished_at: twoDaysAgo,
      score: 85,
      max_score: 100,
      percentage: 85,
      passed: true,
      time_spent: 872, // 14 daqiqa 32 soniya
      tab_switch_count: 1,
      status: 'completed',
    },
    {
      id: 'att-2',
      test_id: 'test-math-1',
      student_id: 'user-student-1',
      started_at: yesterday,
      finished_at: yesterday,
      score: 40,
      max_score: 50,
      percentage: 80,
      passed: true,
      time_spent: 1120,
      tab_switch_count: 0,
      status: 'completed',
    },
    {
      id: 'att-3',
      test_id: 'test-eng-1',
      student_id: 'user-student-2',
      started_at: yesterday,
      finished_at: yesterday,
      score: 90,
      max_score: 100,
      percentage: 90,
      passed: true,
      time_spent: 765,
      tab_switch_count: 0,
      status: 'completed',
    },
    {
      id: 'att-4',
      test_id: 'test-eng-1',
      student_id: 'user-student-3',
      started_at: isoNow,
      finished_at: isoNow,
      score: 55,
      max_score: 100,
      percentage: 55,
      passed: false,
      time_spent: 940,
      tab_switch_count: 3,
      status: 'completed',
    },
    {
      id: 'att-5',
      test_id: 'test-math-1',
      student_id: 'user-student-4',
      started_at: isoNow,
      finished_at: isoNow,
      score: 50,
      max_score: 50,
      percentage: 100,
      passed: true,
      time_spent: 810,
      tab_switch_count: 0,
      status: 'completed',
    },
  ];

  const attempt_answers: DBAttemptAnswer[] = [
    // att-1 (Ali Valiyev - 85/100)
    { id: 'aa-1', attempt_id: 'att-1', question_id: 'q-101', answer_id: 'a-101-2', answer_text: 'works', is_correct: true, points_earned: 10 },
    { id: 'aa-2', attempt_id: 'att-1', question_id: 'q-102', answer_id: 'a-102-3', answer_text: 'is playing', is_correct: true, points_earned: 15 },
    { id: 'aa-3', attempt_id: 'att-1', question_id: 'q-103', answer_id: 'a-103-1', answer_text: "TO'G'RI", is_correct: true, points_earned: 10 },
    { id: 'aa-4', attempt_id: 'att-1', question_id: 'q-104', answer_id: 'a-104-1', answer_text: 'do / practice', is_correct: true, points_earned: 15 },
    { id: 'aa-5', attempt_id: 'att-1', question_id: 'q-105', answer_id: 'a-105-2', answer_text: "NOTO'G'RI", is_correct: true, points_earned: 10 },
    { id: 'aa-6', attempt_id: 'att-1', question_id: 'q-106', answer_id: 'a-106-2', answer_text: 'is drinking / drinks', is_correct: false, points_earned: 0 },
    { id: 'aa-7', attempt_id: 'att-1', question_id: 'q-107', answer_id: 'a-107-2', answer_text: 'are / running', is_correct: true, points_earned: 15 },
    { id: 'aa-8', attempt_id: 'att-1', question_id: 'q-108', answer_id: 'a-108-2', answer_text: 'leaves', is_correct: true, points_earned: 10 },

    // att-3 (Madina Karimova - 90/100)
    { id: 'aa-9', attempt_id: 'att-3', question_id: 'q-101', answer_id: 'a-101-2', answer_text: 'works', is_correct: true, points_earned: 10 },
    { id: 'aa-10', attempt_id: 'att-3', question_id: 'q-102', answer_id: 'a-102-3', answer_text: 'is playing', is_correct: true, points_earned: 15 },
    { id: 'aa-11', attempt_id: 'att-3', question_id: 'q-103', answer_id: 'a-103-1', answer_text: "TO'G'RI", is_correct: true, points_earned: 10 },
    { id: 'aa-12', attempt_id: 'att-3', question_id: 'q-104', answer_id: 'a-104-1', answer_text: 'do / practice', is_correct: true, points_earned: 15 },
    { id: 'aa-13', attempt_id: 'att-3', question_id: 'q-105', answer_id: 'a-105-1', answer_text: "TO'G'RI", is_correct: false, points_earned: 0 },
    { id: 'aa-14', attempt_id: 'att-3', question_id: 'q-106', answer_id: 'a-106-1', answer_text: 'drinks / is drinking', is_correct: true, points_earned: 15 },
    { id: 'aa-15', attempt_id: 'att-3', question_id: 'q-107', answer_id: 'a-107-2', answer_text: 'are / running', is_correct: true, points_earned: 15 },
    { id: 'aa-16', attempt_id: 'att-3', question_id: 'q-108', answer_id: 'a-108-2', answer_text: 'leaves', is_correct: true, points_earned: 10 },

    // att-4 (Javohir Tursunov - 55/100)
    { id: 'aa-17', attempt_id: 'att-4', question_id: 'q-101', answer_id: 'a-101-2', answer_text: 'works', is_correct: true, points_earned: 10 },
    { id: 'aa-18', attempt_id: 'att-4', question_id: 'q-102', answer_id: 'a-102-1', answer_text: 'plays', is_correct: false, points_earned: 0 },
    { id: 'aa-19', attempt_id: 'att-4', question_id: 'q-103', answer_id: 'a-103-1', answer_text: "TO'G'RI", is_correct: true, points_earned: 10 },
    { id: 'aa-20', attempt_id: 'att-4', question_id: 'q-104', answer_id: 'a-104-1', answer_text: 'do / practice', is_correct: true, points_earned: 15 },
    { id: 'aa-21', attempt_id: 'att-4', question_id: 'q-105', answer_id: 'a-105-1', answer_text: "TO'G'RI", is_correct: false, points_earned: 0 },
    { id: 'aa-22', attempt_id: 'att-4', question_id: 'q-106', answer_id: 'a-106-2', answer_text: 'is drinking / drinks', is_correct: false, points_earned: 0 },
    { id: 'aa-23', attempt_id: 'att-4', question_id: 'q-107', answer_id: 'a-107-1', answer_text: 'do / run', is_correct: false, points_earned: 0 },
    { id: 'aa-24', attempt_id: 'att-4', question_id: 'q-108', answer_id: 'a-108-2', answer_text: 'leaves', is_correct: true, points_earned: 10 },
  ];

  const telegram_logs: DBTelegramLog[] = [
    {
      id: 'tlog-1',
      sent_at: twoDaysAgo,
      recipient_chat_id: process.env.TEACHER_TELEGRAM_CHAT_ID || '100998877',
      message: `📝 Yangi test natijasi\n\n👤 O‘quvchi: Ali Valiyev\n📚 Test: Present Simple va Continuous — Nazorat testi\n👥 Guruh: 9-A (Ingliz tili IELTS)\n🎯 Ball: 85/100\n📊 Foiz: 85%\n✅ Natija: O‘TDI\n⏱ Vaqt: 14:32\n🔄 Oynadan chiqishlar: 1`,
      delivered_via_api: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    },
    {
      id: 'tlog-2',
      sent_at: isoNow,
      recipient_chat_id: process.env.TEACHER_TELEGRAM_CHAT_ID || '100998877',
      message: `📝 Yangi test natijasi\n\n👤 O‘quvchi: Javohir Tursunov\n📚 Test: Present Simple va Continuous — Nazorat testi\n👥 Guruh: 9-A (Ingliz tili IELTS)\n🎯 Ball: 55/100\n📊 Foiz: 55%\n❌ Natija: O‘TMADI\n⏱ Vaqt: 15:40\n🔄 Oynadan chiqishlar: 3`,
      delivered_via_api: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    },
  ];

  return {
    users,
    groups,
    group_members,
    books,
    topics,
    tests,
    questions,
    answers,
    test_groups,
    attempts,
    attempt_answers,
    telegram_codes: [],
    audit_logs: [
      {
        id: 'audit-1',
        user_id: 'user-admin-1',
        action: 'SYSTEM_INITIALIZED',
        metadata: { version: '1.0.0' },
        created_at: threeDaysAgo,
      },
    ],
    telegram_logs,
  };
}

class DataStore {
  public data: DatabaseSchema;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch {
        this.data = createInitialData();
        this.persistSync();
      }
    } else {
      this.data = createInitialData();
      this.persistSync();
    }
  }

  public persist() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.persistSync();
    }, 150);
  }

  public persistSync() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist store:', e);
    }
  }

  public addAudit(userId: string | null, action: string, metadata: Record<string, unknown> = {}) {
    this.data.audit_logs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      action,
      metadata,
      created_at: new Date().toISOString(),
    });
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs.length = 500;
    }
    this.persist();
  }
}

export const store = new DataStore();
