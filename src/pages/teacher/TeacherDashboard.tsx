import { BookOpen, Users, Calendar, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import StatCard from '../../components/StatCard';

export default function TeacherDashboard() {
  const { currentUser, users } = useAuth();
  const { courses, schedules, enrollments, ratings } = useData();

  // Lọc dữ liệu theo teacher hiện tại — useMemo không cần vì data nhỏ
  const myCourses = courses.filter(c => c.teacherId === currentUser?.id);
  const mySchedules = schedules.filter(s => s.teacherId === currentUser?.id && s.status === 'active');

  // Lấy tất cả học sinh trong các lớp của giáo viên
  const myCourseIds = myCourses.map(c => c.id);
  const myStudentIds = [...new Set(
    enrollments
      .filter(e => myCourseIds.includes(e.courseId) && e.status === 'active')
      .map(e => e.studentId)
  )];

  const avgStars = () => {
    const rs = ratings.filter(r => myCourseIds.includes(r.courseId));
    if (!rs.length) return '—';
    return (rs.reduce((s, r) => s + r.stars, 0) / rs.length).toFixed(1);
  };

  const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const now = new Date();
  const today = now.getDay();

  const upcomingSchedules = mySchedules.filter(s => {
    if (s.status !== 'active') return false;
    if (s.dayOfWeek !== today) return false;
    const [h, m] = s.startTime.split(':').map(Number);
    const sTime = new Date();
    sTime.setHours(h, m, 0, 0);
    const diffMin = (sTime.getTime() - now.getTime()) / 60000;
    return diffMin > 0 && diffMin <= 30;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Xin chào, {currentUser?.name}!</h1>
        <p className="text-gray-500 text-sm mt-1">Đây là tổng quan giảng dạy của bạn</p>
      </div>

      {upcomingSchedules.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="font-semibold text-amber-800 mb-2">Sắp đến giờ dạy</p>
          <div className="space-y-1">
            {upcomingSchedules.map(s => {
              const course = courses.find(c => c.id === s.courseId);
              return (
                <p key={s.id} className="text-sm text-amber-700">
                  {course?.name} lúc {s.startTime}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Môn đang dạy" value={myCourses.length} icon={<BookOpen size={20} />} color="blue" />
        <StatCard label="Học sinh" value={myStudentIds.length} icon={<Users size={20} />} color="emerald" />
        <StatCard label="Lịch học" value={mySchedules.length} icon={<Calendar size={20} />} color="violet" />
        <StatCard label="Đánh giá TB" value={avgStars()} icon={<Star size={20} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My courses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Môn học của tôi</h2>
          <div className="space-y-3">
            {myCourses.map(c => {
              const count = enrollments.filter(e => e.courseId === c.id && e.status === 'active' && users.some(u => u.id === e.studentId)).length;
              return (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <img src={c.image} alt={c.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{count} học sinh · {c.duration} buổi</p>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">{c.price.toLocaleString('vi-VN')}đ</span>
                </div>
              );
            })}
            {myCourses.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Chưa có môn học nào</p>}
          </div>
        </div>

        {/* Upcoming schedules */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Lịch dạy sắp tới</h2>
          <div className="space-y-3">
            {mySchedules.map(s => {
              const course = courses.find(c => c.id === s.courseId);
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                    <span className="text-xs font-bold leading-none">{DAYS[s.dayOfWeek]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{course?.name}</p>
                    <p className="text-xs text-blue-600">{s.startTime} - {s.endTime}</p>
                  </div>
                </div>
              );
            })}
            {mySchedules.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Chưa có lịch dạy</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
