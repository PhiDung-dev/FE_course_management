import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart as CartIcon, Trash2, CreditCard, CheckCircle, QrCode, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotify } from '../../contexts/NotificationContext';
import * as api from '../../services/api';
import Modal from '../../components/Modal';

export default function ShoppingCartPage() {
  const { currentUser } = useAuth();
  const { courses, schedules, cart, dispatch, refreshAll } = useData();
  const { addToast } = useToast();
  const { addNotification } = useNotify();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [qrPhase, setQrPhase] = useState<'confirm' | 'qr' | 'done'>('confirm');
  const [countdown, setCountdown] = useState(8);

  const myCart = cart.filter(item => item.studentId === currentUser?.id);
  const cartCourses = myCart.map(item => courses.find(c => c.id === item.courseId)).filter(Boolean);
  const total = cartCourses.reduce((sum, c) => sum + c!.price, 0);

  useEffect(() => {
    if (qrPhase !== 'qr') return;
    if (countdown <= 0) {
      setQrPhase('done');
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [qrPhase, countdown]);

  const handleRemove = async (courseId: string) => {
    if (!currentUser) return;
    try {
      await dispatch({ type: 'REMOVE_FROM_CART', payload: { courseId, studentId: currentUser.id } });
      addToast('info', 'Đã xoá khỏi giỏ hàng.');
    } catch {
      addToast('error', 'Có lỗi khi xoá, vui lòng thử lại.');
    }
  };

  const handleStartPayment = () => {
    setQrPhase('qr');
    setCountdown(8);
  };

  const handleCompletePayment = async () => {
    if (!currentUser) return;
    let successCount = 0;
    for (const item of myCart) {
      const course = courses.find(c => c.id === item.courseId);
      if (!course) continue;
      
      const schedule = schedules.find(s => s.courseId === course.id && s.status === 'active');
      if (!schedule) {
        addToast('error', `Khóa học ${course.name} chưa có lịch học.`);
        continue;
      }
      
      try {
        const booking = await api.createBooking({
          description: `Đăng ký khóa học ${course.name}`,
          scheduleId: schedule.id,
          userId: currentUser.id
        });
        
        const paymentRes = await api.createPayment({ bookingId: booking.id }) as { id: string };
        await api.updatePaymentStatus(paymentRes.id, 'SUCCESS');
        
        await dispatch({ type: 'REMOVE_FROM_CART', payload: { courseId: course.id, studentId: currentUser.id } });
        successCount++;
      } catch (err) {
        const e = err as { message?: string };
        addToast('error', `Lỗi đăng ký ${course.name}: ${e.message || 'Thất bại'}`);
      }
    }
    if (successCount > 0) {
      addToast('success', `Thanh toán thành công ${successCount} môn học!`);
      addNotification('Thanh toán', `Đã thanh toán thành công ${successCount} môn học`, 'payment', ['student'], currentUser.id);
      setCheckoutOpen(false);
      setQrPhase('confirm');
      if (refreshAll) {
        await refreshAll();
      }
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng</h1>
        <p className="text-gray-500 text-sm mt-1">{cartCourses.length} môn học chờ đăng ký</p>
      </div>

      {cartCourses.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <CartIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p>Giỏ hàng trống.</p>
          <Link to="/student/courses" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
            Xem danh sách môn học
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {cartCourses.map(c => (
              <div key={c!.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                <img src={c!.image} alt={c!.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/student/course/${c!.id}`} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
                    {c!.name}
                  </Link>
                  <p className="text-xs text-gray-400">{c!.duration} buổi · {c!.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-blue-600">{c!.price.toLocaleString('vi-VN')}đ</p>
                  <button
                    onClick={() => handleRemove(c!.id)}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 mt-1"
                  >
                    <Trash2 size={12} /> Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Tạm tính ({cartCourses.length} môn)</span>
              <span className="text-xl font-bold text-gray-800">{total.toLocaleString('vi-VN')}đ</span>
            </div>
            <button
              onClick={() => { setQrPhase('confirm'); setCheckoutOpen(true); }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              <CreditCard size={18} /> Thanh toán ngay
            </button>
          </div>

          <Modal isOpen={checkoutOpen} onClose={() => { setCheckoutOpen(false); setQrPhase('confirm'); }} title="Thanh toán" size="sm">
            {qrPhase === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Xác nhận đăng ký {cartCourses.length} môn học:</p>
                  <ul className="list-disc list-inside text-blue-700">
                    {cartCourses.map(c => (
                      <li key={c!.id}>{c!.name} — {c!.price.toLocaleString('vi-VN')}đ</li>
                    ))}
                  </ul>
                  <p className="font-bold mt-2">Tổng: {total.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setCheckoutOpen(false); setQrPhase('confirm'); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
                  <button onClick={handleStartPayment} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                    <QrCode size={16} /> Quét mã QR
                  </button>
                </div>
              </div>
            )}

            {qrPhase === 'qr' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-600">Quét mã QR bên dưới để thanh toán</p>
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-white rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center shadow-inner">
                    <QrCode size={140} className="text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-xl py-2">
                  <Clock size={16} />
                  <span className="text-sm font-medium">Tự động xác nhận sau {countdown}s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((8 - countdown) / 8) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">Vui lòng chờ trong khi hệ thống xử lý thanh toán...</p>
              </div>
            )}

            {qrPhase === 'done' && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-gray-800">Thanh toán thành công!</p>
                <p className="text-sm text-gray-500">Đã thanh toán {cartCourses.length} môn học.</p>
                <button
                  onClick={handleCompletePayment}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  <CheckCircle size={18} /> Hoàn tất
                </button>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
