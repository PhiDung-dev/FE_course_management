import { useState } from 'react';
import { BookOpen, Calendar, CreditCard, Star, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotify } from '../../contexts/NotificationContext';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import type { Enrollment, Course } from '../../types';

export default function StudentDashboard() {
  const { currentUser, users } = useAuth();
  const { courses, enrollments, schedules, payments, ratings, dispatch } = useData();
  const { addToast } = useToast();
  const { addNotification } = useNotify();

  const [confirmCancel, setConfirmCancel] = useState<{ enrollment: Enrollment; course: Course } | null>(null);

  const myEnrollments = enrollments.filter(e => e.studentId === currentUser?.id && e.status === 'active');
  const myCourseIds = myEnrollments.map(e => e.courseId);
  const myPayments = payments.filter(p => p.studentId === currentUser?.id && p.status === 'paid');
  const myRatings = ratings.filter(r => r.studentId === currentUser?.id);
  const totalPaid = myPayments.reduce((s, p) => s + p.amount, 0);

  const handleCancel = (enrollment: Enrollment, course: Course) => {
    setConfirmCancel({ enrollment, course });
  };

  const handleConfirmCancel = () => {
    if (!confirmCancel) return;
    dispatch({ type: 'UPDATE_ENROLLMENT', payload: { ...confirmCancel.enrollment, status: 'cancelled' } });
    addToast('success', 'Đã hủy đăng ký môn học.');
    addNotification('Hủy đăng ký', `Đã hủy môn ${confirmCancel.course.name}`, 'system', ['student'], currentUser!.id);
    setConfirmCancel(null);
  };

  // Lấy lịch học của các môn đã đăng ký
  const mySchedules = schedules.filter(s => myCourseIds.includes(s.courseId) && s.status === 'active');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Xin chào, {currentUser?.name}!</h1>
        <p className="text-gray-500 text-sm mt-1">Tiếp tục hành trình học tập của bạn</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Môn đang học" value={myEnrollments.length} icon={<BookOpen size={20} />} color="blue" />
        <StatCard label="Buổi học/tuần" value={mySchedules.length} icon={<Calendar size={20} />} color="emerald" />
        <StatCard label="Đã thanh toán" value={totalPaid >= 1000000 ? `${(totalPaid / 1_000_000).toFixed(1)}M` : totalPaid.toLocaleString('vi-VN')} icon={<CreditCard size={20} />} color="violet" sub="đồng" />
        <StatCard label="Đánh giá đã gửi" value={myRatings.length} icon={<Star size={20} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled courses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Môn học của tôi</h2>
            <Link to="/student/courses" className="text-xs text-blue-600 hover:underline">Thêm môn +</Link>
          </div>
          <div className="space-y-3">
            {myEnrollments.map(e => {
              const course = courses.find(c => c.id === e.courseId);
              const teacher = users.find(u => u.id === course?.teacherId);
              if (!course) return null;
              return (
                <div key={e.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Link to={`/student/course/${course.id}`} className="flex-shrink-0">
                    <img src={course.image} alt={course.name} className="w-10 h-10 rounded-lg object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/student/course/${course.id}`}>
                      <p className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate">{course.name}</p>
                    </Link>
                    <p className="text-xs text-gray-400">GV: {teacher?.name}</p>
                  </div>
                  <button
                    onClick={() => handleCancel(e, course)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hủy đăng ký"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              );
            })}
            {myEnrollments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Bạn chưa đăng ký môn học nào</p>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Lịch học tuần này</h2>
            <Link to="/student/schedule" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-2">
            {mySchedules.slice(0, 4).map(s => {
              const course = courses.find(c => c.id === s.courseId);
              const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {DAYS[s.dayOfWeek]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{course?.name}</p>
                    <p className="text-xs text-blue-600">{s.startTime} - {s.endTime}</p>
                  </div>
                </div>
              );
            })}
            {mySchedules.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Chưa có lịch học</p>}
          </div>
        </div>
      </div>

      <Modal isOpen={!!confirmCancel} onClose={() => setConfirmCancel(null)} title="Xác nhận hủy đăng ký" size="sm">
        <p className="text-sm text-gray-600">
          Bạn có chắc muốn hủy đăng ký môn <strong>{confirmCancel?.course.name}</strong> không?
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setConfirmCancel(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
          <button onClick={handleConfirmCancel} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium">Xác nhận</button>
        </div>
      </Modal>
    </div>
  );
}
