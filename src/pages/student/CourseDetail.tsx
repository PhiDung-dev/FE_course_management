import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Star, Calendar, MapPin, ShoppingCart, GraduationCap, BookOpen, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Badge from '../../components/Badge';

const levelMap: Record<string, { label: string; variant: 'green' | 'blue' | 'orange' }> = {
  beginner: { label: 'Cơ bản', variant: 'green' },
  intermediate: { label: 'Trung cấp', variant: 'blue' },
  advanced: { label: 'Nâng cao', variant: 'orange' },
};

const DAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, schedules, classrooms, enrollments, ratings, cart, dispatch } = useData();
  const { addToast } = useToast();

  const course = courses.find(c => c.id === id);
  if (!course) {
    return (
      <div className="text-center py-16 text-gray-400">
        <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
        <p>Không tìm thấy môn học.</p>
        <Link to="/student/courses" className="text-blue-600 text-sm mt-2 inline-block hover:underline">Quay lại</Link>
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
  const full = enrolledCount >= course.maxStudents;
  const alreadyEnrolled = currentUser && enrollments.some(e => e.studentId === currentUser.id && e.courseId === course.id && e.status === 'active');
  const inCart = currentUser && cart.some(item => item.courseId === course.id && item.studentId === currentUser.id);

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (alreadyEnrolled) {
      addToast('info', 'Bạn đã đăng ký môn học này rồi.');
      return;
    }
    if (full) {
      addToast('error', 'Môn học đã đầy, không thể thêm vào giỏ hàng.');
      return;
    }
    if (inCart) {
      addToast('info', 'Môn học này đã có trong giỏ hàng.');
      return;
    }
    await dispatch({ type: 'ADD_TO_CART', payload: { courseId: course.id, studentId: currentUser.id } });
    addToast('success', `Đã thêm "${course.name}" vào giỏ hàng!`);
  };

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative h-56">
          <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Badge variant={levelMap[course.level].variant}>{levelMap[course.level].label}</Badge>
            <Badge variant={course.status === 'active' ? 'green' : 'gray'}>{course.status === 'active' ? 'Đang mở' : 'Tạm dừng'}</Badge>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">{course.category}</p>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{course.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Clock size={14} />{course.duration} buổi</span>
                <span className="flex items-center gap-1"><Users size={14} />{enrolledCount}/{course.maxStudents} học viên</span>
                {avgStars && <span className="flex items-center gap-1 text-yellow-600"><Star size={14} />{avgStars}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-blue-600">{course.price.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-2">Mô tả môn học</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          {courseSchedules.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={16} /> Lịch học
              </h2>
              <div className="space-y-2">
                {courseSchedules.map(s => {
                  const room = classrooms.find(r => r.id === s.classroomId);
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-700 flex-shrink-0">
                        <span className="text-xs font-bold leading-none">{DAYS[s.dayOfWeek].slice(0, 2)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{s.startTime} - {s.endTime}</p>
                        <p className="text-xs text-gray-500">Từ {s.startDate} đến {s.endDate}</p>
                      </div>
                      {room && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
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

          {alreadyEnrolled && course.documents && course.documents.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={16} /> Tài liệu học tập
              </h2>
              <div className="space-y-2">
                {course.documents.map((doc, idx) => (
                  <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 hover:underline">{doc.title}</p>
                      <p className="text-xs text-gray-500">Nhấn để xem / tải xuống</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-3">
            {alreadyEnrolled ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl text-sm font-medium">
                <GraduationCap size={18} /> Đã đăng ký
              </div>
            ) : full ? (
              <div className="text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl text-sm font-medium">Môn học đã hết chỗ</div>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  inCart
                    ? 'bg-gray-100 text-gray-500 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <ShoppingCart size={16} />
                {inCart ? 'Đã có trong giỏ hàng' : 'Thêm vào giỏ hàng'}
              </button>
            )}
            <Link
              to="/student/courses"
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Xem danh sách môn học
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
