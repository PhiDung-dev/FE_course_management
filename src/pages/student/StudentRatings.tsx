import { useState } from 'react';
import { Star, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNotify } from '../../contexts/NotificationContext';
import Modal from '../../components/Modal';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`transition-colors ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!onChange}
        >
          <Star
            size={20}
            className={star <= (hover || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
          />
        </button>
      ))}
    </div>
  );
}

export default function StudentRatings() {
  const { currentUser } = useAuth();
  const { courses, enrollments, ratings, dispatch, refreshAll } = useData();
  const { addNotification } = useNotify();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [editingRatingId, setEditingRatingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const myEnrollments = enrollments.filter(e => e.studentId === currentUser?.id && (e.status === 'active' || e.status === 'completed'));
  const myCourseIds = myEnrollments.map(e => e.courseId);
  const myRatings = ratings.filter(r => r.studentId === currentUser?.id);

  // Môn đã đăng ký nhưng chưa đánh giá
  const unratedCourseIds = myCourseIds.filter(id => !myRatings.some(r => r.courseId === id));

  const handleSubmit = async () => {
    if (!selectedCourse || !comment) return;
    try {
      if (editingRatingId) {
        const existing = myRatings.find(r => r.id === editingRatingId);
        if (existing) {
          await dispatch({
            type: 'UPDATE_RATING',
            payload: { ...existing, stars, comment },
          });
          await refreshAll();
          if (currentUser) {
            addNotification('Đánh giá', `Đã cập nhật đánh giá thành công`, 'system', ['student'], currentUser.id);
          }
        }
      } else {
        await dispatch({
          type: 'ADD_RATING',
          payload: {
            id: `local-rt-${Date.now()}`,
            studentId: currentUser!.id,
            courseId: selectedCourse,
            stars,
            comment,
            createdAt: new Date().toISOString(),
          },
        });
        await refreshAll();
        if (currentUser) {
          addNotification('Đánh giá', `Đã đánh giá môn học thành công`, 'system', ['student'], currentUser.id);
        }
      }
      setModalOpen(false);
      setComment('');
      setStars(5);
      setSelectedCourse('');
      setEditingRatingId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đánh giá thất bại. Vui lòng thử lại.';
      if (currentUser) {
        addNotification('Lỗi', msg, 'system', ['student'], currentUser.id);
      }
    }
  };

  const handleEdit = (ratingId: string) => {
    const rating = myRatings.find(r => r.id === ratingId);
    if (!rating) return;
    setEditingRatingId(rating.id);
    setSelectedCourse(rating.courseId);
    setStars(rating.stars);
    setComment(rating.comment);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await dispatch({ type: 'DELETE_RATING', payload: confirmDelete });
      await refreshAll();
      addNotification('Xóa đánh giá', `Đã xóa đánh giá thành công`, 'system', ['student'], currentUser!.id);
      setConfirmDelete(null);
    } catch (err) {
      addNotification('Lỗi', 'Xóa đánh giá thất bại.', 'system', ['student'], currentUser!.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đánh giá môn học</h1>
          <p className="text-gray-500 text-sm mt-1">Chia sẻ trải nghiệm học tập của bạn</p>
        </div>
        {unratedCourseIds.length > 0 && (
          <button
            onClick={() => { setEditingRatingId(null); setSelectedCourse(unratedCourseIds[0]); setComment(''); setStars(5); setModalOpen(true); }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Star size={16} /> Viết đánh giá
          </button>
        )}
      </div>

      {/* Unrated courses prompt */}
      {unratedCourseIds.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-yellow-800 font-medium mb-2">Bạn chưa đánh giá {unratedCourseIds.length} môn học:</p>
          <div className="flex flex-wrap gap-2">
            {unratedCourseIds.map(id => {
              const course = courses.find(c => c.id === id);
              return (
                <button
                  key={id}
                  onClick={() => { setEditingRatingId(null); setSelectedCourse(id); setComment(''); setStars(5); setModalOpen(true); }}
                  className="text-xs bg-white border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  {course?.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* My ratings list */}
      <div className="space-y-4">
        {myRatings.map(r => {
          const course = courses.find(c => c.id === r.courseId);
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                {course && (
                  <img src={course.image} alt={course.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800">{course?.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{r.createdAt}</span>
                      <button onClick={() => handleEdit(r.id)} className="text-gray-400 hover:text-blue-500 transition-colors" title="Sửa đánh giá">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setConfirmDelete(r.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Xóa đánh giá">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <StarRating value={r.stars} />
                  <p className="text-sm text-gray-600 mt-2">{r.comment}</p>
                </div>
              </div>
            </div>
          );
        })}
        {myRatings.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Star size={40} className="mx-auto mb-3 opacity-30" />
            <p>Bạn chưa có đánh giá nào.</p>
          </div>
        )}
      </div>

      {/* Rating modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Đánh giá môn học" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Môn học</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="input"
            >
              <option value="">-- Chọn môn học --</option>
              {unratedCourseIds.map(id => {
                const c = courses.find(course => course.id === id);
                return <option key={id} value={id}>{c?.name}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="label">Xếp hạng</label>
            {/* StarRating có state riêng cho hover effect — tách component để giữ code sạch */}
            <StarRating value={stars} onChange={setStars} />
          </div>
          <div>
            <label className="label">Nhận xét</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="input min-h-24 resize-none"
              placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
          <button onClick={handleSubmit} disabled={!selectedCourse || !comment} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-medium disabled:opacity-50">
            {editingRatingId ? 'Cập nhật' : 'Gửi đánh giá'}
          </button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Xóa đánh giá" size="sm">
        <p className="text-sm text-gray-600">Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium">
            Xóa đánh giá
          </button>
        </div>
      </Modal>
    </div>
  );
}
