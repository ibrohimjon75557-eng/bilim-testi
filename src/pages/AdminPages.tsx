import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Send,
  Play,
  Users,
  BookOpen,
  Layers,
  BarChart3,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  User,
  Group,
  Book,
  Topic,
  TestItem,
  Question,
  Attempt,
  QuestionStat,
  UnattemptedStudent,
  TelegramNotificationLog,
  ParsedDocxQuestion,
  LoadTestReport,
} from '../types';
import { extractTextFromDocxFile, parseQuestionsFromText } from '../utils/docxParser';
import { exportResultsToExcel, formatSecondsUz } from '../utils/excelExport';
import { formatUzbekPhone } from './AuthPages';

// ============================================================================
// 1. ADMIN DASHBOARD (/admin)
// ============================================================================
export const AdminDashboardPage: React.FC = () => {
  const { apiFetch, navigate } = useApp();
  const [data, setData] = useState<{
    metrics: {
      total_students: number;
      active_students: number;
      total_tests: number;
      today_submissions: number;
      average_score: number;
      pass_rate: number;
    };
    group_stats: {
      id: string;
      name: string;
      student_count: number;
      attempts_count: number;
      average_percentage: number;
    }[];
    recent_attempts: Attempt[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiFetch]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const m = data?.metrics || {
    total_students: 0,
    active_students: 0,
    total_tests: 0,
    today_submissions: 0,
    average_score: 0,
    pass_rate: 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            O‘qituvchi Boshqaruv Paneli
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            O‘quvchilar faolligi, test natijalari va guruhlar ko‘rsatkichlari
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/tests')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi test yaratish</span>
          </button>
          <button
            onClick={() => navigate('/admin/results')}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Natijalarni ko‘rish
          </button>
        </div>
      </div>

      {/* 6 ANIMATED METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Jami o‘quvchilar</span>
          <span className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white block">
            {m.total_students}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Faol o‘quvchilar</span>
          <span className="mt-2 text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 block">
            {m.active_students}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Jami testlar</span>
          <span className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white block">
            {m.total_tests}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Bugungi testlar</span>
          <span className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white block">
            {m.today_submissions}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">O‘rtacha natija</span>
          <span className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white block">
            {m.average_score}%
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">O‘tganlar foizi</span>
          <span className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 block">
            {m.pass_rate}%
          </span>
        </div>
      </div>

      {/* GROUP PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Guruhlar ko‘rsatkichi
            </h2>
            <button
              onClick={() => navigate('/admin/groups')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Boshqarish
            </button>
          </div>

          <div className="space-y-4">
            {(data?.group_stats || []).map((g) => (
              <div key={g.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {g.name}
                  </span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {g.student_count} o‘quvchi · {g.average_percentage}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, g.average_percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ATTEMPTS TABLE */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Oxirgi topshirilgan testlar
            </h2>
            <button
              onClick={() => navigate('/admin/results')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Barchasi →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  <th className="py-3 px-4 font-medium">O‘quvchi</th>
                  <th className="py-3 px-4 font-medium">Guruh</th>
                  <th className="py-3 px-4 font-medium">Test</th>
                  <th className="py-3 px-4 font-medium text-right">Ball / Foiz</th>
                  <th className="py-3 px-4 font-medium">Natija</th>
                  <th className="py-3 px-4 font-medium text-right">Tab almashtirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {(data?.recent_attempts || []).map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {att.student_name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{att.group_name}</td>
                    <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300">
                      {att.test_title}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums">
                      {att.score}/{att.max_score} ({att.percentage}%)
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold ${
                          att.passed ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {att.passed ? '✓ O‘tdi' : '✗ O‘tmadi'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums">
                      {att.tab_switch_count} marta
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. ADMIN STUDENTS (/admin/students)
// ============================================================================
export const AdminStudentsPage: React.FC = () => {
  const { apiFetch, addToast, confirmAction } = useApp();
  const [students, setStudents] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 90 ');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const loadAll = useCallback(async () => {
    const [st, gr] = await Promise.all([
      apiFetch<User[]>('/api/admin/students'),
      apiFetch<Group[]>('/api/admin/groups'),
    ]);
    setStudents(st);
    setGroups(gr);
  }, [apiFetch]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
          group_ids: selectedGroups,
        }),
      });
      setFirstName('');
      setLastName('');
      setPhone('+998 90 ');
      setSelectedGroups([]);
      addToast('O‘quvchi muvaffaqiyatli qo‘shildi', 'success');
      loadAll();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">O‘quvchilar</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Ro‘yxatdan o‘tgan o‘quvchilar va ularni guruhlarga biriktirish
        </p>
      </div>

      {/* Add Student Form */}
      <form
        onSubmit={handleAddStudent}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Yangi o‘quvchi qo‘shish
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ism"
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Familiya"
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(formatUzbekPhone(e.target.value))}
            placeholder="+998 90 123 45 67"
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-500">Guruhlar:</span>
            {groups.map((g) => (
              <label key={g.id} className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(g.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedGroups((p) => [...p, g.id]);
                    else setSelectedGroups((p) => p.filter((id) => id !== g.id));
                  }}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>{g.name}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Qo‘shish</span>
          </button>
        </div>
      </form>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <th className="py-3.5 px-4 font-medium">Ism va Familiya</th>
                <th className="py-3.5 px-4 font-medium">Telefon</th>
                <th className="py-3.5 px-4 font-medium">Guruhlar</th>
                <th className="py-3.5 px-4 font-medium">Telegram ID</th>
                <th className="py-3.5 px-4 font-medium text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {st.first_name} {st.last_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs tabular-nums">{st.phone}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                    {st.group_names?.join(' · ') || 'Guruhga qo‘shilmagan'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                    {st.telegram_id || 'Tasdiqlanmagan'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() =>
                        confirmAction({
                          title: 'O‘quvchini o‘chirish',
                          message: `${st.first_name} ${st.last_name} hamda uning barcha test natijalarini o‘chirishni xohlaysizmi?`,
                          danger: true,
                          confirmLabel: 'O‘chirish',
                          onConfirm: async () => {
                            await apiFetch(`/api/admin/students/${st.id}`, { method: 'DELETE' });
                            addToast('O‘quvchi o‘chirildi', 'info');
                            loadAll();
                          },
                        })
                      }
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. ADMIN GROUPS (/admin/groups)
// ============================================================================
export const AdminGroupsPage: React.FC = () => {
  const { apiFetch, addToast, confirmAction } = useApp();
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [studentToAdd, setStudentToAdd] = useState('');

  const loadData = useCallback(async () => {
    const [gr, st] = await Promise.all([
      apiFetch<Group[]>('/api/admin/groups'),
      apiFetch<User[]>('/api/admin/students'),
    ]);
    setGroups(gr);
    setStudents(st);
    if (!selectedGroupId && gr.length > 0) {
      setSelectedGroupId(gr[0].id);
    }
  }, [apiFetch, selectedGroupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/groups', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      setName('');
      setDescription('');
      addToast('Guruh yaratildi', 'success');
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroupId || !studentToAdd) return;
    try {
      await apiFetch(`/api/admin/groups/${selectedGroupId}/members`, {
        method: 'POST',
        body: JSON.stringify({ user_id: studentToAdd }),
      });
      setStudentToAdd('');
      addToast('O‘quvchi guruhga qo‘shildi', 'success');
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const activeGroup = groups.find((g) => g.id === selectedGroupId);
  const groupMembers = students.filter((s) => s.group_ids?.includes(selectedGroupId || ''));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guruhlar</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Guruh yaratish, o‘quvchilar biriktirish va guruh o‘rtacha natijalarini kuzatish
        </p>
      </div>

      {/* Create Group Form */}
      <form
        onSubmit={handleCreateGroup}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
      >
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Guruh nomi
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: 9-A (Ingliz tili)"
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Tavsif
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dars vaqtlari yoki yo‘nalish tavsifi"
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
        </div>
        <button
          type="submit"
          className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Guruh yaratish</span>
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups list */}
        <div className="space-y-3">
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => setSelectedGroupId(g.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-colors ${
                selectedGroupId === g.id
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{g.name}</h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmAction({
                      title: 'Guruhni o‘chirish',
                      message: `"${g.name}" guruhini o‘chirishni tasdiqlaysizmi?`,
                      danger: true,
                      onConfirm: async () => {
                        await apiFetch(`/api/admin/groups/${g.id}`, { method: 'DELETE' });
                        addToast('Guruh o‘chirildi', 'info');
                        loadData();
                      },
                    });
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  O‘chirish
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">{g.description}</p>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                <span>{g.student_count} o‘quvchi</span>
                <span>·</span>
                <span>{g.test_count} ta test</span>
                <span>·</span>
                <span>O‘rtacha: {g.average_score}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Group Details & Member Management */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          {activeGroup ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeGroup.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    O‘quvchilar soni: {activeGroup.student_count} ta · Ochilgan testlar:{' '}
                    {activeGroup.test_count} ta · O‘rtacha natija: {activeGroup.average_score}%
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={studentToAdd}
                    onChange={(e) => setStudentToAdd(e.target.value)}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="">O‘quvchi tanlang...</option>
                    {students
                      .filter((s) => !s.group_ids?.includes(activeGroup.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.phone})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold whitespace-nowrap"
                  >
                    + Guruhga qo‘shish
                  </button>
                </div>
              </div>

              {groupMembers.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  Ushbu guruhda hozircha o‘quvchilar yo‘q.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {groupMembers.map((m) => (
                    <div key={m.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {m.first_name} {m.last_name}
                        </span>
                        <span className="ml-3 font-mono text-xs text-slate-500">{m.phone}</span>
                      </div>
                      <button
                        onClick={async () => {
                          await apiFetch(`/api/admin/groups/${activeGroup.id}/members/${m.id}`, {
                            method: 'DELETE',
                          });
                          addToast('O‘quvchi guruhdan chiqarildi', 'info');
                          loadData();
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Chiqarish
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Guruhni tanlang</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. ADMIN BOOKS & TOPICS (/admin/books & /admin/topics)
// ============================================================================
export const AdminBooksAndTopicsPage: React.FC<{ initialTab?: 'books' | 'topics' }> = ({
  initialTab = 'books',
}) => {
  const { apiFetch, addToast } = useApp();
  const [books, setBooks] = useState<Book[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [bookDesc, setBookDesc] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [topicName, setTopicName] = useState('');

  const loadAll = useCallback(async () => {
    const [b, t] = await Promise.all([
      apiFetch<Book[]>('/api/admin/books'),
      apiFetch<Topic[]>('/api/admin/topics'),
    ]);
    setBooks(b);
    setTopics(t);
    if (!selectedBookId && b.length > 0) {
      setSelectedBookId(b[0].id);
    }
  }, [apiFetch, selectedBookId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/books', {
        method: 'POST',
        body: JSON.stringify({ title: bookTitle, description: bookDesc }),
      });
      setBookTitle('');
      setBookDesc('');
      addToast('Kitob saqlandi', 'success');
      loadAll();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/topics', {
        method: 'POST',
        body: JSON.stringify({ book_id: selectedBookId, name: topicName }),
      });
      setTopicName('');
      addToast('Mavzu saqlandi', 'success');
      loadAll();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {initialTab === 'books' ? 'Kitoblar va Qo‘llanmalar' : 'Mavzular bazasi'}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Testlarni tizimli ravishda kitob va mavzularga bog‘lash
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BOOKS COLUMN */}
        <div className="space-y-4">
          <form
            onSubmit={handleAddBook}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Yangi kitob qo‘shish
            </h2>
            <input
              type="text"
              required
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="Masalan: English Grammar in Use"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
            <input
              type="text"
              value={bookDesc}
              onChange={(e) => setBookDesc(e.target.value)}
              placeholder="Qisqacha tavsif"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              + Kitob yaratish
            </button>
          </form>

          <div className="space-y-2.5">
            {books.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{b.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {b.topic_count} ta mavzu · {b.test_count} ta test
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await apiFetch(`/api/admin/books/${b.id}`, { method: 'DELETE' });
                    addToast('Kitob o‘chirildi', 'info');
                    loadAll();
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  O‘chirish
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TOPICS COLUMN */}
        <div className="space-y-4">
          <form
            onSubmit={handleAddTopic}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Kitob ichiga mavzu qo‘shish
            </h2>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="Masalan: Present Simple / Modal verbs"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              + Mavzu qo‘shish
            </button>
          </form>

          <div className="space-y-2.5">
            {topics.map((tp) => (
              <div
                key={tp.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs text-slate-400 block">{tp.book_title}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{tp.name}</h3>
                </div>
                <button
                  onClick={async () => {
                    await apiFetch(`/api/admin/topics/${tp.id}`, { method: 'DELETE' });
                    addToast('Mavzu o‘chirildi', 'info');
                    loadAll();
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  O‘chirish
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. ADMIN TESTS, QUESTION BUILDER & WORD (.DOCX) IMPORT (/admin/tests)
// ============================================================================
export const AdminTestsPage: React.FC = () => {
  const { apiFetch, addToast, confirmAction } = useApp();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  // New Test fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bookId, setBookId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [attemptsLimit, setAttemptsLimit] = useState(2);
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [openAt, setOpenAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['group-9a']);

  // Single Question Builder fields
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'single_choice' | 'true_false'>('single_choice');
  const [qPoints, setQPoints] = useState(10);
  const [qExplanation, setQExplanation] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);

  // DOCX Import Modal State ("Importni tekshirish")
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawImportText, setRawImportText] = useState(
    `1. She ___ to the library every Saturday morning.\nA) go\n*B) goes\nC) going\nD) gone\nIzoh: 3-shaxs birlikda Present Simple zamonida fe'lga -es qo'shiladi.\n\n2. The Earth revolves around the Sun.\n*A) TO'G'RI\nB) NOTO'G'RI\nIzoh: Ilmiy haqiqat doimo Present Simple zamonida ifodalanadi.`
  );
  const [parsedPreview, setParsedPreview] = useState<ParsedDocxQuestion[]>([]);

  const loadInitial = useCallback(async () => {
    const [ts, bk, tp, gr] = await Promise.all([
      apiFetch<TestItem[]>('/api/admin/tests'),
      apiFetch<Book[]>('/api/admin/books'),
      apiFetch<Topic[]>('/api/admin/topics'),
      apiFetch<Group[]>('/api/admin/groups'),
    ]);
    setTests(ts);
    setBooks(bk);
    setTopics(tp);
    setGroups(gr);
    if (!activeTestId && ts.length > 0) {
      setActiveTestId(ts[0].id);
    }
  }, [apiFetch, activeTestId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadQuestions = useCallback(
    async (tId: string) => {
      const qs = await apiFetch<Question[]>(`/api/admin/tests/${tId}/questions`);
      setQuestions(qs);
    },
    [apiFetch]
  );

  useEffect(() => {
    if (activeTestId) {
      loadQuestions(activeTestId);
    }
  }, [activeTestId, loadQuestions]);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiFetch<TestItem>('/api/admin/tests', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          book_id: bookId || null,
          topic_id: topicId || null,
          time_limit: timeLimit,
          attempts_limit: attemptsLimit,
          passing_percentage: passingPercentage,
          open_at: openAt || null,
          close_at: closeAt || null,
          shuffle_questions: shuffleQuestions,
          shuffle_answers: shuffleAnswers,
          show_correct_answers: showCorrectAnswers,
          group_ids: selectedGroups,
        }),
      });
      setShowCreateForm(false);
      setTitle('');
      setDescription('');
      setActiveTestId(created.id);
      addToast('Test saqlandi', 'success');
      loadInitial();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTestId) return;

    const answersPayload =
      qType === 'true_false'
        ? [
            { answer_text: "TO'G'RI", is_correct: correctIdx === 0 },
            { answer_text: "NOTO'G'RI", is_correct: correctIdx === 1 },
          ]
        : [
            { answer_text: optA, is_correct: correctIdx === 0 },
            { answer_text: optB, is_correct: correctIdx === 1 },
            { answer_text: optC, is_correct: correctIdx === 2 },
            { answer_text: optD, is_correct: correctIdx === 3 },
          ];

    try {
      await apiFetch(`/api/admin/tests/${activeTestId}/questions`, {
        method: 'POST',
        body: JSON.stringify({
          question_text: qText,
          question_type: qType,
          points: qPoints,
          explanation: qExplanation,
          answers: answersPayload,
        }),
      });
      setQText('');
      setQExplanation('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      addToast('Savol qo‘shildi', 'success');
      loadQuestions(activeTestId);
      loadInitial();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // Word (.docx) fayl yuklanganda o'qib olish
  const handleDocxFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const extractedText = await extractTextFromDocxFile(file);
      setRawImportText(extractedText);
      const parsed = parseQuestionsFromText(extractedText);
      setParsedPreview(parsed);
      addToast('.docx fayl o‘qildi. Importni tekshiring.', 'info');
    } catch (err: any) {
      addToast(err.message || '.docx faylni o‘qishda xatolik', 'error');
    }
  };

  // Namuna .docx fayl yaratib yuklab olish (o'qituvchi sinab ko'rishi uchun)
  const handleDownloadSampleDocx = async () => {
    const zip = new JSZip();
    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>1. They ___ football in the school yard right now.</w:t></w:r></w:p>
    <w:p><w:r><w:t>A) play</w:t></w:r></w:p>
    <w:p><w:r><w:t>*B) are playing</w:t></w:r></w:p>
    <w:p><w:r><w:t>C) played</w:t></w:r></w:p>
    <w:p><w:r><w:t>D) plays</w:t></w:r></w:p>
    <w:p><w:r><w:t>Izoh: "Right now" ayni vaqtda davom etayotgan harakatni bildiradi.</w:t></w:r></w:p>
    <w:p><w:r><w:t>2. English ___ spoken all over the world.</w:t></w:r></w:p>
    <w:p><w:r><w:t>*A) is</w:t></w:r></w:p>
    <w:p><w:r><w:t>B) are</w:t></w:r></w:p>
    <w:p><w:r><w:t>C) were</w:t></w:r></w:p>
    <w:p><w:r><w:t>D) be</w:t></w:r></w:p>
  </w:body>
</w:document>`;
    zip.file('word/document.xml', docXml);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BilimTest_Namuna_Savollar.docx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImportSave = async () => {
    if (!activeTestId) return;
    const validQuestions = parsedPreview.filter((q) => q.errors.length === 0);
    if (validQuestions.length === 0) {
      addToast('Saqlash uchun xatosiz savollar yo‘q', 'error');
      return;
    }
    try {
      const res = await apiFetch<{ imported_count: number }>(
        `/api/admin/tests/${activeTestId}/import-questions`,
        {
          method: 'POST',
          body: JSON.stringify({ questions: validQuestions }),
        }
      );
      addToast(`${res.imported_count} ta savol muvaffaqiyatli saqlandi!`, 'success');
      setShowImportModal(false);
      loadQuestions(activeTestId);
      loadInitial();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const activeTest = tests.find((t) => t.id === activeTestId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Testlar va Savollar</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Yangi test yaratish, savollar qo‘shish va Word (.docx) fayldan savol import qilish
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>{showCreateForm ? 'Formani yopish' : 'Yangi test'}</span>
        </button>
      </div>

      {/* NEW TEST MODAL / COLLAPSIBLE FORM */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateTest}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Yangi test parametrlarini kiritish
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Test nomi
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: Present Perfect — Nazorat testi"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Kitob
              </label>
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="">Kitobni tanlang...</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Mavzu
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="">Mavzuni tanlang...</option>
                {topics
                  .filter((tp) => !bookId || tp.book_id === bookId)
                  .map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      {tp.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Vaqt limiti (daqiqa)
              </label>
              <input
                type="number"
                min={1}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Urinishlar soni
              </label>
              <input
                type="number"
                min={1}
                value={attemptsLimit}
                onChange={(e) => setAttemptsLimit(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                O‘tish foizi (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Ochilish sanasi (ixtiyoriy)
              </label>
              <input
                type="datetime-local"
                value={openAt}
                onChange={(e) => setOpenAt(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Yopilish sanasi (ixtiyoriy)
              </label>
              <input
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Tavsif
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Test haqida o‘quvchilarga ko‘rsatma..."
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          {/* CHECKBOXES */}
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Savollarni aralashtirish</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleAnswers}
                onChange={(e) => setShuffleAnswers(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Variantlarni aralashtirish</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={showCorrectAnswers}
                onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Natijadan keyin to‘g‘ri javoblarni ko‘rsatish</span>
            </label>
          </div>

          {/* GROUP SELECTION */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Testni qaysi guruhlar ko‘radi:
            </span>
            <div className="flex flex-wrap gap-4">
              {groups.map((g) => (
                <label key={g.id} className="inline-flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(g.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedGroups((p) => [...p, g.id]);
                      else setSelectedGroups((p) => p.filter((id) => id !== g.id));
                    }}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>{g.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Testni saqlash
            </button>
          </div>
        </form>
      )}

      {/* TESTS LIST + ACTIVE TEST QUESTIONS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tests List */}
        <div className="space-y-3">
          {tests.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTestId(t.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-colors ${
                activeTestId === t.id
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmAction({
                      title: 'Testni o‘chirish',
                      message: `"${t.title}" testini barcha savollari bilan o‘chirishni xohlaysizmi?`,
                      danger: true,
                      onConfirm: async () => {
                        await apiFetch(`/api/admin/tests/${t.id}`, { method: 'DELETE' });
                        addToast('Test o‘chirildi', 'info');
                        loadInitial();
                      },
                    });
                  }}
                  className="text-xs text-red-500 hover:underline shrink-0"
                >
                  O‘chirish
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t.book_title} · {t.topic_name}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                <span>{t.question_count} savol</span>
                <span>·</span>
                <span>{t.time_limit} daq</span>
                <span>·</span>
                <span>O‘tish: {t.passing_percentage}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Active Test Questions & DOCX Import */}
        <div className="lg:col-span-2 space-y-6">
          {activeTest && (
            <>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeTest.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Guruhlar: {activeTest.group_names?.join(', ') || 'Tanlanmagan'} · Jami:{' '}
                    {questions.length} ta savol
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setParsedPreview(parseQuestionsFromText(rawImportText));
                    setShowImportModal(true);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  <span>Word (.docx) dan savol import</span>
                </button>
              </div>

              {/* ADD QUESTION FORM */}
              <form
                onSubmit={handleAddQuestion}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Yangi savol qo‘shish
                  </h3>
                  <div className="flex items-center gap-3">
                    <select
                      value={qType}
                      onChange={(e) => {
                        setQType(e.target.value as 'single_choice' | 'true_false');
                        setCorrectIdx(0);
                      }}
                      className="min-h-[38px] px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    >
                      <option value="single_choice">Bitta to‘g‘ri javob (A, B, C, D)</option>
                      <option value="true_false">TO‘G‘RI / NOTO‘G‘RI</option>
                    </select>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span>Ball:</span>
                      <input
                        type="number"
                        min={1}
                        value={qPoints}
                        onChange={(e) => setQPoints(Number(e.target.value))}
                        className="w-16 min-h-[38px] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Savol matnini kiriting..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />

                {qType === 'single_choice' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'A', val: optA, set: setOptA, idx: 0 },
                      { label: 'B', val: optB, set: setOptB, idx: 1 },
                      { label: 'C', val: optC, set: setOptC, idx: 2 },
                      { label: 'D', val: optD, set: setOptD, idx: 3 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct_opt"
                          checked={correctIdx === item.idx}
                          onChange={() => setCorrectIdx(item.idx)}
                          title="To‘g‘ri javob sifatida belgilash"
                          className="w-4 h-4 text-emerald-600"
                        />
                        <input
                          type="text"
                          required
                          value={item.val}
                          onChange={(e) => item.set(e.target.value)}
                          placeholder={`${item.label}) variant matni`}
                          className="flex-1 min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-6 py-1">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="tf_opt"
                        checked={correctIdx === 0}
                        onChange={() => setCorrectIdx(0)}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span>TO‘G‘RI</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="tf_opt"
                        checked={correctIdx === 1}
                        onChange={() => setCorrectIdx(1)}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span>NOTO‘G‘RI</span>
                    </label>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="To‘g‘ri javob izohi (test tugagach o‘quvchiga ko‘rinadi)"
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
                  >
                    + Savolni saqlash
                  </button>
                </div>
              </form>

              {/* EXISTING QUESTIONS LIST */}
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {idx + 1}. {q.question_text}
                      </h4>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs text-slate-500">{q.points} ball</span>
                        <button
                          onClick={async () => {
                            await apiFetch(`/api/admin/questions/${q.id}`, { method: 'DELETE' });
                            addToast('Savol o‘chirildi', 'info');
                            loadQuestions(activeTest.id);
                            loadInitial();
                          }}
                          className="text-xs text-red-500 hover:underline"
                        >
                          O‘chirish
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.answers.map((a, aIdx) => (
                        <div
                          key={a.id}
                          className={`px-3 py-1.5 rounded-lg border ${
                            a.is_correct
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {['A', 'B', 'C', 'D'][aIdx] || aIdx + 1}) {a.answer_text}{' '}
                          {a.is_correct ? '✓' : ''}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <strong>Izoh:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ====================================================================
          WORD (.DOCX) IMPORTNI TEKSHIRISH MODALI
         ==================================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Importni tekshirish (.docx savollar parseri)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  To‘g‘ri javob oldiga <strong>*</strong> belgisi qo‘yiladi (masalan: *B) goes).
                  Saqlash bosilmaguncha bazaga yozilmaydi.
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="min-h-[42px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>.docx fayl tanlash</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleDocxFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleDownloadSampleDocx}
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Namuna .docx faylni yuklab olish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-y-auto min-h-0">
              {/* Left: Editable Raw Text */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Savollar matni (tahrirlash mumkin):
                </label>
                <textarea
                  rows={12}
                  value={rawImportText}
                  onChange={(e) => {
                    setRawImportText(e.target.value);
                    setParsedPreview(parseQuestionsFromText(e.target.value));
                  }}
                  className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Right: Live Validation Preview */}
              <div className="space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Aniqlangan savollar ({parsedPreview.length} ta):
                  </span>
                  <span className="font-mono">
                    Tayyor:{' '}
                    <strong className="text-emerald-600">
                      {parsedPreview.filter((p) => p.errors.length === 0).length}
                    </strong>{' '}
                    / Xatoli:{' '}
                    <strong className="text-red-600">
                      {parsedPreview.filter((p) => p.errors.length > 0).length}
                    </strong>
                  </span>
                </div>

                {parsedPreview.map((item, idx) => (
                  <div
                    key={item.tempId}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      item.errors.length > 0
                        ? 'bg-red-50/60 dark:bg-red-950/30 border-red-300 dark:border-red-800'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {idx + 1}. {item.question_text || '(Savol matni bo‘sh)'}
                      </span>
                      <span
                        className={`font-semibold shrink-0 ${
                          item.errors.length === 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {item.errors.length === 0 ? '✓ To‘g‘ri' : '✗ Xato'}
                      </span>
                    </div>

                    {item.errors.length > 0 && (
                      <div className="text-red-600 dark:text-red-400 font-medium space-y-0.5">
                        {item.errors.map((err, eIdx) => (
                          <div key={eIdx}>• {err}</div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1.5">
                      {item.answers.map((a, aIdx) => (
                        <div
                          key={aIdx}
                          className={`px-2 py-1 rounded border ${
                            a.is_correct
                              ? 'border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/50 font-semibold text-emerald-800 dark:text-emerald-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {['A', 'B', 'C', 'D'][aIdx] || aIdx + 1}) {a.answer_text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleConfirmImportSave}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Saqlash ({parsedPreview.filter((p) => p.errors.length === 0).length} ta savol)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. ADMIN RESULTS, EXCEL EXPORT & UNATTEMPTED STUDENTS (/admin/results)
// ============================================================================
export const AdminResultsPage: React.FC = () => {
  const { apiFetch, addToast, confirmAction } = useApp();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [filterGroup, setFilterGroup] = useState('');
  const [filterTest, setFilterTest] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [activeTab, setActiveTab] = useState<'completed' | 'unattempted'>('completed');
  const [unattemptedTestId, setUnattemptedTestId] = useState('');
  const [unattemptedList, setUnattemptedList] = useState<UnattemptedStudent[]>([]);
  const [inspectAttempt, setInspectAttempt] = useState<Attempt | null>(null);

  const loadFiltersData = useCallback(async () => {
    const [gr, ts, st] = await Promise.all([
      apiFetch<Group[]>('/api/admin/groups'),
      apiFetch<TestItem[]>('/api/admin/tests'),
      apiFetch<User[]>('/api/admin/students'),
    ]);
    setGroups(gr);
    setTests(ts);
    setStudents(st);
    if (!unattemptedTestId && ts.length > 0) {
      setUnattemptedTestId(ts[0].id);
    }
  }, [apiFetch, unattemptedTestId]);

  const loadResults = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterGroup) params.set('group_id', filterGroup);
    if (filterTest) params.set('test_id', filterTest);
    if (filterStudent) params.set('student_id', filterStudent);
    if (filterDate) params.set('date', filterDate);

    const data = await apiFetch<Attempt[]>(`/api/admin/results?${params.toString()}`);
    setAttempts(data);
  }, [apiFetch, filterGroup, filterTest, filterStudent, filterDate]);

  useEffect(() => {
    loadFiltersData();
  }, [loadFiltersData]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    if (activeTab === 'unattempted' && unattemptedTestId) {
      apiFetch<UnattemptedStudent[]>(`/api/admin/tests/${unattemptedTestId}/unattempted`)
        .then(setUnattemptedList)
        .catch(() => {});
    }
  }, [activeTab, unattemptedTestId, apiFetch]);

  const handleOpenDetail = async (attemptId: string) => {
    try {
      const full = await apiFetch<Attempt>(`/api/attempts/${attemptId}`);
      setInspectAttempt(full);
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            O‘quvchilar Natijalari
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Filtrlash, Excel eksport, qayta topshirishga ruxsat berish va testni ishlamaganlar ro‘yxati
          </p>
        </div>

        <button
          onClick={() => {
            exportResultsToExcel(attempts);
            addToast('Excel fayl tayyorlandi va yuklab olindi', 'success');
          }}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 self-start"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excelga yuklab olish (.xlsx)</span>
        </button>
      </div>

      {/* Segmented Control: Topshirganlar vs Hali ishlamaganlar */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('completed')}
          className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Topshirilgan natijalar ({attempts.length})
        </button>
        <button
          onClick={() => setActiveTab('unattempted')}
          className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'unattempted'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Testni hali ishlamaganlar
        </button>
      </div>

      {activeTab === 'completed' ? (
        <>
          {/* FILTERS BAR */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            >
              <option value="">Barcha guruhlar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <select
              value={filterTest}
              onChange={(e) => setFilterTest(e.target.value)}
              className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            >
              <option value="">Barcha testlar</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            >
              <option value="">Barcha o‘quvchilar</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />
          </div>

          {/* RESULTS TABLE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                    <th className="py-3.5 px-4 font-medium">O‘quvchi</th>
                    <th className="py-3.5 px-4 font-medium">Test</th>
                    <th className="py-3.5 px-4 font-medium">Sana</th>
                    <th className="py-3.5 px-4 font-medium text-right">Ball</th>
                    <th className="py-3.5 px-4 font-medium text-right">Foiz</th>
                    <th className="py-3.5 px-4 font-medium">Natija</th>
                    <th className="py-3.5 px-4 font-medium text-right">Vaqt</th>
                    <th className="py-3.5 px-4 font-medium text-right">Oynadan chiqishlar</th>
                    <th className="py-3.5 px-4 font-medium text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {attempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {att.student_name}
                        </div>
                        <div className="text-xs text-slate-500">{att.group_name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {att.test_title}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500 tabular-nums">
                        {new Date(att.finished_at || att.started_at).toLocaleString('uz-UZ')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums">
                        {att.score} / {att.max_score}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-xs tabular-nums">
                        {att.percentage}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-semibold ${
                            att.passed ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {att.passed ? '✓ O‘tdi' : '✗ O‘tmadi'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500 tabular-nums">
                        {formatSecondsUz(att.time_spent)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums">
                        Tab almashtirish: {att.tab_switch_count} marta
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2.5 text-xs font-medium">
                          <button
                            onClick={() => handleOpenDetail(att.id)}
                            className="text-blue-600 hover:underline"
                          >
                            Ko‘rish
                          </button>
                          <button
                            onClick={async () => {
                              await apiFetch(`/api/admin/attempts/${att.id}/allow-retake`, {
                                method: 'POST',
                              });
                              addToast('Qayta topshirishga ruxsat berildi', 'success');
                            }}
                            className="text-amber-600 hover:underline whitespace-nowrap"
                          >
                            Qayta ruxsat
                          </button>
                          <button
                            onClick={() =>
                              confirmAction({
                                title: 'Natijani o‘chirish',
                                message: 'Bu natijani o‘chirishni xohlaysizmi?',
                                danger: true,
                                confirmLabel: 'O‘chirish',
                                onConfirm: async () => {
                                  await apiFetch(`/api/admin/attempts/${att.id}`, {
                                    method: 'DELETE',
                                  });
                                  addToast('Natija o‘chirildi', 'info');
                                  loadResults();
                                },
                              })
                            }
                            className="text-red-600 hover:underline"
                          >
                            O‘chirish
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* TESTNI HALI ISHLAMAGAN O'QUVCHILAR */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Testni tanlang:
            </span>
            <select
              value={unattemptedTestId}
              onChange={(e) => setUnattemptedTestId(e.target.value)}
              className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
            >
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {unattemptedList.length === 0 ? (
              <div className="p-8 text-center text-sm text-emerald-600 font-medium">
                Guruhdagi barcha o‘quvchilar ushbu testni topshirgan!
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                    <th className="py-3.5 px-4 font-medium">Ism</th>
                    <th className="py-3.5 px-4 font-medium">Familiya</th>
                    <th className="py-3.5 px-4 font-medium">Guruh</th>
                    <th className="py-3.5 px-4 font-medium">Telefon</th>
                    <th className="py-3.5 px-4 font-medium">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {unattemptedList.map((st) => (
                    <tr key={st.id}>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {st.first_name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {st.last_name}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">{st.group_name}</td>
                      <td className="py-3.5 px-4 font-mono text-xs tabular-nums">{st.phone}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-amber-600">
                        {st.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* INSPECT ATTEMPT MODAL */}
      {inspectAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {inspectAttempt.student_name} — {inspectAttempt.test_title}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Ball: {inspectAttempt.score}/{inspectAttempt.max_score} ({inspectAttempt.percentage}
                  %) · Tab almashtirish: {inspectAttempt.tab_switch_count} marta
                </p>
              </div>
              <button
                onClick={() => setInspectAttempt(null)}
                className="p-1.5 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(inspectAttempt.answers_detail || []).map((ans, idx) => (
                <div
                  key={ans.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                    <span>
                      {idx + 1}. {ans.question_text}
                    </span>
                    <span className={ans.is_correct ? 'text-emerald-600' : 'text-red-600'}>
                      {ans.is_correct ? '✓ To‘g‘ri' : '✗ Noto‘g‘ri'}
                    </span>
                  </div>
                  <div>O‘quvchi javobi: {ans.answer_text}</div>
                  <div className="text-emerald-600">To‘g‘ri javob: {ans.correct_answer_text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 7. QUESTION DIFFICULTY STATISTICS (/admin/statistics)
// ============================================================================
export const AdminStatisticsPage: React.FC = () => {
  const { apiFetch } = useApp();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [stats, setStats] = useState<QuestionStat[]>([]);

  useEffect(() => {
    apiFetch<TestItem[]>('/api/admin/tests').then((ts) => {
      setTests(ts);
      if (ts.length > 0) setSelectedTestId(ts[0].id);
    });
  }, [apiFetch]);

  useEffect(() => {
    if (!selectedTestId) return;
    apiFetch<QuestionStat[]>(`/api/admin/tests/${selectedTestId}/question-stats`).then(setStats);
  }, [selectedTestId, apiFetch]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Savollar Statistikasi va Qiyinlik Tahlili
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Har bir savol bo‘yicha to‘g‘ri va noto‘g‘ri javoblar nisbati
          </p>
        </div>

        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
        >
          {tests.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* VISUAL BAR CHART OF QUESTION ACCURACY */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Savollar o‘zlashtirish grafigi (% to‘g‘ri javob)
        </h2>

        <div className="space-y-3">
          {stats.map((st) => (
            <div key={st.question_id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xl">
                  {st.order_index}-savol — {st.question_text}
                </span>
                <span className="font-mono font-bold tabular-nums">
                  {st.accuracy_percentage}% to‘g‘ri ({st.correct_answers}/{st.total_answers})
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    st.accuracy_percentage >= 75
                      ? 'bg-emerald-500'
                      : st.accuracy_percentage >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${st.accuracy_percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <th className="py-3.5 px-4 font-medium">Savol</th>
              <th className="py-3.5 px-4 font-medium text-right">Jami javoblar</th>
              <th className="py-3.5 px-4 font-medium text-right">To‘g‘ri javoblar</th>
              <th className="py-3.5 px-4 font-medium text-right">Noto‘g‘ri javoblar</th>
              <th className="py-3.5 px-4 font-medium text-right">To‘g‘ri javob foizi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {stats.map((st) => (
              <tr key={st.question_id}>
                <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                  {st.order_index}. {st.question_text}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums">{st.total_answers}</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-600 tabular-nums">
                  {st.correct_answers}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-red-600 tabular-nums">
                  {st.wrong_answers}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                  {st.accuracy_percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// 8. ADMIN TELEGRAM NOTIFICATIONS (/admin/telegram)
// ============================================================================
export const AdminTelegramPage: React.FC = () => {
  const { apiFetch, addToast } = useApp();
  const [info, setInfo] = useState<{
    configured: boolean;
    bot_username: string;
    teacher_chat_id: string;
    logs: TelegramNotificationLog[];
  } | null>(null);

  const loadInfo = useCallback(async () => {
    const res = await apiFetch('/api/admin/telegram');
    setInfo(res);
  }, [apiFetch]);

  useEffect(() => {
    loadInfo();
  }, [loadInfo]);

  const handleSendTest = async () => {
    await apiFetch('/api/admin/telegram/test', { method: 'POST' });
    addToast('Sinov xabari yuborildi va logga yozildi', 'success');
    loadInfo();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Telegram Bot va Bildirishnomalar
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Har bir test yakunlanganda o‘qituvchining Telegramiga avtomatik yuboriladigan hisobotlar
          </p>
        </div>

        <button
          onClick={handleSendTest}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 self-start"
        >
          <Send className="w-4 h-4" />
          <span>Sinov xabarini yuborish</span>
        </button>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-slate-500 block">Bot Username:</span>
          <strong className="font-mono text-sm text-slate-900 dark:text-white mt-0.5 block">
            @{info?.bot_username || 'BilimTestProBot'}
          </strong>
        </div>
        <div>
          <span className="text-slate-500 block">O‘qituvchi Chat ID:</span>
          <strong className="font-mono text-sm text-slate-900 dark:text-white mt-0.5 block">
            {info?.teacher_chat_id}
          </strong>
        </div>
        <div>
          <span className="text-slate-500 block">Server Token Holati:</span>
          <strong className="text-sm text-emerald-600 mt-0.5 block">
            {info?.configured
              ? 'TELEGRAM_BOT_TOKEN ulangan'
              : 'Server Log & Preview Simulator faol (.env orqali token qo‘shiladi)'}
          </strong>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Yuborilgan Telegram xabarlari tarixi
        </h2>
        {(info?.logs || []).map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Chat ID: {log.recipient_chat_id}</span>
              <span>{new Date(log.sent_at).toLocaleString('uz-UZ')}</span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {log.message}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 9. ADMIN SETTINGS & 500-USER LOAD TEST (/admin/settings)
// ============================================================================
export const AdminSettingsPage: React.FC = () => {
  const { apiFetch, addToast } = useApp();
  const [report, setReport] = useState<LoadTestReport | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunBenchmark = async () => {
    setRunning(true);
    try {
      const res = await apiFetch<LoadTestReport>('/api/admin/load-test-benchmark', {
        method: 'POST',
      });
      setReport(res);
      addToast('Benchmark muvaffaqiyatli yakunlandi', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Tizim Sozlamalari va 500-User Load Test
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Supabase RLS arxitekturasi va 500 ta virtual foydalanuvchi yuklama testi hisoboti
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              500 Virtual Foydalanuvchi Stress-Testi (k6 & Ichki Benchmark)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              500-user load testni tashqi load-testing muhitida ishga tushirish kerak:{' '}
              <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                k6 run load-tests/k6-500-users.js
              </code>
            </p>
          </div>
          <button
            onClick={handleRunBenchmark}
            disabled={running}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4" />
            <span>{running ? 'Tekshirilmoqda...' : 'Server Latency Benchmarkni ishga tushirish'}</span>
          </button>
        </div>

        {report && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              {report.note}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 font-sans block">Maqsadli VUs (k6)</span>
                <strong className="text-base">{report.virtual_users_requested} user</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 font-sans block">Ichki Parallel Sample</span>
                <strong className="text-base text-emerald-600">
                  {report.successful_requests} / {report.concurrent_requests_executed} OK
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 font-sans block">Average / P95 Latency</span>
                <strong className="text-base">
                  {report.avg_latency_ms}ms / {report.p95_latency_ms}ms
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 font-sans block">P99 Latency / Xatolar</span>
                <strong className="text-base">
                  {report.p99_latency_ms}ms / {report.failed_requests} xato
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Tayyorlangan Loyiha Fayllari
        </h2>
        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 font-mono">
          <li>• supabase/migrations/001_initial_schema.sql (13 ta jadval + Indekslar + RLS siyosatlari)</li>
          <li>• load-tests/k6-500-users.js (500 virtual user login, start, sync, submit skripti)</li>
          <li>• README.md (14 qadamli to‘liq o‘zbekcha o‘rnatish va ishga tushirish qo‘llanmasi)</li>
          <li>• .env.example (Supabase va Telegram Bot maxfiy kalitlari shabloni)</li>
        </ul>
      </div>
    </div>
  );
};
