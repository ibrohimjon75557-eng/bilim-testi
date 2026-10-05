import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/Layout';
import { LoginPage, VerifyPage } from './pages/AuthPages';
import {
  StudentDashboardPage,
  StudentTestsListPage,
  StudentTestDetailPage,
  StudentTestRunnerPage,
  StudentTestResultPage,
  StudentProfileAndResultsPage,
} from './pages/StudentPages';
import {
  AdminDashboardPage,
  AdminStudentsPage,
  AdminGroupsPage,
  AdminBooksAndTopicsPage,
  AdminTestsPage,
  AdminResultsPage,
  AdminStatisticsPage,
  AdminTelegramPage,
  AdminSettingsPage,
} from './pages/AdminPages';

const RouterView: React.FC = () => {
  const { path, navigate } = useApp();
  const cleanPath = path.split('?')[0];

  if (cleanPath === '/login') return <LoginPage />;
  if (cleanPath === '/verify') return <VerifyPage />;
  if (cleanPath === '/' || cleanPath === '/dashboard') return <StudentDashboardPage />;
  if (cleanPath === '/tests') return <StudentTestsListPage />;

  // /tests/:id/start
  const startMatch = cleanPath.match(/^\/tests\/([^/]+)\/start$/);
  if (startMatch) {
    return <StudentTestRunnerPage testId={startMatch[1]} />;
  }

  // /tests/:id/result
  const resultMatch = cleanPath.match(/^\/tests\/([^/]+)\/result$/);
  if (resultMatch) {
    return <StudentTestResultPage testId={resultMatch[1]} />;
  }

  // /tests/:id
  const detailMatch = cleanPath.match(/^\/tests\/([^/]+)$/);
  if (detailMatch) {
    return <StudentTestDetailPage testId={detailMatch[1]} />;
  }

  if (cleanPath === '/profile' || cleanPath === '/results') {
    return <StudentProfileAndResultsPage />;
  }

  // Admin routes
  if (cleanPath === '/admin') return <AdminDashboardPage />;
  if (cleanPath === '/admin/students') return <AdminStudentsPage />;
  if (cleanPath === '/admin/groups') return <AdminGroupsPage />;
  if (cleanPath === '/admin/books') return <AdminBooksAndTopicsPage initialTab="books" />;
  if (cleanPath === '/admin/topics') return <AdminBooksAndTopicsPage initialTab="topics" />;
  if (cleanPath === '/admin/tests') return <AdminTestsPage />;
  if (cleanPath === '/admin/results') return <AdminResultsPage />;
  if (cleanPath === '/admin/statistics') return <AdminStatisticsPage />;
  if (cleanPath === '/admin/telegram') return <AdminTelegramPage />;
  if (cleanPath === '/admin/settings') return <AdminSettingsPage />;

  // 404 Sahifa
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
      <div className="text-5xl font-extrabold font-mono text-blue-600">404</div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Sahifa topilmadi
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Siz qidirayotgan manzil mavjud emas yoki boshqa joyga ko‘chirilgan.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold"
      >
        Asosiy sahifaga qaytish
      </button>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppLayout>
        <RouterView />
      </AppLayout>
    </AppProvider>
  );
}
