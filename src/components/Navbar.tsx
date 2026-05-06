import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export function Navbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-gray-900 font-medium">
          {user?.realName || user?.username}
        </span>
        <span className="text-sm text-gray-500">
          {user?.role === 'SUPER_ADMIN' ? '超级管理员' : '普通运营'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
