import { useState } from 'react';
import { BookOpen, Users, Star, Clock, Eye, FileText, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const levelMap = {
  beginner: { label: 'Cơ bản', variant: 'green' as const },
  intermediate: { label: 'Trung cấp', variant: 'blue' as const },
  advanced: { label: 'Nâng cao', variant: 'orange' as const },
};

export default function TeacherCourses() {
  const { currentUser, users } = useAuth();
  const { courses, classrooms, schedules, enrollments, ratings } = useData();

  const myCourses = courses.filter(c => c.teacherId === currentUser?.id);
  const [detailCourse, setDetailCourse] = useState<typeof myCourses[0] | null>(null);
  const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Môn học đang dạy</h1>
        <p className="text-gray-500 text-sm mt-1">{myCourses.length} môn học</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {myCourses.map(c => {
          const count = enrollments.filter(e => e.courseId === c.id && e.status === 'active' && users.some(u => u.id === e.studentId)).length;
          const rs = ratings.filter(r => r.courseId === c.id);
          const avg = rs.length ? (rs.reduce((s, r) => s + r.stars, 0) / rs.length).toFixed(1) : null;

          return (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-40">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <Badge variant={levelMap[c.level].variant}>{levelMap[c.level].label}</Badge>
                  <Badge variant={c.status === 'active' ? 'green' : 'gray'}>{c.status === 'active' ? 'Đang mở' : 'Tạm dừng'}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{c.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{c.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users size={12} />{count}/{c.maxStudents} học sinh</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{c.duration} buổi</span>
                  {avg && <span className="flex items-center gap-1 text-yellow-600"><Star size={12} />{avg} ({rs.length})</span>}
                </div>
                {/* Progress bar — số học sinh / tối đa */}
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min((count / c.maxStudents) * 100, 100)}%` }}
                  />
                </div>
                <button
                  onClick={() => setDetailCourse(c)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-medium"
                >
                  <Eye size={14} /> Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
        {myCourses.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>Bạn chưa được phân công môn học nào.</p>
          </div>
        )}
      </div>

      <Modal isOpen={!!detailCourse} onClose={() => setDetailCourse(null)} title="Chi tiết môn học" size="lg">
        {detailCourse && (() => {
          const teacher = users.find(u => u.id === detailCourse.teacherId);
          const courseSchedules = schedules.filter(s => s.courseId === detailCourse.id && s.status === 'active');
          return (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{detailCourse.name}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{detailCourse.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Giáo viên:</span>
                  <span className="font-medium text-gray-800 ml-1">{teacher?.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Học phí:</span>
                  <span className="font-medium text-blue-600 ml-1">{detailCourse.price.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Lịch học</h4>
                <div className="space-y-2">
                  {courseSchedules.map(s => {
                    const room = classrooms.find(r => r.id === s.classroomId);
                    return (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                        <span className="text-gray-800 font-medium">
                          {DAYS[s.dayOfWeek]}, {s.startTime} - {s.endTime}
                        </span>
                        <span className="text-gray-500">
                          {room?.name} — Kết thúc: {s.endDate}
                        </span>
                      </div>
                    );
                  })}
                  {courseSchedules.length === 0 && (
                    <p className="text-sm text-gray-400">Chưa có lịch học</p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
