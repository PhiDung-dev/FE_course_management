import { useState } from 'react';
import { Search, GraduationCap, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotify } from '../../contexts/NotificationContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const gradeFromScore = (score: number): string => {
  if (score >= 9) return 'A+';
  if (score >= 8.5) return 'A';
  if (score >= 8) return 'B+';
  if (score >= 7) return 'B';
  if (score >= 6) return 'C+';
  if (score >= 5) return 'C';
  if (score >= 4) return 'D+';
  return 'F';
};

export default function TeacherPoints() {
  const { currentUser, users } = useAuth();
  const { courses, enrollments, scores, schedules, classrooms, dispatch } = useData();
  const { addToast } = useToast();
  const { addNotification } = useNotify();
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  const myCourses = courses.filter(c => c.teacherId === currentUser?.id);

  const myStudents = enrollments
    .filter(e => {
      const isMyClass = myCourses.some(c => c.id === e.courseId);
      const matchCourse = !selectedCourse || e.courseId === selectedCourse;
      // Filter by classroom: check if the student's course has schedules in the selected classroom
      let matchClassroom = true;
      if (selectedClassroom) {
        const courseSchedulesForRoom = schedules.filter(
          s => s.courseId === e.courseId && s.classroomId === selectedClassroom && s.status === 'active'
        );
        matchClassroom = courseSchedulesForRoom.length > 0;
      }
      return isMyClass && e.status === 'active' && matchCourse && matchClassroom;
    })
    .map(e => ({
      enrollment: e,
      student: users.find(u => u.id === e.studentId),
      course: courses.find(c => c.id === e.courseId),
      score: scores.find(s => s.enrollmentId === e.id),
    }))
    .filter(item =>
      item.student && (
        item.student.name.toLowerCase().includes(search.toLowerCase()) ||
        item.student.email.toLowerCase().includes(search.toLowerCase())
      )
    );

  const [scoreModal, setScoreModal] = useState<{
    enrollmentId: string; studentId: string; courseId: string;
    studentName: string; courseName: string;
    existingId?: string;
  } | null>(null);
  const [editRegular, setEditRegular] = useState('');
  const [editMidterm, setEditMidterm] = useState('');
  const [editFinal, setEditFinal] = useState('');

  const computedTotal = () => {
    const reg = parseFloat(editRegular) || 0;
    const mid = parseFloat(editMidterm) || 0;
    const fin = parseFloat(editFinal) || 0;
    return reg * 0.2 + mid * 0.3 + fin * 0.5;
  };

  const openScoreModal = (item: typeof myStudents[0]) => {
    if (!item.student || !item.course) return;
    setEditRegular(item.score ? String(item.score.regular ?? '') : '');
    setEditMidterm(item.score ? String(item.score.midterm ?? '') : '');
    setEditFinal(item.score ? String(item.score.final ?? '') : '');
    setScoreModal({
      enrollmentId: item.enrollment.id, studentId: item.student.id, courseId: item.course.id,
      studentName: item.student.name, courseName: item.course.name, existingId: item.score?.id,
    });
  };

  const handleSaveScore = () => {
    if (!scoreModal) return;
    const reg = parseFloat(editRegular) || 0;
    const mid = parseFloat(editMidterm) || 0;
    const fin = parseFloat(editFinal) || 0;
    if (reg > 10 || mid > 10 || fin > 10) {
      addToast('error', 'Điểm không được vượt quá 10.');
      return;
    }
    const totalScore = computedTotal();
    const grade = gradeFromScore(totalScore);
    const payload = {
      id: scoreModal.existingId || `sc${Date.now()}`,
      studentId: scoreModal.studentId, courseId: scoreModal.courseId,
      enrollmentId: scoreModal.enrollmentId,
      regular: reg, midterm: mid, final: fin,
      score: totalScore, grade,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    if (scoreModal.existingId) {
      dispatch({ type: 'UPDATE_SCORE', payload });
    } else {
      dispatch({ type: 'ADD_SCORE_LOCAL', payload: { ...payload, id: `local-sc-${Date.now()}` } });
    }
    setScoreModal(null);
    addNotification('Cập nhật điểm', `Đã cập nhật điểm cho ${scoreModal.studentName} - môn ${scoreModal.courseName}`, 'score', ['teacher'], currentUser?.id);
    addToast('success', `Đã lưu điểm cho ${scoreModal.studentName}!`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nhập điểm học sinh</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý điểm số cho học sinh theo từng môn học</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm học sinh..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-56" />
          </div>
          <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedClassroom(''); }}
            className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="">Tất cả môn học</option>
            {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {selectedCourse && (
            <select value={selectedClassroom} onChange={e => setSelectedClassroom(e.target.value)}
              className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="">Tất cả phòng</option>
              {[...new Set(
                schedules
                  .filter(s => s.courseId === selectedCourse && s.status === 'active')
                  .map(s => s.classroomId)
              )].map(roomId => {
                const room = classrooms.find(r => r.id === roomId);
                return room ? <option key={room.id} value={room.id}>{room.name}</option> : null;
              })}
            </select>
          )}
        </div>
      </div>

      {/* Score entry table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium">Học sinh</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Môn học</th>
                <th className="text-center px-5 py-3 font-medium">Thường kỳ (×0.2)</th>
                <th className="text-center px-5 py-3 font-medium">Giữa kỳ (×0.3)</th>
                <th className="text-center px-5 py-3 font-medium">Cuối kỳ (×0.5)</th>
                <th className="text-center px-5 py-3 font-medium">Tổng</th>
                <th className="text-center px-5 py-3 font-medium">Xếp loại</th>
                <th className="text-center px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {myStudents.map(item => (
                <tr key={item.enrollment.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-medium">
                        {item.student?.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{item.student?.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{item.student?.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{item.course?.name}</td>
                  <td className="px-5 py-3 text-center text-sm text-gray-700">{item.score?.regular ?? '—'}</td>
                  <td className="px-5 py-3 text-center text-sm text-gray-700">{item.score?.midterm ?? '—'}</td>
                  <td className="px-5 py-3 text-center text-sm text-gray-700">{item.score?.final ?? '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-sm font-bold ${(item.score?.score ?? 0) >= 5 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item.score?.score?.toFixed(2) ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {item.score?.grade ? (
                      <Badge variant={(item.score.score ?? 0) >= 8 ? 'green' : (item.score.score ?? 0) >= 5 ? 'blue' : 'orange'}>
                        {item.score.grade}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => openScoreModal(item)}
                      className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors">
                      {item.score ? 'Sửa' : 'Nhập'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myStudents.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Không có học sinh nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Score modal */}
      <Modal isOpen={!!scoreModal} onClose={() => setScoreModal(null)}
        title={scoreModal?.existingId ? 'Cập nhật điểm' : 'Nhập điểm'} size="sm">
        {scoreModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-medium text-gray-800">{scoreModal.studentName}</p>
              <p className="text-gray-500">{scoreModal.courseName}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Thường kỳ</label>
                <input type="number" value={editRegular} onChange={e => setEditRegular(e.target.value)}
                  className="input" min={0} max={10} step={0.5} placeholder="0-10" />
              </div>
              <div>
                <label className="label">Giữa kỳ</label>
                <input type="number" value={editMidterm} onChange={e => setEditMidterm(e.target.value)}
                  className="input" min={0} max={10} step={0.5} placeholder="0-10" />
              </div>
              <div>
                <label className="label">Cuối kỳ</label>
                <input type="number" value={editFinal} onChange={e => setEditFinal(e.target.value)}
                  className="input" min={0} max={10} step={0.5} placeholder="0-10" />
              </div>
            </div>
            {(editRegular || editMidterm || editFinal) && (
              <div className="text-sm text-gray-500 space-y-1 bg-blue-50 rounded-xl p-3">
                <p>Tổng: <span className="font-bold text-gray-800">{computedTotal().toFixed(2)}</span></p>
                <p>Xếp loại: <Badge variant={computedTotal() >= 8 ? 'green' : computedTotal() >= 5 ? 'blue' : 'orange'}>
                  {gradeFromScore(computedTotal())}</Badge></p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setScoreModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
              <button onClick={handleSaveScore}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                <Save size={14} /> Lưu điểm
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
