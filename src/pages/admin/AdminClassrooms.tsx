import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import Modal from '../../components/Modal';
import { useNotify } from '../../contexts/NotificationContext';
import Badge from '../../components/Badge';
import type { Classroom } from '../../types';

const EMPTY: Omit<Classroom, 'id'> = {
  name: '', capacity: 20, location: '', equipment: '', status: 'available',
};

const statusMap = {
  available: { label: 'Trống', variant: 'green' as const },
  occupied: { label: 'Đang dùng', variant: 'blue' as const },
  maintenance: { label: 'Bảo trì', variant: 'yellow' as const },
};

export default function AdminClassrooms() {
  const { classrooms, dispatch } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [form, setForm] = useState<Omit<Classroom, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (r: Classroom) => {
    setEditing(r);
    setForm({ name: r.name, capacity: r.capacity, location: r.location, equipment: r.equipment, status: r.status });
    setModalOpen(true);
  };

  const { addNotification } = useNotify();

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (editing) {
        await dispatch({ type: 'UPDATE_CLASSROOM', payload: { ...editing, ...form } });
        addNotification('Cập nhật phòng học', `Đã cập nhật phòng ${form.name}`, 'system', ['admin']);
      } else {
        await dispatch({ type: 'ADD_CLASSROOM', payload: { ...form, id: `r${Date.now()}` } });
        addNotification('Phòng học mới', `Đã thêm phòng ${form.name}`, 'system', ['admin']);
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại';
      addNotification('Lỗi', msg, 'system', ['admin']);
    }
  };

  const field = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý phòng học</h1>
          <p className="text-gray-500 text-sm mt-1">{classrooms.length} phòng học trong hệ thống</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Thêm phòng học
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classrooms.map(r => {
          const st = statusMap[r.status];
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.location}</p>
                  </div>
                </div>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p><span className="text-gray-400">Sức chứa:</span> {r.capacity} người</p>
                <p><span className="text-gray-400">Thiết bị:</span> {r.equipment}</p>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(r)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil size={12} /> Sửa
                </button>
                <button onClick={() => setDeleteId(r.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={12} /> Xoá
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa phòng học' : 'Thêm phòng học'}>
        <div className="space-y-4">
          <div>
            <label className="label">Tên phòng</label>
            <input value={form.name} onChange={field('name')} className="input" placeholder="VD: Phòng A101" />
          </div>
          <div>
            <label className="label">Vị trí</label>
            <input value={form.location} onChange={field('location')} className="input" placeholder="Tầng 1, Tòa A" />
          </div>
          <div>
            <label className="label">Sức chứa</label>
            <input type="number" value={form.capacity} onChange={field('capacity')} className="input" min={1} />
          </div>
          <div>
            <label className="label">Thiết bị</label>
            <input value={form.equipment} onChange={field('equipment')} className="input" placeholder="Máy chiếu, điều hòa..." />
          </div>
          <div>
            <label className="label">Trạng thái</label>
            <select value={form.status} onChange={field('status')} className="input">
              <option value="available">Trống</option>
              <option value="occupied">Đang dùng</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Lưu</button>
        </div>
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-2">Xác nhận xoá</h3>
            <p className="text-sm text-gray-500 mb-5">Xoá phòng học này?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
              <button onClick={() => { dispatch({ type: 'DELETE_CLASSROOM', payload: deleteId }); addNotification('Xoá phòng học', 'Đã xoá phòng học', 'system', ['admin']); setDeleteId(null); }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
