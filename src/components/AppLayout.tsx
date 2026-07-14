import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const roleLabel: Record<string, string> = {
  admin: 'Quản trị viên',
  teacher: 'Giáo viên',
  student: 'Học sinh',
};

export default function AppLayout() {
  const { currentUser } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 flex-shrink-0">

          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="flex items-center gap-2.5">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {currentUser?.name[0]}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800 leading-tight">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{roleLabel[currentUser?.role ?? '']}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
