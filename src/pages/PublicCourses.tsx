import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, GraduationCap, Search, Filter, User, Calendar } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Badge from '../components/Badge';

const levelMap = {
  beginner: { label: 'Cơ bản', variant: 'green' as const },
  intermediate: { label: 'Trung cấp', variant: 'blue' as const },
  advanced: { label: 'Nâng cao', variant: 'orange' as const },
};

export default function PublicCourses() {
  const { courses, ratings, enrollments, schedules } = useData();
  const { currentUser, users } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const activeCourses = courses.filter(c => c.status === 'active');
  const categories = [...new Set(activeCourses.map(c => c.category))];

  const filtered = activeCourses.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || c.category === category;
    return matchSearch && matchCat;
  });

  const avgRating = (courseId: string) => {
    const rs = ratings.filter(r => r.courseId === courseId);
    if (!rs.length) return null;
    return (rs.reduce((sum, r) => sum + r.stars, 0) / rs.length).toFixed(1);
  };

  const enrolledCount = (courseId: string) =>
    enrollments.filter(e => e.courseId === courseId && e.status === 'active').length;

  const getScheduleInfo = (courseId: string) => {
    const s = schedules.find(sc => sc.courseId === courseId && sc.status === 'active');
    if (!s) return null;
    return { startDate: s.startDate, endDate: s.endDate };
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher ? teacher.name : 'Chưa có';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">EduHub</span>
          </Link>
          <div className="flex items-center gap-6">
            {currentUser ? (
              <Link to={`/${currentUser.role}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Vào bảng điều khiển
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-2">Đăng nhập</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">EduHub — Hệ thống quản lý khóa học tiếng Anh </h1>
          <p className="text-blue-200 text-lg mb-8">Nâng cao trình độ tiếng Anh với giáo viên chuyên nghiệp</p>
          <div className="flex items-center gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-8">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">Lọc theo danh mục:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => {
            const avg = avgRating(course.id);
            const count = enrolledCount(course.id);
            const scheduleInfo = getScheduleInfo(course.id);
            const teacherName = getTeacherName(course.teacherId);
            return (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 group">
                <Link to={`/courses/${course.id}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge variant={levelMap[course.level].variant}>{levelMap[course.level].label}</Badge>
                    </div>
                  </div>
                </Link>
                <div className="p-5">
                  <p className="text-xs text-blue-600 font-medium mb-1">{course.category}</p>
                  <Link to={`/courses/${course.id}`}>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{course.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <User size={12} />
                    <span>{teacherName}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Clock size={12} />{course.duration} buổi</span>
                    <span className="flex items-center gap-1"><Users size={12} />{count}/{course.maxStudents}</span>
                    {avg && <span className="flex items-center gap-1 text-yellow-600"><Star size={12} />{avg}</span>}
                  </div>
                  {scheduleInfo && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                      <Calendar size={12} />
                      <span>{scheduleInfo.startDate} → {scheduleInfo.endDate}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-blue-600 font-bold text-lg">
                      {course.price.toLocaleString('vi-VN')}đ
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/courses/${course.id}`}
                        className="text-gray-500 hover:text-blue-600 text-xs font-medium transition-colors"
                      >
                        Chi tiết
                      </Link>
                      <Link
                        to={`/courses/${course.id}`}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Đăng ký học
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>Không tìm thấy khóa học phù hợp.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-600" />
            <span className="font-bold text-gray-800">EduHub</span>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">Liên hệ Admin:</span> admin@gmail.com | 0123.456.789
          </div>
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} EduHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
