import React, { useState, useEffect } from 'react';
import { Send, ShieldCheck, GraduationCap, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';

export function formatUzbekPhone(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (!digits.startsWith('998')) {
    if (digits.startsWith('8')) digits = '998' + digits.slice(1);
    else digits = '998' + digits;
  }
  digits = digits.slice(0, 12);

  let out = '+998';
  if (digits.length > 3) out += ' ' + digits.slice(3, 5);
  if (digits.length > 5) out += ' ' + digits.slice(5, 8);
  if (digits.length > 8) out += ' ' + digits.slice(8, 10);
  if (digits.length > 10) out += ' ' + digits.slice(10, 12);
  return out;
}

const PENDING_AUTH_KEY = 'bilimtest_pending_verify_v1';

export const LoginPage: React.FC = () => {
  const { navigate, apiFetch, addToast, switchDemoRole } = useApp();
  const [firstName, setFirstName] = useState('Ali');
  const [lastName, setLastName] = useState('Valiyev');
  const [phone, setPhone] = useState('+998 90 987 65 43');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<{
        message: string;
        phone: string;
        expires_in_seconds: number;
        bot_username: string;
        bot_simulator_code: string;
      }>('/api/auth/request-code', {
        method: 'POST',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
        }),
      });

      sessionStorage.setItem(
        PENDING_AUTH_KEY,
        JSON.stringify({
          phone: res.phone,
          remember_me: rememberMe,
          bot_username: res.bot_username,
          bot_simulator_code: res.bot_simulator_code,
          expires_at: Date.now() + res.expires_in_seconds * 1000,
        })
      );

      addToast('Telegram tasdiqlash kodi yaratildi', 'info');
      navigate('/verify');
    } catch (err: any) {
      addToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              BilimTest Pro
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Telegram orqali xavfsiz kirish va ro‘yxatdan o‘tish
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Asosiyga qaytish
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Ism
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Masalan: Ali"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Familiya
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Masalan: Valiyev"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Telefon raqami (+998 XX XXX XX XX)
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(formatUzbekPhone(e.target.value))}
              placeholder="+998 90 123 45 67"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              30 kun davomida meni eslab qolish
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Kod yaratilmoqda...' : 'Telegram orqali kod olish'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* TEZKOR DEMO KIRISH TUGMALARI */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Platformani 1-klikda tezkor sinab ko‘rish (Demo hisoblar):
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => switchDemoRole('student')}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>O‘quvchi kirish</span>
            </button>
            <button
              type="button"
              onClick={() => switchDemoRole('admin')}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin kirish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VerifyPage: React.FC = () => {
  const { navigate, apiFetch, setAuthSession, addToast } = useApp();
  const [pendingData, setPendingData] = useState<{
    phone: string;
    remember_me: boolean;
    bot_username: string;
    bot_simulator_code: string;
    expires_at: number;
  } | null>(null);
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPendingData(parsed);
        if (parsed.bot_simulator_code) {
          setCode(parsed.bot_simulator_code);
        }
      } else {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!pendingData) return;
    const timer = setInterval(() => {
      const rem = Math.max(0, Math.floor((pendingData.expires_at - Date.now()) / 1000));
      setSecondsLeft(rem);
    }, 1000);
    return () => clearInterval(timer);
  }, [pendingData]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingData) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({
          phone: pendingData.phone,
          code,
          remember_me: pendingData.remember_me,
        }),
      });
      setAuthSession(res.token, res.user);
      sessionStorage.removeItem(PENDING_AUTH_KEY);
      addToast('Akkaunt muvaffaqiyatli tasdiqlandi!', 'success');
      navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      addToast(err.message || 'Tasdiqlash kodi noto‘g‘ri', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Telegram orqali tasdiqlash
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
          Telegram botga kiring va tasdiqlash kodini oling.
        </p>

        {/* TELEGRAM BOT /START PREVIEW CARD */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Telegram Bot: @{pendingData?.bot_username || 'BilimTestProBot'}</span>
            <span className="font-mono flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="text-slate-500">Siz: /start</div>
            <div className="text-slate-800 dark:text-slate-200">
              🤖 <strong>BilimTest Bot:</strong> Sizning bir martalik tasdiqlash kodingiz:{' '}
              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 select-all">
                {pendingData?.bot_simulator_code || '------'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              (Kod database'da SHA-256 hash ko‘rinishida saqlanadi va 1 marta ishlaydi)
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              6 xonali tasdiqlash kodi ({pendingData?.phone})
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-xl font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading || secondsLeft === 0}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Tekshirilmoqda...' : 'Kodni tasdiqlash va kirish'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full min-h-[42px] text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            ← Telefon raqamni o‘zgartirish
          </button>
        </form>
      </div>
    </div>
  );
};
