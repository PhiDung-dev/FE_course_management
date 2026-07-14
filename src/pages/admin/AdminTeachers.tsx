import { useState } from 'react';
import { Plus, Trash2, Search, Users, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Modal from '../../components/Modal';
import { useNotify } from '../../contexts/NotificationContext';
import type { User } from '../../types';

export default function AdminTeachers() {
  const { users, currentUser, dispatch: authDispatch } = useAuth();
  const { courses, enrollments, schedules } = useData();
  const { addNotification } = useNotify();
  const teachers = users.filter(u => u.role === 'teacher');

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '123456' });
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailTeacher, setDetailTeacher] = useState<User | null>(null);

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    setError('');
    if (!form.name || !form.email) return;
    const exists = users.some(u => u.email === form.email);
    if (exists) {
      setError('Email này đã tồn tại trong hệ thống.');
      return;
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name: form.name,
      email: form.email,
      password: form.password,
      role: 'teacher',
      phone: form.phone,
      createdAt: new Date().toISOString().split('T')[0],
    };
    try {
      await authDispatch({ type: 'ADD_USER', payload: newUser });
      addNotification('Giáo viên mới', `Đã thêm giáo viên ${form.name}`, 'system', ['admin']);
      setModalOpen(false);
      setForm({ name: '', email: '', phone: '', password: '123456' });
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message || 'Tạo giáo viên thất bại');
    }
  };

  const field = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý giáo viên</h1>
          <p className="text-gray-500 text-sm mt-1">{teachers.length} giáo viên trong hệ thống</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setError(''); setModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Thêm giáo viên
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm giáo viên..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filtered.map(t => {
            const myCourses = courses.filter(c => c.teacherId === t.id && c.status === 'active');
            const myStudentCount = new Set(
              enrollments.filter(e =>
                e.status === 'active' && courses.find(c => c.id === e.courseId)?.teacherId === t.id
              ).map(e => e.studentId)
            ).size;
            return (
              <div key={t.id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">{t.name[0]}</div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setDetailTeacher(t)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => {
                        if (currentUser?.id === t.id) { setError('Không thể tự xoá chính mình.'); return; }
                        setDeleteId(t.id);
                      }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 mt-2 pt-3 border-t border-gray-50">
                  <span><strong className="text-gray-700">{myCourses.length}</strong> môn đang dạy</span>
                  <span><strong className="text-gray-700">{myStudentCount}</strong> học sinh</span>
                  {t.phone && <span>{t.phone}</span>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Không tìm thấy giáo viên</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Thêm giáo viên mới">
        <div className="space-y-4">
          <div>
            <label className="label">Họ và tên</label>
            <input value={form.name} onChange={field('name')} className="input" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={field('email')} className="input" placeholder="email@edu.vn" />
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <input value={form.phone} onChange={field('phone')} className="input" placeholder="09xxxxxxxx" />
          </div>
          <div>
            <label className="label">Mật khẩu tạm</label>
            <input value={form.password} onChange={field('password')} className="input" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
          <button onClick={handleCreate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Tạo tài khoản</button>
        </div>
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-2">Xác nhận xoá</h3>
            <p className="text-sm text-gray-500 mb-5">Xoá giáo viên này sẽ không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
                  <button onClick={async () => { try { await authDispatch({ type: 'DELETE_USER', payload: deleteId }); addNotification('Xoá giáo viên', 'Đã xoá giáo viên', 'system', ['admin']); setDeleteId(null); } catch (err) { const e = err as { message?: string }; setError(e.message || 'Xoá thất bại'); setDeleteId(null); } }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">Xoá</button>
            </div>
          </div>
        </div>
      )}

      {detailTeacher && (() => {
        const t = detailTeacher;
        const myCourses = courses.filter(c => c.teacherId === t.id && c.status === 'active');
        const scheduleCount = schedules.filter(s => s.teacherId === t.id && s.status === 'active').length;
        return (
          <Modal isOpen={true} onClose={() => setDetailTeacher(null)} title="Chi tiết giáo viên" size="md">
            <div className="space-y-5">
              <div className="text-center">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full object-cover mx-auto" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mx-auto">{t.name[0]}</div>
                )}
                <h3 className="text-lg font-bold text-gray-800 mt-3">{t.name}</h3>
                <p className="text-sm text-gray-500">{t.email}</p>
                {t.phone && <p className="text-sm text-gray-500">{t.phone}</p>}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Môn đang dạy ({myCourses.length})</p>
                <div className="space-y-2">
                  {myCourses.map(c => {
                    const studentCount = enrollments.filter(e => e.status === 'active' && e.courseId === c.id).length;
                    return (
                      <div key={c.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                        <span className="text-xs text-gray-500">{studentCount} học sinh</span>
                      </div>
                    );
                  })}
                  {myCourses.length === 0 && <p className="text-sm text-gray-400">Chưa có môn học nào</p>}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Lịch dạy</span>
                <span className="text-sm font-semibold text-gray-800">{scheduleCount} buổi/tuần</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button
                  onClick={async () => {
                    if (!detailTeacher?.id) return;
                    try {
                      await authDispatch({ type: 'DELETE_USER', payload: detailTeacher.id });
                      addNotification('Xoá giáo viên', 'Đã xoá giáo viên', 'system', ['admin']);
                      setDetailTeacher(null);
                    } catch (err) {
                      const e = err as { message?: string };
                      setError(e.message || 'Xoá thất bại');
                      setDetailTeacher(null);
                    }
                  }}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600"
                >
                  Xoá giáo viên
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
