import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen, Calendar, Users, User, Building2, CreditCard,
  GraduationCap, LayoutDashboard, LogOut, Star, ShoppingCart,
  ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

// Mỗi role có danh sách menu riêng — dùng object thay if/else để dễ mở rộng
const navByRole: Record<string, NavItem[]> = {
  admin: [
    { label: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Môn học', path: '/admin/courses', icon: <BookOpen size={18} /> },
    { label: 'Lịch học', path: '/admin/schedules', icon: <Calendar size={18} /> },
    { label: 'Học sinh', path: '/admin/students', icon: <GraduationCap size={18} /> },
    { label: 'Giáo viên', path: '/admin/teachers', icon: <Users size={18} /> },
    { label: 'Phòng học', path: '/admin/classrooms', icon: <Building2 size={18} /> },
    { label: 'Thanh toán', path: '/admin/payments', icon: <CreditCard size={18} /> },
  ],
  teacher: [
    { label: 'Tổng quan', path: '/teacher', icon: <LayoutDashboard size={18} /> },
    { label: 'Học sinh trong lớp', path: '/teacher/students', icon: <Users size={18} /> },
    { label: 'Môn học đang dạy', path: '/teacher/courses', icon: <BookOpen size={18} /> },
    { label: 'Lịch cá nhân', path: '/teacher/schedule', icon: <Calendar size={18} /> },
    { label: 'Nhập điểm', path: '/teacher/points', icon: <TrendingUp size={18} /> },
    { label: 'Quản lý Tài liệu', path: '/teacher/documents', icon: <BookOpen size={18} /> },
  ],
  student: [
    { label: 'Tổng quan', path: '/student', icon: <LayoutDashboard size={18} /> },
    { label: 'Lịch cá nhân', path: '/student/schedule', icon: <Calendar size={18} /> },
    { label: 'Đăng ký môn học', path: '/student/courses', icon: <BookOpen size={18} /> },
    { label: 'Giỏ hàng', path: '/student/cart', icon: <ShoppingCart size={18} /> },
    { label: 'Kết quả học tập', path: '/student/results', icon: <TrendingUp size={18} /> },
    { label: 'Tài liệu học tập', path: '/student/documents', icon: <BookOpen size={18} /> },
    { label: 'Đánh giá môn học', path: '/student/ratings', icon: <Star size={18} /> },
  ],
};

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const items = currentUser ? (navByRole[currentUser.role] ?? []) : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        relative flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-700/50 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={18} className="text-white" />
        </div>
        {!collapsed && <span className="font-bold text-lg tracking-tight">EduHub</span>}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin' || item.path === '/teacher' || item.path === '/student'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 transition-colors text-sm
               ${isActive
                 ? 'bg-blue-600 text-white'
                 : 'text-gray-400 hover:bg-gray-800 hover:text-white'
               }`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Profile + shared links */}
      <div className="border-t border-gray-700/50 py-3">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 transition-colors text-sm
             ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
          }
          title={collapsed ? 'Hồ sơ' : undefined}
        >
          <User size={18} className="flex-shrink-0" />
          {!collapsed && <span>Hồ sơ cá nhân</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300"
          style={{ width: 'calc(100% - 16px)' }}
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>

      {/* Collapse toggle button — positioned on the right edge */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
