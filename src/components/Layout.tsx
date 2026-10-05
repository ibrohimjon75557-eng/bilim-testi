import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Award,
  User as UserIcon,
  Users,
  Layers,
  BookOpen,
  Tag,
  BarChart3,
  Send,
  Settings,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Download,
  WifiOff,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall, useOnlineStatus } from '../utils/pwa';

export const PWAInstallControl: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="min-h-[40px] px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Ilovani o‘rnatish</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>iPhone’ga o‘rnatish</span>
        </button>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                iPhone / iPad qurilmaga o‘rnatish
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                1. Safari pastki panelidagi <strong>Ulashish (Share)</strong> tugmasini bosing.
                <br />
                2. Ro‘yxatdan <strong>Asosiy ekranga qo‘shish (Add to Home Screen)</strong> bandini tanlang.
              </p>
              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-4 w-full min-h-[44px] rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-sm font-medium"
              >
                Tushunarli
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, darkMode, toggleDarkMode, path, navigate, logout, switchDemoRole } = useApp();
  const isOnline = useOnlineStatus();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Test ishlash jarayonida chalg'ituvchi navigatsiyani yashiramiz
  const isTakingTest = /^\/tests\/[^/]+\/start$/.test(path);
  const isAuthPage = path === '/login' || path === '/verify';

  if (isTakingTest || isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {!isOnline && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs font-medium flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Internet aloqasi uzildi. Javoblaringiz qurilmada xavfsiz saqlanmoqda.</span>
          </div>
        )}
        {children}
      </div>
    );
  }

  const isAdminView = path.startsWith('/admin');

  const adminNavItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'O‘quvchilar', href: '/admin/students', icon: Users },
    { label: 'Guruhlar', href: '/admin/groups', icon: Layers },
    { label: 'Kitoblar', href: '/admin/books', icon: BookOpen },
    { label: 'Mavzular', href: '/admin/topics', icon: Tag },
    { label: 'Testlar', href: '/admin/tests', icon: FileText },
    { label: 'Natijalar', href: '/admin/results', icon: Award },
    { label: 'Statistika', href: '/admin/statistics', icon: BarChart3 },
    { label: 'Telegram', href: '/admin/telegram', icon: Send },
    { label: 'Sozlamalar', href: '/admin/settings', icon: Settings },
  ];

  const studentNavItems = [
    { label: 'Asosiy', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Testlar', href: '/tests', icon: FileText },
    { label: 'Natijalarim', href: '/results', icon: Award },
    { label: 'Profil', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* OFFLINE BANNER */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Internet aloqasi mavjud emas. Keshdagi ma’lumotlar ko‘rsatilmoqda.</span>
        </div>
      )}

      {/* TOP BAR CONTRACT (3 ZONES: Brand | Nav Links | Actions) */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3">
          {isAdminView && (
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Menyuni ochish"
              className="lg:hidden min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => navigate(isAdminView ? '/admin' : '/dashboard')}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
          >
            BilimTest Pro
          </button>
        </div>

        {/* Zone 2: Primary Navigation Links (Student Mode Desktop) */}
        {!isAdminView ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            {studentNavItems.map((item) => {
              const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`py-1 transition-colors whitespace-nowrap ${
                    active
                      ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>O‘qituvchi boshqaruv paneli</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {adminNavItems.find((i) => i.href === path)?.label || 'Boshqaruv'}
            </span>
          </div>
        )}

        {/* Zone 3: Primary Actions (Role Switcher, PWA Install, Theme, Profile/Logout) */}
        <div className="flex items-center gap-2">
          {/* Interactive Role Switcher for Testing Student & Teacher Flows */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => switchDemoRole('student')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                !isAdminView
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>O‘quvchi</span>
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                isAdminView
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          <PWAInstallControl />

          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Yorug‘ rejim' : 'Tungi rejim'}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => navigate('/login')}
            title="Kirish / Akkauntni almashtirish"
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>{user ? `${user.first_name}` : 'Kirish'}</span>
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* BODY WORKSPACE */}
      <div className="flex-1 flex">
        {/* ADMIN DESKTOP SIDEBAR */}
        {isAdminView && (
          <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 justify-between">
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === '/admin' ? path === '/admin' : path.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'Sardorbek Usmonov'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {user?.phone || '+998 90 123 45 67'}
                </p>
              </div>
              <button
                onClick={logout}
                className="mt-1 w-full min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Tizimdan chiqish</span>
              </button>
            </div>
          </aside>
        )}

        {/* ADMIN MOBILE SLIDE-OUT DRAWER */}
        {isAdminView && mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between z-10 shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-base text-slate-900 dark:text-white">
                    Admin Menyu
                  </span>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.href === '/admin' ? path === '/admin' : path.startsWith(item.href);
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          navigate(item.href);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  logout();
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        )}

        {/* MAIN VIEWPORT CONTENT */}
        <main className="flex-1 min-w-0 pb-20 md:pb-10">{children}</main>
      </div>

      {/* MOBILE BOTTOM TAB BAR (STUDENT MODE) */}
      {!isAdminView && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 items-center px-2">
          {studentNavItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/dashboard'
                ? path === '/dashboard' || path === '/'
                : path.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] mt-1 tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
