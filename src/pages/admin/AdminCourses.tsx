import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotify } from '../../contexts/NotificationContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import type { Course } from '../../types';

const EMPTY: Omit<Course, 'id' | 'createdAt'> = {
  name: '', description: '', teacherId: '', price: 0, duration: 0,
  level: 'beginner', category: '', maxStudents: 20,
  image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600',
  status: 'active',
};

const levelBadge = { beginner: 'green', intermediate: 'blue', advanced: 'orange' } as const;

export default function AdminCourses() {
  const { courses, enrollments, dispatch } = useData();
  const { users } = useAuth();
  const { addNotification } = useNotify();
  const teachers = users.filter(u => u.role === 'teacher');

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<Omit<Course, 'id' | 'createdAt'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setSaveError('');
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({ name: course.name, description: course.description, teacherId: course.teacherId, price: course.price, duration: course.duration, level: course.level, category: course.category, maxStudents: course.maxStudents, image: course.image, status: course.status });
    setSaveError('');
    setModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.teacherId) return;
    setSaveError('');
    setIsSaving(true);
    try {
      if (editing) {
        await dispatch({ type: 'UPDATE_COURSE', payload: { ...editing, ...form } });
        addNotification('Cập nhật môn học', `Đã cập nhật môn học ${form.name}`, 'system', ['admin']);
      } else {
        await dispatch({
          type: 'ADD_COURSE',
          payload: { ...form, id: `c${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] },
        });
        addNotification('Môn học mới', `Đã thêm môn học ${form.name}`, 'system', ['admin']);
      }
      setModalOpen(false);
    } catch (err) {
      const e = err as { message?: string };
      setSaveError(e.message || 'Lưu thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_COURSE', payload: id });
    setDeleteId(null);
    addNotification('Xoá môn học', `Đã xoá môn học`, 'system', ['admin']);
  };

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (e.target.type === 'number') {
      const parsed = parseInt(val, 10);
      setForm(prev => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
    } else {
      setForm(prev => ({ ...prev, [key]: val }));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý môn học</h1>
          <p className="text-gray-500 text-sm mt-1">{courses.length} môn học trong hệ thống</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Thêm môn học
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm môn học..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                {['Môn học', 'Giáo viên', 'Thể loại', 'Giá', 'Học viên', 'Trình độ', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const teacher = teachers.find(t => t.id === c.teacherId);
                const count = enrollments.filter(e => e.courseId === c.id && e.status === 'active' && users.some(u => u.id === e.studentId)).length;
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={c.image} alt={c.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.duration} buổi</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{teacher?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{c.category}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-700">{c.price.toLocaleString('vi-VN')}đ</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{count}/{c.maxStudents}</td>
                    <td className="px-5 py-3">
                      <Badge variant={levelBadge[c.level]}>
                        {c.level === 'beginner' ? 'Cơ bản' : c.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={c.status === 'active' ? 'green' : 'gray'}>
                        {c.status === 'active' ? 'Đang mở' : 'Tạm dừng'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Không có môn học nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa môn học' : 'Thêm môn học'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Tên môn học</label>
            <input value={form.name} onChange={field('name')} className="input" placeholder="Nhập tên môn học" />
          </div>
          <div className="col-span-2">
            <label className="label">Mô tả</label>
            <textarea value={form.description} onChange={field('description')} className="input min-h-20 resize-none" placeholder="Mô tả khóa học" />
          </div>
          <div>
            <label className="label">Giáo viên</label>
            <select value={form.teacherId} onChange={field('teacherId')} className="input">
              <option value="">-- Chọn giáo viên --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Thể loại</label>
            <input value={form.category} onChange={field('category')} className="input" placeholder="VD: Lập trình" />
          </div>
          <div>
            <label className="label">Giá (VNĐ)</label>
            <input type="number" value={form.price} onChange={field('price')} className="input" min={0} />
          </div>
          <div>
            <label className="label">Số buổi học</label>
            <input type="number" value={form.duration} onChange={field('duration')} className="input" min={1} />
          </div>
          <div>
            <label className="label">Trình độ</label>
            <select value={form.level} onChange={field('level')} className="input">
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </select>
          </div>
          <div>
            <label className="label">Sĩ số tối đa</label>
            <input type="number" value={form.maxStudents} onChange={field('maxStudents')} className="input" min={1} />
          </div>
          <div>
            <label className="label">Trạng thái</label>
            <select value={form.status} onChange={field('status')} className="input">
              <option value="active">Đang mở</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>
          <div>
            <label className="label">Ảnh (URL)</label>
            <input value={form.image} onChange={field('image')} className="input" placeholder="https://..." />
          </div>
        </div>
        {saveError && <p className="text-sm text-red-500 mt-2">{saveError}</p>}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Huỷ</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-2">Xác nhận xoá</h3>
            <p className="text-sm text-gray-500 mb-5">Bạn có chắc muốn xoá môn học này không?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
