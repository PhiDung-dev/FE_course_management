import { useState } from 'react';
import { Plus, Trash2, Search, Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotify } from '../../contexts/NotificationContext';
import Modal from '../../components/Modal';
import CalendarView from '../../components/CalendarView';
import type { Schedule } from '../../types';

const DAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function defaultDateRange() {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 4);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function mapScheduleError(err: unknown): string {
  const msg = err instanceof Error ? err.message : '';
  if (!msg || msg === 'Failed to fetch') {
    return 'Không kết nối được backend. Hãy chạy Spring Boot tại http://localhost:8080';
  }
  if (msg.includes('schedule conflict')) {
    return 'Trùng lịch: phòng hoặc giáo viên đã có lịch trong khung giờ này. Đổi ngày trong tuần, giờ hoặc phòng học.';
  }
  if (msg.includes('user not found')) {
    return 'Giáo viên không hợp lệ. Vui lòng chọn giáo viên trong danh sách.';
  }
  if (msg.includes('class room not found')) {
    return 'Phòng học không tồn tại. Tạo phòng học trước hoặc chọn phòng khác.';
  }
  if (msg.includes('course not found')) {
    return 'Môn học không tồn tại.';
  }
  return msg;
}

const EMPTY: Omit<Schedule, 'id'> = {
  courseId: '', classroomId: '', teacherId: '',
  dayOfWeek: 5, startTime: '14:00', endTime: '16:00',
  ...defaultDateRange(),
  status: 'active',
};

export default function AdminSchedules() {
  const { schedules, courses, classrooms, dispatch } = useData();
  const { users } = useAuth();
  const { addNotification } = useNotify();
  const teachers = users.filter(u => u.role === 'teacher');

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [form, setForm] = useState<Omit<Schedule, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = schedules.filter(s => {
    const course = courses.find(c => c.id === s.courseId);
    const nameMatch = course?.name.toLowerCase().includes(search.toLowerCase()) ?? true;
    const courseMatch = !courseFilter || s.courseId === courseFilter;
    const teacherMatch = !teacherFilter || s.teacherId === teacherFilter;
    return nameMatch && courseMatch && teacherMatch;
  });

  const activeSchedules = filtered.filter(s => s.status === 'active');

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, ...defaultDateRange() });
    setSaveError('');
    setModalOpen(true);
  };

  const openEdit = (s: Schedule) => {
    setEditing(s);
    setForm({ courseId: s.courseId, classroomId: s.classroomId, teacherId: s.teacherId, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, startDate: s.startDate, endDate: s.endDate, status: s.status });
    setModalOpen(true);
  };

  const onSlotClick = (dayOfWeek: number, time: string) => {
    const [h, m] = time.split(':').map(Number);
    const endHour = String(Math.min(h + 2, 19)).padStart(2, '0');
    setEditing(null);
    setForm({ ...EMPTY, dayOfWeek, startTime: time, endTime: `${endHour}:${String(m).padStart(2, '0')}` });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaveError('');
    if (!form.courseId || !form.classroomId || !form.startDate || !form.endDate) {
      const msg = 'Vui lòng chọn môn học, phòng học và ngày bắt đầu/kết thúc';
      setSaveError(msg);
      addNotification('Lỗi', msg, 'system', ['admin']);
      return;
    }
    const teacherId = form.teacherId
      || courses.find(c => c.id === form.courseId)?.teacherId
      || (teachers.length === 1 ? teachers[0].id : '');
    if (!teacherId) {
      const msg = 'Vui lòng chọn giáo viên phụ trách (môn học mới chưa có giáo viên gán sẵn)';
      setSaveError(msg);
      addNotification('Lỗi', msg, 'system', ['admin']);
      return;
    }
    if (form.startDate > form.endDate) {
      const msg = 'Ngày kết thúc phải sau ngày bắt đầu';
      setSaveError(msg);
      return;
    }
    const payload = { ...form, teacherId };
    const course = courses.find(c => c.id === form.courseId);
    const courseName = course?.name || '';
    setSaving(true);
    try {
      if (editing) {
        await dispatch({ type: 'UPDATE_SCHEDULE', payload: { ...editing, ...payload } });
        addNotification('Cập nhật lịch', `Đã cập nhật lịch ${courseName}`, 'system', ['admin']);
      } else {
        await dispatch({ type: 'ADD_SCHEDULE', payload: { ...payload, id: '' } });
        addNotification('Lịch học mới', `Đã tạo lịch cho ${courseName}`, 'system', ['admin']);
      }
      setModalOpen(false);
    } catch (err) {
      const msg = mapScheduleError(err);
      setSaveError(msg);
      addNotification('Lỗi', msg, 'system', ['admin']);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý lịch học</h1>
          <p className="text-gray-500 text-sm mt-1">{schedules.length} lịch học trong hệ thống</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Thêm lịch học
        </button>
      </div>

      {(courses.length === 0 || classrooms.length === 0) && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {courses.length === 0 && classrooms.length === 0
            ? 'Không tải được dữ liệu. Kiểm tra backend Spring Boot đang chạy tại http://localhost:8080 rồi refresh trang.'
            : courses.length === 0
              ? 'Chưa có môn học. Tạo môn học trước khi thêm lịch.'
              : 'Chưa có phòng học. Tạo phòng học trước khi thêm lịch.'}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative w-60">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo môn học..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input w-48 text-sm">
          <option value="">Tất cả môn học</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)} className="input w-48 text-sm">
          <option value="">Tất cả giáo viên</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {activeSchedules.length > 0 ? (
        <CalendarView
          schedules={activeSchedules}
          courses={courses}
          classrooms={classrooms}
          users={users}
          onSlotClick={onSlotClick}
          onEditSchedule={openEdit}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-12 text-gray-400">
          <Calendar size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Không có lịch học nào</p>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa lịch học' : 'Thêm lịch học'} size="lg">
        {saveError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Môn học</label>
            <select value={form.courseId} onChange={e => {
              const courseId = e.target.value;
              const course = courses.find(c => c.id === courseId);
              const teacherId = course?.teacherId || '';
              setForm(prev => ({ ...prev, courseId, teacherId }));
              setSaveError('');
            }} className="input">
              <option value="">-- Chọn môn học --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {form.courseId && form.teacherId && (() => {
              const teacher = teachers.find(t => t.id === form.teacherId);
              if (!teacher) return null;
              return (
                <p className="text-xs text-gray-400 mt-1">
                  Giáo viên: <span className="font-medium text-gray-600">{teacher.name}</span>
                </p>
              );
            })()}
          </div>
          <div>
            <label className="label">Giáo viên</label>
            <select value={form.teacherId} onChange={field('teacherId')} className="input">
              <option value="">-- Chọn giáo viên --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Phòng học</label>
            <select value={form.classroomId} onChange={field('classroomId')} className="input">
              <option value="">-- Chọn phòng --</option>
              {classrooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ngày trong tuần</label>
            <select value={form.dayOfWeek} onChange={field('dayOfWeek')} className="input">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Giờ bắt đầu</label>
            <input type="time" value={form.startTime} onChange={field('startTime')} className="input" />
          </div>
          <div>
            <label className="label">Giờ kết thúc</label>
            <input type="time" value={form.endTime} onChange={field('endTime')} className="input" />
          </div>
          <div>
            <label className="label">Ngày bắt đầu</label>
            <input type="date" value={form.startDate} onChange={field('startDate')} className="input" />
          </div>
          <div>
            <label className="label">Ngày kết thúc</label>
            <input type="date" value={form.endDate} onChange={field('endDate')} className="input" />
          </div>
          <div>
            <label className="label">Trạng thái</label>
            <select value={form.status} onChange={field('status')} className="input">
              <option value="active">Hoạt động</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
          {editing && (
            <button onClick={() => editing && setDeleteId(editing.id)} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium flex items-center gap-1">
              <Trash2 size={14} /> Xoá
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-60">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-2">Xác nhận xoá</h3>
            <p className="text-sm text-gray-500 mb-5">Bạn có chắc muốn xoá lịch học này không?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
              <button onClick={() => {
                const s = schedules.find(s => s.id === deleteId);
                const course = courses.find(c => c.id === s?.courseId);
                const courseName = course?.name || '';
                dispatch({ type: 'DELETE_SCHEDULE', payload: deleteId });
                addNotification('Xoá lịch học', `Đã xoá lịch ${courseName}`, 'system', ['admin']);
                setDeleteId(null);
                setModalOpen(false);
              }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
