import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, Check, Eye, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotify } from '../../contexts/NotificationContext';
import Badge from '../../components/Badge';

const levelMap: Record<string, { label: string; variant: 'green' | 'blue' | 'orange' }> = {
  beginner: { label: 'Cơ bản', variant: 'green' },
  intermediate: { label: 'Trung cấp', variant: 'blue' },
  advanced: { label: 'Nâng cao', variant: 'orange' },
};

export default function StudentBuyCourses() {
  const { currentUser } = useAuth();
  const { courses, enrollments, cart, dispatch } = useData();
  const { addToast } = useToast();
  const { addNotification } = useNotify();
  const navigate = useNavigate();

  const myEnrollments = enrollments.filter(e => e.studentId === currentUser?.id);

  const isEnrolled = (courseId: string) =>
    myEnrollments.some(e => e.courseId === courseId && e.status === 'active');

  const isInCart = (courseId: string) =>
    currentUser && cart.some(item => item.courseId === courseId && item.studentId === currentUser.id);

  const handleRegister = async (courseId: string) => {
    if (!currentUser) return;
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    if (isEnrolled(courseId)) {
      addToast('info', 'Bạn đã đăng ký môn học này rồi.');
      return;
    }
    const count = enrollments.filter(e => e.courseId === courseId && e.status === 'active').length;
    if (count >= course.maxStudents) {
      addToast('error', 'Môn học đã hết chỗ.');
      return;
    }
    if (isInCart(courseId)) {
      navigate('/student/cart');
      return;
    }
    try {
      await dispatch({ type: 'ADD_TO_CART', payload: { courseId, studentId: currentUser.id } });
      addNotification('Chuyển đến giỏ hàng', `Đã thêm "${course?.name}" vào giỏ hàng để thanh toán`, 'cart', ['student'], currentUser.id);
      addToast('success', `Đã thêm "${course?.name}" vào giỏ hàng!`);
      navigate('/student/cart');
    } catch {
      addToast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Đăng ký môn học</h1>
        <p className="text-gray-500 text-sm mt-1">Tìm và đăng ký các khóa học phù hợp</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.filter(c => c.status === 'active').map(c => {
          const enrolled = isEnrolled(c.id);
          const inCart = isInCart(c.id);
          const count = enrollments.filter(e => e.courseId === c.id && e.status === 'active').length;
          const full = count >= c.maxStudents;

          return (
            <div key={c.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${enrolled ? 'border-blue-200' : 'border-gray-100'}`}>
              <Link to={`/student/course/${c.id}`}>
                <div className="relative h-40 overflow-hidden">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={levelMap[c.level].variant}>{levelMap[c.level].label}</Badge>
                  </div>
                  {enrolled && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                      <Check size={12} />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/student/course/${c.id}`}>
                  <p className="text-xs text-blue-600 font-medium mb-1">{c.category}</p>
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">{c.name}</h3>
                </Link>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{c.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div>
                    <span className="text-blue-600 font-bold text-sm">{c.price.toLocaleString('vi-VN')}đ</span>
                    <p className="text-xs text-gray-400">{count}/{c.maxStudents} học viên</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Link
                      to={`/student/course/${c.id}`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={14} />
                    </Link>
                    {enrolled ? (
                      <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg font-medium">
                        <GraduationCap size={12} /> Đã học
                      </span>
                    ) : full ? (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-lg">Hết chỗ</span>
                    ) : inCart ? (
                      <Link
                        to="/student/cart"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart size={12} /> Trong giỏ
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleRegister(c.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <ShoppingCart size={12} /> Đăng ký
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {courses.filter(c => c.status === 'active').length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>Không có môn học nào.</p>
        </div>
      )}
    </div>
  );
}
