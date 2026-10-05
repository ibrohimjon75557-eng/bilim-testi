import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface AppContextValue {
  user: User | null;
  token: string | null;
  loadingAuth: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  path: string;
  navigate: (to: string) => void;
  setAuthSession: (token: string, user: User) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
  switchDemoRole: (role: 'admin' | 'student') => Promise<void>;
  apiFetch: <T = any>(url: string, options?: RequestInit) => Promise<T>;
  addToast: (message: string, type?: ToastItem['type']) => void;
  confirmAction: (options: ConfirmDialogOptions) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'bilimtest_session_token_v1';
const THEME_STORAGE_KEY = 'bilimtest_theme_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [path, setPath] = useState<string>(() => window.location.pathname || '/dashboard');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const confirmAction = useCallback((options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  }, []);

  const setAuthSession = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
    navigate('/login');
    addToast('Tizimdan chiqdingiz', 'info');
  }, [navigate, addToast]);

  const apiFetch = useCallback(
    async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
      const headers = new Headers(options.headers || {});
      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      const currentToken = token || localStorage.getItem(TOKEN_STORAGE_KEY);
      if (currentToken) {
        headers.set('Authorization', `Bearer ${currentToken}`);
      }

      const res = await fetch(url, {
        ...options,
        headers,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Xatolik yuz berdi. Qayta urinib ko‘ring.');
      }
      return data as T;
    },
    [token]
  );

  const refreshMe = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: User }>('/api/me');
      setUser(data.user);
    } catch {
      // Agar token yo'q bo'lsa yoki yaroqsiz bo'lsa, default student demo sessiyasini ochamiz
      try {
        const demo = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'student' }),
        }).then((r) => r.json());
        if (demo.token && demo.user) {
          setAuthSession(demo.token, demo.user);
        }
      } catch {}
    } finally {
      setLoadingAuth(false);
    }
  }, [apiFetch, setAuthSession]);

  useEffect(() => {
    refreshMe();
  }, []);

  const switchDemoRole = useCallback(
    async (role: 'admin' | 'student') => {
      try {
        const data = await apiFetch<{ token: string; user: User }>('/api/auth/demo-login', {
          method: 'POST',
          body: JSON.stringify({ role }),
        });
        setAuthSession(data.token, data.user);
        if (role === 'admin') {
          navigate('/admin');
          addToast('O‘qituvchi (Admin) rejimiga o‘tildi', 'info');
        } else {
          navigate('/dashboard');
          addToast(`O‘quvchi (${data.user.first_name}) rejimiga o‘tildi`, 'info');
        }
      } catch (err: any) {
        addToast(err.message || 'Rolni almashtirishda xatolik', 'error');
      }
    },
    [apiFetch, setAuthSession, navigate, addToast]
  );

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        loadingAuth,
        darkMode,
        toggleDarkMode,
        path,
        navigate,
        setAuthSession,
        logout,
        refreshMe,
        switchDemoRole,
        apiFetch,
        addToast,
        confirmAction,
      }}
    >
      {children}

      {/* TOAST NOTIFICATIONS */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-200 ${
              t.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : t.type === 'warning'
                ? 'bg-amber-500 text-white border-amber-600'
                : t.type === 'info'
                ? 'bg-slate-900 text-white border-slate-700 dark:bg-slate-800'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-white/80 hover:text-white text-xs px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {confirmDialog.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => setConfirmDialog(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={async () => {
                  setConfirmBusy(true);
                  try {
                    await confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  } finally {
                    setConfirmBusy(false);
                  }
                }}
                className={`min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
                  confirmDialog.danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmBusy ? 'Bajarilmoqda...' : confirmDialog.confirmLabel || 'Tasdiqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
