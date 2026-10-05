import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Award,
  FileText,
  EyeOff,
  Wifi,
  WifiOff,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TestItem, Question, Attempt } from '../types';
import { useOnlineStatus } from '../utils/pwa';

// ============================================================================
// 1. STUDENT DASHBOARD (/dashboard)
// ============================================================================
export const StudentDashboardPage: React.FC = () => {
  const { user, apiFetch, navigate } = useApp();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [results, setResults] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [testsData, resultsData] = await Promise.all([
        apiFetch<TestItem[]>('/api/tests'),
        apiFetch<Attempt[]>('/api/results'),
      ]);
      setTests(testsData);
      setResults(resultsData);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi. Qayta urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const passedCount = results.filter((r) => r.passed).length;
  const avgScore =
    results.length > 0
      ? Math.round((results.reduce((s, r) => s + r.percentage, 0) / results.length) * 10) / 10
      : 0;

  const activeTests = tests.filter((t) => t.active_attempt_id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Xush kelibsiz, {user?.first_name || 'O‘quvchi'}!
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Guruh: {user?.group_names?.join(', ') || '9-A (Ingliz tili IELTS)'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{user?.phone || '+998 90 987 65 43'}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/tests')}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Play className="w-4 h-4" />
          <span>Barcha testlarni ko‘rish</span>
        </button>
      </div>

      {/* RESUME IN-PROGRESS TEST BANNER */}
      {activeTests.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Yakunlanmagan faol test mavjud
            </p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {activeTests[0].title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Javoblaringiz saqlangan. Vaqt tugamasidan testni davom ettiring.
            </p>
          </div>
          <button
            onClick={() => navigate(`/tests/${activeTests[0].id}/start`)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Testni davom ettirish</span>
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Ochilgan testlar</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {tests.length}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Topshirilgan testlar</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {results.length}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Muvaffaqiyatli o‘tilgan</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {passedCount}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">O‘rtacha ko‘rsatkich</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {avgScore}%
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between gap-4">
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          <button
            onClick={loadData}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Qayta urinish</span>
          </button>
        </div>
      )}

      {/* Available Tests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Sizning guruhingiz uchun ochiq testlar
          </h2>
          <button
            onClick={() => navigate('/tests')}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Barchasi →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Hozircha sizga ochilgan testlar yo‘q.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-blue-500/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{test.book_title}</span>
                    <span aria-hidden="true">·</span>
                    <span>{test.topic_name}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {test.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {test.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <span>{test.question_count} ta savol</span>
                    <span>·</span>
                    <span>{test.time_limit} daqiqa</span>
                    <span>·</span>
                    <span>O‘tish: {test.passing_percentage}%</span>
                  </div>

                  <button
                    onClick={() => navigate(`/tests/${test.id}`)}
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {test.active_attempt_id ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Testni davom ettirish</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Testni ochish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Results */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Oxirgi natijalaringiz
          </h2>
          <button
            onClick={() => navigate('/results')}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Barcha natijalar →
          </button>
        </div>

        {results.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
            Hali yakunlangan test natijalari mavjud emas.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-medium">Test</th>
                    <th className="py-3 px-4 font-medium">Sana</th>
                    <th className="py-3 px-4 font-medium text-right">Ball</th>
                    <th className="py-3 px-4 font-medium text-right">Foiz</th>
                    <th className="py-3 px-4 font-medium">Natija</th>
                    <th className="py-3 px-4 font-medium text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {results.slice(0, 5).map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {r.test_title}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 font-mono tabular-nums">
                        {new Date(r.finished_at || r.started_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {r.score} / {r.max_score}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        {r.percentage}%
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-semibold ${
                            r.passed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {r.passed ? '✓ O‘tdi' : '✗ O‘tmadi'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/tests/${r.test_id}/result?attemptId=${r.id}`)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Ko‘rish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

// ============================================================================
// 2. STUDENT TESTS LIST (/tests)
// ============================================================================
export const StudentTestsListPage: React.FC = () => {
  const { apiFetch, navigate } = useApp();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<TestItem[]>('/api/tests')
      .then(setTests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiFetch]);

  const filtered = tests.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.book_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.topic_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mavjud testlar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Guruhingiz uchun biriktirilgan barcha faol testlar ro‘yxati
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Test yoki mavzuni qidirish..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-52 rounded-2xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500">Hozircha sizga ochilgan testlar yo‘q.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((test) => (
            <div
              key={test.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{test.book_title}</span>
                  <span aria-hidden="true">·</span>
                  <span>{test.topic_name}</span>
                </div>
                <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {test.title}
                </h2>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {test.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="block text-[11px] text-slate-400 font-sans">Vaqt</span>
                    {test.time_limit} daq
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400 font-sans">Urinishlar</span>
                    {test.my_attempts_count || 0} / {test.attempts_limit}
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400 font-sans">Eng yaxshi</span>
                    {test.my_best_percentage !== null && test.my_best_percentage !== undefined
                      ? `${test.my_best_percentage}%`
                      : '-'}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/tests/${test.id}`)}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{test.active_attempt_id ? 'Testni davom ettirish' : 'Batafsil va Boshlash'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. TEST DETAILS & BRIEFING (/tests/:id)
// ============================================================================
export const StudentTestDetailPage: React.FC<{ testId: string }> = ({ testId }) => {
  const { apiFetch, navigate, addToast } = useApp();
  const [test, setTest] = useState<TestItem | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ test: TestItem; my_attempts: Attempt[] }>(`/api/tests/${testId}`)
      .then((res) => {
        setTest(res.test);
        setAttempts(res.my_attempts);
      })
      .catch((err) => {
        addToast(err.message || 'Test topilmadi', 'error');
      })
      .finally(() => setLoading(false));
  }, [testId, apiFetch, addToast]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-64 rounded-2xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-base text-slate-600 dark:text-slate-400">Test topilmadi.</p>
        <button
          onClick={() => navigate('/tests')}
          className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
        >
          Testlar ro‘yxatiga qaytish
        </button>
      </div>
    );
  }

  const activeAttempt = attempts.find((a) => a.status === 'in_progress');
  const completedCount = attempts.filter((a) => a.status === 'completed').length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <button
        onClick={() => navigate('/tests')}
        className="min-h-[40px] text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Testlar ro‘yxatiga qaytish</span>
      </button>

      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{test.book_title}</span>
            <span aria-hidden="true">·</span>
            <span>{test.topic_name}</span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {test.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {test.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Vaqt limiti</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5 block">
              {test.time_limit} daqiqa
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Savollar soni</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5 block">
              {test.question_count} ta ({test.total_points} ball)
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">O‘tish foizi</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5 block">
              {test.passing_percentage}%
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Urinishlar</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5 block">
              {completedCount} / {test.attempts_limit}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
          <p className="font-semibold text-slate-900 dark:text-white">Muhim qoidalar:</p>
          <p>• Test vaqtida javoblaringiz avtomatik ravishda qurilmada va serverda saqlanib boradi.</p>
          <p>• Internet uzilib qolsa ham javoblarni belgilashda davom etishingiz mumkin.</p>
          <p>• Boshqa oynaga yoki ilovaga o‘tishlar (Tab switch) soni avtomatik hisoblanadi va o‘qituvchiga ko‘rsatiladi.</p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate(`/tests/${test.id}/start`)}
            className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            {activeAttempt ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Testni davom ettirish</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Testni boshlash</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Previous attempts on this test */}
      {attempts.filter((a) => a.status === 'completed').length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Ushbu test bo‘yicha oldingi urinishlaringiz
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {attempts
              .filter((a) => a.status === 'completed')
              .map((att, idx) => (
                <div key={att.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {idx + 1}-urinish
                    </span>
                    <span className="mx-2 text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(att.finished_at || att.started_at).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-semibold tabular-nums">
                      {att.score}/{att.max_score} ({att.percentage}%)
                    </span>
                    <button
                      onClick={() => navigate(`/tests/${test.id}/result?attemptId=${att.id}`)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Natijani ko‘rish
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. MOBILE-FIRST TEST ENGINE (/tests/:id/start)
// ============================================================================
export const StudentTestRunnerPage: React.FC<{ testId: string }> = ({ testId }) => {
  const { apiFetch, navigate, addToast, confirmAction } = useApp();
  const isOnline = useOnlineStatus();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1200);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [pendingOfflineSync, setPendingOfflineSync] = useState(false);

  const localCacheKey = `bilimtest_offline_state_${testId}`;
  const hasAutoSubmitted = useRef(false);

  // 1. Testni serverdan boshlash va offline xotirani tekshirish
  useEffect(() => {
    let mounted = true;
    async function initAttempt() {
      setLoading(true);
      try {
        const res = await apiFetch<{
          attempt: Attempt;
          test: { id: string; title: string; time_limit: number };
          questions: Question[];
          saved_answers: Record<string, string>;
          remaining_seconds: number;
        }>(`/api/tests/${testId}/start`, { method: 'POST' });

        if (!mounted) return;
        setAttemptId(res.attempt.id);
        setTestTitle(res.test.title);
        setQuestions(res.questions);
        setRemainingSeconds(res.remaining_seconds);
        setTabSwitchCount(res.attempt.tab_switch_count || 0);

        // LocalStorage dagi offline javoblarni serverdagi javoblar bilan birlashtirish
        let merged = { ...(res.saved_answers || {}) };
        try {
          const cachedRaw = localStorage.getItem(localCacheKey);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached.attemptId === res.attempt.id) {
              merged = { ...merged, ...(cached.selectedAnswers || {}) };
              if (typeof cached.currentIndex === 'number' && cached.currentIndex < res.questions.length) {
                setCurrentIndex(cached.currentIndex);
              }
              if (typeof cached.tabSwitchCount === 'number' && cached.tabSwitchCount > (res.attempt.tab_switch_count || 0)) {
                setTabSwitchCount(cached.tabSwitchCount);
              }
            }
          }
        } catch {}

        setSelectedAnswers(merged);
      } catch (err: any) {
        addToast(err.message || 'Testni boshlashda xatolik', 'error');
        navigate(`/tests/${testId}`);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    initAttempt();
    return () => {
      mounted = false;
    };
  }, [testId, apiFetch, navigate, addToast, localCacheKey]);

  // 2. Har o'zgarishda LocalStorage ga yozib borish (Offline state persistence)
  useEffect(() => {
    if (!attemptId) return;
    try {
      localStorage.setItem(
        localCacheKey,
        JSON.stringify({
          attemptId,
          currentIndex,
          selectedAnswers,
          tabSwitchCount,
          updatedAt: Date.now(),
        })
      );
    } catch {}
  }, [attemptId, currentIndex, selectedAnswers, tabSwitchCount, localCacheKey]);

  // 3. Server bilan sinxronlash funksiyasi
  const syncWithServer = useCallback(
    async (answersToSync: Record<string, string>, switches: number) => {
      if (!attemptId) return;
      if (!navigator.onLine) {
        setPendingOfflineSync(true);
        return;
      }
      try {
        const res = await apiFetch<{ remaining_seconds: number }>(`/api/attempts/${attemptId}/sync`, {
          method: 'POST',
          body: JSON.stringify({
            answers: answersToSync,
            tab_switch_count: switches,
          }),
        });
        if (typeof res.remaining_seconds === 'number') {
          setRemainingSeconds(res.remaining_seconds);
        }
        setPendingOfflineSync(false);
      } catch {
        setPendingOfflineSync(true);
      }
    },
    [attemptId, apiFetch]
  );

  // Internet qaytganda avtomatik sync qilish
  useEffect(() => {
    if (isOnline && pendingOfflineSync && attemptId) {
      syncWithServer(selectedAnswers, tabSwitchCount);
      addToast('Internet tiklandi. Javoblaringiz server bilan sinxronlandi.', 'info');
    }
  }, [isOnline, pendingOfflineSync, attemptId, selectedAnswers, tabSwitchCount, syncWithServer, addToast]);

  // 4. Page Visibility API — oynadan chiqishni (Tab Switch) aniqlash
  useEffect(() => {
    if (!attemptId) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          syncWithServer(selectedAnswers, next);
          return next;
        });
        addToast('Diqqat: Test oynasidan chiqish qayd etildi!', 'warning');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [attemptId, selectedAnswers, syncWithServer, addToast]);

  // 5. Testni yakunlash (Submit)
  const submitAttempt = useCallback(
    async (isAutoTimeout = false) => {
      if (!attemptId || submitting) return;
      setSubmitting(true);
      if (isAutoTimeout) {
        addToast('Vaqt tugadi. Javoblaringiz avtomatik yuborilmoqda...', 'warning');
      }
      try {
        const res = await apiFetch<{ attempt: Attempt }>(`/api/attempts/${attemptId}/submit`, {
          method: 'POST',
          body: JSON.stringify({
            answers: selectedAnswers,
            tab_switch_count: tabSwitchCount,
          }),
        });
        try {
          localStorage.removeItem(localCacheKey);
        } catch {}
        navigate(`/tests/${testId}/result?attemptId=${res.attempt.id}`);
      } catch (err: any) {
        addToast(err.message || 'Yuborishda xatolik. Qayta urinib ko‘ring.', 'error');
        setSubmitting(false);
      }
    },
    [attemptId, submitting, apiFetch, selectedAnswers, tabSwitchCount, localCacheKey, navigate, testId, addToast]
  );

  // 6. Taymer (Server vaqti asosida)
  useEffect(() => {
    if (loading || !attemptId || submitting) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasAutoSubmitted.current) {
            hasAutoSubmitted.current = true;
            submitAttempt(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, attemptId, submitting, submitAttempt]);

  const handleSelectOption = (questionId: string, answerId: string) => {
    const updated = { ...selectedAnswers, [questionId]: answerId };
    setSelectedAnswers(updated);
    syncWithServer(updated, tabSwitchCount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Test savollari yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const isLowTime = remainingSeconds <= 120;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* STICKY TEST HEADER (Mobile-First: Test Nomi | Savol X/N | Taymer) */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {testTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Savol {currentIndex + 1} / {questions.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>Belgilandi: {answeredCount} ta</span>
              {tabSwitchCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Oynadan chiqish: {tabSwitchCount}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span
              title={isOnline ? 'Server bilan aloqa faol' : 'Offline rejimda saqlanmoqda'}
              className={`p-1.5 rounded-lg ${
                isOnline
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
                  : 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </span>

            <div
              className={`px-3 py-1.5 rounded-xl font-mono font-bold text-sm sm:text-base tabular-nums flex items-center gap-1.5 border ${
                isLowTime
                  ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 animate-pulse'
                  : 'bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* SAVOLLAR NAVIGATSIYASI (1 2 3 4 5 ...) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 overflow-x-auto pb-1">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(selectedAnswers[q.id]);
            const isActive = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`min-w-[40px] min-h-[40px] rounded-xl font-mono text-xs font-bold transition-all shrink-0 flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-600 text-white ring-2 ring-blue-600/30 scale-105'
                    : isAnswered
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* CURRENT QUESTION & LARGE CLICKABLE OPTION CARDS */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col justify-between gap-6">
        {currentQ && (
          <div className="space-y-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>
                  {currentQ.question_type === 'true_false'
                    ? 'TO‘G‘RI / NOTO‘G‘RI savoli'
                    : 'Bitta to‘g‘ri javobni tanlang'}
                </span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {currentQ.points} ball
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentIndex + 1}. {currentQ.question_text}
              </h2>
            </div>

            {/* TOUCH-FRIENDLY ANSWER CARDS */}
            <div className="space-y-3">
              {currentQ.answers.map((ans, optIdx) => {
                const selected = selectedAnswers[currentQ.id] === ans.id;
                const letter = ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] || String(optIdx + 1);
                return (
                  <button
                    key={ans.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, ans.id)}
                    className={`w-full min-h-[56px] p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                      selected
                        ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl font-mono text-sm font-bold flex items-center justify-center shrink-0 transition-colors ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-base font-medium text-slate-900 dark:text-white leading-snug">
                      {ans.answer_text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION: OLDINGI | KEYINGI | TESTNI YAKUNLASH */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="min-h-[48px] px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Oldingi</span>
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-sm font-semibold flex items-center gap-2"
              >
                <span>Keyingi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : null}

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                const unanswered = questions.length - answeredCount;
                confirmAction({
                  title: 'Testni yakunlash',
                  message:
                    unanswered > 0
                      ? `Sizda hali ${unanswered} ta javob berilmagan savol bor. Haqiqatan ham testni yakunlab, natijani tekshirishga yubormoqchimisiz?`
                      : 'Barcha savollarga javob belgiladingiz. Testni yakunlashni tasdiqlaysizmi?',
                  confirmLabel: 'Ha, testni yakunlash',
                  onConfirm: () => submitAttempt(false),
                });
              }}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Yuborilmoqda...' : 'Testni yakunlash'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. RESULT SCREEN (/tests/:id/result)
// ============================================================================
export const StudentTestResultPage: React.FC<{ testId: string }> = ({ testId }) => {
  const { apiFetch, navigate, addToast } = useApp();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const attemptId = params.get('attemptId');

    async function loadResult() {
      setLoading(true);
      try {
        if (attemptId) {
          const data = await apiFetch<Attempt>(`/api/attempts/${attemptId}`);
          setAttempt(data);
        } else {
          const tData = await apiFetch<{ my_attempts: Attempt[] }>(`/api/tests/${testId}`);
          const latest = tData.my_attempts.find((a) => a.status === 'completed');
          if (latest) {
            const full = await apiFetch<Attempt>(`/api/attempts/${latest.id}`);
            setAttempt(full);
          }
        }
      } catch (err: any) {
        addToast(err.message || 'Natijani yuklashda xatolik', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [testId, apiFetch, addToast]);

  // Score counter animation
  useEffect(() => {
    if (!attempt) return;
    const target = attempt.score;
    if (target === 0) {
      setDisplayScore(0);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 20));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [attempt]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-80 rounded-2xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Natija topilmadi.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
        >
          Asosiy sahifaga qaytish
        </button>
      </div>
    );
  }

  const mins = Math.floor((attempt.time_spent || 0) / 60);
  const secs = Math.floor((attempt.time_spent || 0) % 60);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* CELEBRATORY SCORE CARD */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-2xl">
          🎉
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Test yakunlandi!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{attempt.test_title}</p>

        <div className="py-4">
          <div className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {displayScore} / {attempt.max_score} ball
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {attempt.percentage}%
          </div>
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-bold tracking-wide ${
                attempt.passed
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {attempt.passed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>O‘TDI</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>O‘TMADI</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Sarflangan vaqt:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5 block">
              {mins} daqiqa {secs} soniya
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Oynadan chiqish:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5 block">
              {attempt.tab_switch_count || 0} marta
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/tests')}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold"
          >
            Testlar ro‘yxatiga qaytish
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="min-h-[44px] px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Profil va Statistika
          </button>
        </div>
      </div>

      {/* QUESTION-BY-QUESTION BREAKDOWN WITH EXPLANATIONS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Savollar natijasi va tahlili
        </h2>

        {(attempt.answers_detail || []).map((item, idx) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                {idx + 1}. {item.question_text}
              </h3>
              <span
                className={`shrink-0 text-xs font-bold font-mono tabular-nums ${
                  item.is_correct
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {item.is_correct ? `✓ To‘g‘ri (+${item.points_earned})` : '✗ Noto‘g‘ri (0)'}
              </span>
            </div>

            <div className="text-xs sm:text-sm space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Sizning javobingiz: </span>
                <span
                  className={`font-semibold ${
                    item.is_correct
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {item.answer_text}
                </span>
              </div>

              {attempt.show_correct_answers && item.correct_answer_text && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">To‘g‘ri javob: </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {item.correct_answer_text}
                  </span>
                </div>
              )}

              {attempt.show_correct_answers && item.explanation && (
                <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">Izoh: </strong>
                  {item.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 6. STUDENT PROFILE & RESULTS HISTORY (/profile & /results)
// ============================================================================
export const StudentProfileAndResultsPage: React.FC = () => {
  const { user, apiFetch, navigate } = useApp();
  const [results, setResults] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Attempt[]>('/api/results')
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiFetch]);

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;
  const avgPercentage =
    totalTests > 0
      ? Math.round((results.reduce((s, r) => s + r.percentage, 0) / totalTests) * 10) / 10
      : 0;

  // Vaqt bo'yicha grafik uchun nuqtalar (eskidan yangiga qarab)
  const chronological = [...results].reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* PROFILE CARD */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
            {(user?.first_name?.[0] || 'A') + (user?.last_name?.[0] || 'V')}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {user ? `${user.first_name} ${user.last_name}` : 'Ali Valiyev'}
            </h1>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.phone || '+998 90 987 65 43'}
            </p>
            <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span>Guruh: </span>
              <strong className="font-semibold">
                {user?.group_names?.join(', ') || '9-A (Ingliz tili IELTS)'}
              </strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[11px] text-slate-500 block">Jami testlar</span>
            <span className="text-lg font-bold font-mono tabular-nums">{totalTests}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[11px] text-slate-500 block">O‘tilgan</span>
            <span className="text-lg font-bold font-mono tabular-nums text-emerald-600">
              {passedTests}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[11px] text-slate-500 block">O‘tilmagan</span>
            <span className="text-lg font-bold font-mono tabular-nums text-red-600">
              {failedTests}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[11px] text-slate-500 block">O‘rtacha foiz</span>
            <span className="text-lg font-bold font-mono tabular-nums text-blue-600">
              {avgPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* VAQT BO'YICHA NATIJALAR GRAFIGI (RESPONSIVE SVG CHART) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Vaqt bo‘yicha natijalar dinamikasi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Topshirilgan testlardagi o‘zlashtirish ko‘rsatkichi (%)
          </p>
        </div>

        {chronological.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-sm text-slate-400">
            Grafik ko‘rinishi uchun kamida 1 ta test ishlang.
          </div>
        ) : (
          <div className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {chronological.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">#{idx + 1}</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {new Date(item.finished_at || item.started_at).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.test_title}
                  </p>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.passed ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span>
                      {item.score}/{item.max_score} ball
                    </span>
                    <span
                      className={`font-bold ${
                        item.passed ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULL RESULTS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Barcha topshirilgan testlar jadvali
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Yuklanmoqda...</div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Hozircha topshirilgan testlar yo‘q.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 font-medium">Test</th>
                  <th className="py-3.5 px-4 font-medium">Sana</th>
                  <th className="py-3.5 px-4 font-medium text-right">Ball</th>
                  <th className="py-3.5 px-4 font-medium text-right">Foiz</th>
                  <th className="py-3.5 px-4 font-medium">Natija</th>
                  <th className="py-3.5 px-4 font-medium text-right">Vaqt</th>
                  <th className="py-3.5 px-4 font-medium text-right">Tahlil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {results.map((r) => {
                  const m = Math.floor((r.time_spent || 0) / 60);
                  const s = Math.floor((r.time_spent || 0) % 60);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {r.test_title}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500 tabular-nums">
                        {new Date(r.finished_at || r.started_at).toLocaleString('uz-UZ')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {r.score} / {r.max_score}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                        {r.percentage}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-semibold ${
                            r.passed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {r.passed ? '✓ O‘tdi' : '✗ O‘tmadi'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-500 tabular-nums">
                        {m} daq {s} son
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/tests/${r.test_id}/result?attemptId=${r.id}`)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Batafsil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
