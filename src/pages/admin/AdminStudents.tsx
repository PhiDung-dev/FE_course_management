import { useState } from 'react';
import { Search, GraduationCap, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNotify } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal';
import { Plus } from 'lucide-react';

export default function AdminStudents() {
  const { users, dispatch: authDispatch } = useAuth();
  const { enrollments, courses, payments } = useData();
  const { addNotification } = useNotify();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '' });
  const { register } = useAuth();

  const students = users.filter(u => u.role === 'student' &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh sách học sinh</h1>
          <p className="text-gray-500 text-sm mt-1">{users.filter(u => u.role === 'student').length} học sinh đã đăng ký</p>
        </div>
        <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Thêm học sinh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học sinh..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                {['Học sinh', 'Email', 'Số điện thoại', 'Số môn đang học', 'Đã thanh toán', 'Ngày đăng ký', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const myEnrollments = enrollments.filter(e => e.studentId === s.id && e.status === 'active');
                const myPayments = payments.filter(p => p.studentId === s.id && p.status === 'paid');
                const totalPaid = myPayments.reduce((sum, p) => sum + p.amount, 0);

                return (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {s.avatar ? (
                          <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium text-sm">{s.name[0]}</div>
                        )}
                        <span className="font-medium text-sm text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{s.email}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{s.phone ?? '—'}</td>
                    <td className="px-5 py-3">
                      <div>
                        <span className="text-sm font-medium text-gray-800">{myEnrollments.length} môn</span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {myEnrollments.slice(0, 2).map(e => courses.find(c => c.id === e.courseId)?.name).join(', ')}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-emerald-600">{totalPaid.toLocaleString('vi-VN')}đ</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{s.createdAt}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xoá học viên"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Không tìm thấy học sinh</p>
            </div>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-2">Xác nhận xoá</h3>
            <p className="text-sm text-gray-500 mb-5">Xoá học viên này sẽ không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
              <button onClick={async () => {
                try {
                  await authDispatch({ type: 'DELETE_USER', payload: deleteId });
                  addNotification('Xoá học viên', 'Đã xoá học viên', 'system', ['admin']);
                  setDeleteId(null);
                  addToast('success', 'Đã xoá học viên.');
                } catch {
                  addToast('error', 'Xoá thất bại');
                  setDeleteId(null);
                }
              }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">Xoá</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Thêm học sinh mới">
        <div className="space-y-4">
          <div>
            <label className="label">Họ và tên</label>
            <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} className="input" placeholder="Nhập tên học sinh" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className="input" placeholder="student@example.com" />
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <input value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} className="input" placeholder="09xxxxxxxx" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
          <button onClick={async () => {
            if (!addForm.name || !addForm.email) {
              addToast('error', 'Vui lòng nhập tên và email');
              return;
            }
            const err = await register(addForm.name, addForm.email, '123456', addForm.phone);
            if (err) {
              addToast('error', err);
            } else {
              addToast('success', 'Đã thêm học sinh thành công (Mật khẩu mặc định: 123456)');
              addNotification('Học sinh mới', `Đã tạo tài khoản cho ${addForm.name}`, 'system', ['admin']);
              setAddModalOpen(false);
              setAddForm({ name: '', email: '', phone: '' });
            }
          }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Lưu học sinh</button>
        </div>
      </Modal>
    </div>
  );
}
