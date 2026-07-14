import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Star, Calendar, MapPin, GraduationCap, BookOpen, User, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Badge from '../components/Badge';

const levelMap: Record<string, { label: string; variant: 'green' | 'blue' | 'orange' }> = {
  beginner: { label: 'Cơ bản', variant: 'green' },
  intermediate: { label: 'Trung cấp', variant: 'blue' },
  advanced: { label: 'Nâng cao', variant: 'orange' },
};

const DAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function PublicCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { courses, schedules, classrooms, enrollments, ratings } = useData();
  const { currentUser, users } = useAuth();

  const course = courses.find(c => c.id === id);
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-3">Không tìm thấy môn học.</p>
          <Link to="/courses" className="text-blue-600 text-sm hover:underline">← Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  const courseSchedules = schedules.filter(s => s.courseId === course.id && s.status === 'active');
  const avgStars = (() => {
    const rs = ratings.filter(r => r.courseId === course.id);
    if (!rs.length) return null;
    return (rs.reduce((s, r) => s + r.stars, 0) / rs.length).toFixed(1);
  })();
  const enrolledCount = enrollments.filter(e => e.courseId === course.id && e.status === 'active').length;
  const teacher = users.find(u => u.id === course.teacherId);

  const renderStars = (rating: number | string) => {
    const num = Number(rating);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={star <= num ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
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

      {/* Back button & breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight size={12} />
          <Link to="/courses" className="hover:text-blue-600">Khóa học</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">{course.name}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          {/* Image banner */}
          <div className="relative h-72 md:h-96">
            <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 flex gap-2">
              <Badge variant={levelMap[course.level].variant}>{levelMap[course.level].label}</Badge>
              <Badge variant={course.status === 'active' ? 'green' : 'gray'}>{course.status === 'active' ? 'Đang mở' : 'Tạm dừng'}</Badge>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Title & meta */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div className="flex-1">
                <p className="text-xs text-blue-600 font-medium mb-1">{course.category}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{course.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Clock size={15} />{course.duration} buổi</span>
                  <span className="flex items-center gap-1.5"><Users size={15} />{enrolledCount}/{course.maxStudents} học viên</span>
                  {avgStars && (
                    <div className="flex items-center gap-1.5">
                      {renderStars(avgStars)}
                      <span className="text-yellow-600 font-medium">{avgStars}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start lg:items-end gap-3">
                <span className="text-3xl md:text-4xl font-bold text-blue-600">{course.price.toLocaleString('vi-VN')}đ</span>
                {currentUser ? (
                  <Link
                    to="/student/courses"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                  >
                    Đăng ký ngay
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                  >
                    Đăng ký ngay
                  </Link>
                )}
              </div>
            </div>

            {/* Teacher info */}
            {teacher && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Giáo viên</p>
                  <p className="text-sm font-semibold text-gray-800">{teacher.name}</p>
                  <p className="text-xs text-gray-400">{teacher.email}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="font-semibold text-gray-800 mb-3 text-lg">Mô tả môn học</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
            </div>

            {/* Schedules */}
            {courseSchedules.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                  <Calendar size={18} /> Lịch học
                </h2>
                <div className="space-y-3">
                  {courseSchedules.map(s => {
                    const room = classrooms.find(r => r.id === s.classroomId);
                    return (
                      <div key={s.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-700 flex-shrink-0">
                          <span className="text-lg font-bold leading-none">{DAYS[s.dayOfWeek].slice(0, 2)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{s.startTime} - {s.endTime}</p>
                          <p className="text-xs text-gray-500">
                            <Calendar size={11} className="inline mr-1" />
                            {s.startDate} → {s.endDate}
                          </p>
                        </div>
                        {room && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg">
                            <MapPin size={12} />
                            {room.name} ({room.location})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-3">
              {currentUser ? (
                <Link
                  to="/student/courses"
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md shadow-blue-200"
                >
                  <GraduationCap size={18} /> Đăng ký ngay
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md shadow-blue-200"
                >
                  <GraduationCap size={18} /> Đăng ký ngay
                </Link>
              )}
              <Link
                to="/courses"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Xem danh sách khóa học
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-6 border-t border-gray-200">
          <p className="mb-2">
            <span className="font-semibold text-gray-500">Liên hệ Admin:</span> admin@gmail.com | 0123.456.789
          </p>
          <p>© {new Date().getFullYear()} EduHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
