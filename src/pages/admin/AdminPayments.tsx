import { useState } from 'react';
import { Plus, Pencil, Search, CreditCard, Eye, Download, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/Modal';
import { useNotify } from '../../contexts/NotificationContext';
import Badge from '../../components/Badge';
import type { Payment } from '../../types';

const statusMap = {
  paid:    { label: 'Đã thanh toán', variant: 'green' as const },
  pending: { label: 'Chờ xử lý',    variant: 'yellow' as const },
  refunded:{ label: 'Hoàn tiền',    variant: 'red' as const },
};

const methodMap: Record<string, string> = {
  cash: 'Tiền mặt', transfer: 'Chuyển khoản', card: 'Thẻ',
};

export default function AdminPayments() {
  const { payments, courses, enrollments, dispatch } = useData();
  const { users } = useAuth();
  const [search, setSearch] = useState('');
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editStatus, setEditStatus] = useState<Payment['status']>('pending');
  const [editMethod, setEditMethod] = useState<Payment['method']>('cash');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ studentId: '', courseId: '', amount: 0, method: 'cash' as Payment['method'], status: 'paid' as Payment['status'] });
  const [invoicePayment, setInvoicePayment] = useState<Payment | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

  const students = users.filter(u => u.role === 'student');

  const filtered = payments.filter(p => {
    const student = users.find(u => u.id === p.studentId);
    const course = courses.find(c => c.id === p.courseId);
    return ((student?.name ?? '') + (course?.name ?? '')).toLowerCase().includes(search.toLowerCase());
  });

  const openEdit = (p: Payment) => {
    setEditingPayment(p);
    setEditStatus(p.status);
    setEditMethod(p.method);
  };

  const { addNotification } = useNotify();

  const handleUpdate = () => {
    if (!editingPayment) return;
    const student = users.find(u => u.id === editingPayment.studentId);
    const studentName = student?.name ?? '';
    dispatch({
      type: 'UPDATE_PAYMENT',
      payload: {
        ...editingPayment,
        status: editStatus,
        method: editMethod,
        paidAt: editStatus === 'paid' ? new Date().toISOString().split('T')[0] : editingPayment.paidAt,
      },
    });
    addNotification('Cập nhật thanh toán', `Đã cập nhật thanh toán ${studentName}`, 'payment', ['admin']);
    setEditingPayment(null);
  };

  const handleDelete = async () => {
    if (!deletePaymentId) return;
    const payment = payments.find(p => p.id === deletePaymentId);
    if(payment) {
      try {
        await dispatch({ type: 'DELETE_PAYMENT', payload: deletePaymentId });
        addNotification('Xoá thanh toán', 'Đã xoá thanh toán thành công', 'system', ['admin']);
      } catch (err) {
        addNotification('Lỗi', `Không thể xoá: ${(err as Error).message}`, 'system', ['admin']);
      }
    }
    setDeletePaymentId(null);
  };

  const handleAdd = async () => {
    if (!addForm.studentId || !addForm.courseId) return;
    const enrollment = enrollments.find(e => e.studentId === addForm.studentId && e.courseId === addForm.courseId);
    try {
      await dispatch({
        type: 'ADD_PAYMENT',
        payload: {
          id: `p${Date.now()}`,
          studentId: addForm.studentId,
          courseId: addForm.courseId,
          enrollmentId: enrollment?.id ?? '',
          amount: addForm.amount,
          method: addForm.method,
          status: addForm.status,
          createdAt: new Date().toISOString().split('T')[0],
        },
      });
      setAddModalOpen(false);
      addNotification('Thêm thanh toán', 'Đã thêm thanh toán thành công', 'system', ['admin']);
    } catch (err) {
      addNotification('Lỗi', 'Không thể thêm thanh toán này (Có thể đã tồn tại)', 'system', ['admin']);
    }
  };

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý thanh toán</h1>
          <p className="text-gray-500 text-sm mt-1">{payments.length} giao dịch</p>
        </div>
        <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Thêm thanh toán
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-2xl p-4">
          <p className="text-sm text-gray-500">Đã thu</p>
          <p className="text-2xl font-bold text-emerald-600">{totalPaid.toLocaleString('vi-VN')}đ</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4">
          <p className="text-sm text-gray-500">Chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-600">{totalPending.toLocaleString('vi-VN')}đ</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học sinh, môn học..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                {['Học sinh', 'Môn học', 'Số tiền', 'Phương thức', 'Trạng thái', 'Ngày tạo', '', '', ''].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const student = users.find(u => u.id === p.studentId);
                const course = courses.find(c => c.id === p.courseId);
                const st = statusMap[p.status];
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{student?.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{course?.name}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800">{p.amount.toLocaleString('vi-VN')}đ</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{methodMap[p.method]}</td>
                    <td className="px-5 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-5 py-3 text-sm text-gray-500">{p.createdAt}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setInvoicePayment(p)} className="p-1.5 text-violet-500 hover:bg-violet-50 rounded-lg transition-colors" title="Xem hóa đơn"><Eye size={14} /></button>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Cập nhật"><Pencil size={14} /></button>
                    </td>
                    <td className="px-5 py-3">
                      {p.status !== 'paid' && (
                        <button onClick={() => setDeletePaymentId(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xoá"><Trash2 size={14} /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Không có giao dịch nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice modal */}
      {invoicePayment && (() => {
        const p = invoicePayment;
        const student = users.find(u => u.id === p.studentId);
        const course = courses.find(c => c.id === p.courseId);
        const st = statusMap[p.status];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setInvoicePayment(null)}>
            <div className="bg-white rounded-2xl p-8 w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">HÓA ĐƠN ĐIỆN TỬ</h2>
                <p className="text-xs text-gray-400 mt-1">ELECTRONIC INVOICE</p>
              </div>

              <div className="border-t border-b border-gray-200 py-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã hóa đơn</span>
                  <span className="font-mono font-medium text-gray-800">{p.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Học sinh</span>
                  <span className="font-medium text-gray-800">{student?.name ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Môn học</span>
                  <span className="font-medium text-gray-800">{course?.name ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tiền</span>
                  <span className="font-bold text-lg text-gray-800">{p.amount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="font-medium text-gray-800">{methodMap[p.method]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Trạng thái</span>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày thanh toán</span>
                  <span className="font-medium text-gray-800">{p.paidAt ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày tạo</span>
                  <span className="font-medium text-gray-800">{p.createdAt}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setInvoicePayment(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Đóng</button>
                <button onClick={() => addNotification('Hóa đơn', 'Chức năng tải hóa đơn đang phát triển', 'system', ['admin'])} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                  <Download size={14} /> Tải hóa đơn
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete confirmation modal */}
      {deletePaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletePaymentId(null)}>
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-2">Xác nhận xoá</h3>
            <p className="text-sm text-gray-500 mb-5">Bạn có chắc muốn xoá giao dịch thanh toán này không?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletePaymentId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">Xoá</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      <Modal isOpen={!!editingPayment} onClose={() => setEditingPayment(null)} title="Cập nhật thanh toán" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Trạng thái</label>
            <select value={editStatus} onChange={e => setEditStatus(e.target.value as Payment['status'])} className="input">
              <option value="pending">Chờ xử lý</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunded">Hoàn tiền</option>
            </select>
          </div>
          <div>
            <label className="label">Phương thức</label>
            <select value={editMethod} onChange={e => setEditMethod(e.target.value as Payment['method'])} className="input">
              <option value="cash">Tiền mặt</option>
              <option value="transfer">Chuyển khoản</option>
              <option value="card">Thẻ</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditingPayment(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
          <button onClick={handleUpdate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Cập nhật</button>
        </div>
      </Modal>

      {/* Add payment modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Thêm giao dịch thanh toán">
        <div className="space-y-4">
          <div>
            <label className="label">Học sinh</label>
            <select value={addForm.studentId} onChange={e => setAddForm(p => ({ ...p, studentId: e.target.value }))} className="input">
              <option value="">-- Chọn học sinh --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Môn học</label>
            <select value={addForm.courseId} onChange={e => setAddForm(p => ({ ...p, courseId: e.target.value }))} className="input">
              <option value="">-- Chọn môn học --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} — {c.price.toLocaleString('vi-VN')}đ</option>)}
            </select>
          </div>
          <div>
            <label className="label">Số tiền (VNĐ)</label>
            <input type="number" value={addForm.amount} onChange={e => setAddForm(p => ({ ...p, amount: Number(e.target.value) }))} className="input" min={0} />
          </div>
          <div>
            <label className="label">Phương thức</label>
            <select value={addForm.method} onChange={e => setAddForm(p => ({ ...p, method: e.target.value as Payment['method'] }))} className="input">
              <option value="cash">Tiền mặt</option>
              <option value="transfer">Chuyển khoản</option>
              <option value="card">Thẻ</option>
            </select>
          </div>
          <div>
            <label className="label">Trạng thái</label>
            <select value={addForm.status} onChange={e => setAddForm(p => ({ ...p, status: e.target.value as Payment['status'] }))} className="input">
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ xử lý</option>
              <option value="refunded">Hoàn tiền</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
          <button onClick={handleAdd} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Lưu</button>
        </div>
      </Modal>
    </div>
  );
}
