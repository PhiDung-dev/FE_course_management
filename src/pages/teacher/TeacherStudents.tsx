import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotify } from '../../contexts/NotificationContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export default function TeacherStudents() {
  const navigate = useNavigate();
  const { currentUser, users } = useAuth();
  const { courses, enrollments, scores, schedules, classrooms, dispatch } = useData();
  const { addToast } = useToast();
  const { addNotification } = useNotify();
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const myCourses = courses.filter(c => c.teacherId === currentUser?.id);

  const myStudents = enrollments
    .filter(e => {
      const isMyClass = myCourses.some(c => c.id === e.courseId);
      const matchCourse = !selectedCourse || e.courseId === selectedCourse;
      return isMyClass && e.status === 'active' && matchCourse;
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

  const studentsWithoutScores = myStudents.filter(item => !item.score);

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

  const [scoreModal, setScoreModal] = useState<{
    enrollmentId: string;
    studentId: string;
    courseId: string;
    studentName: string;
    courseName: string;
    currentScore: number;
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

  const handleSaveScore = () => {
    if (!scoreModal) return;
    const reg = parseFloat(editRegular);
    const mid = parseFloat(editMidterm);
    const fin = parseFloat(editFinal);
    if (editRegular && (isNaN(reg) || reg < 0 || reg > 10)) {
      addToast('error', 'Điểm thường kỳ phải từ 0 đến 10.');
      return;
    }
    if (editMidterm && (isNaN(mid) || mid < 0 || mid > 10)) {
      addToast('error', 'Điểm giữa kỳ phải từ 0 đến 10.');
      return;
    }
    if (editFinal && (isNaN(fin) || fin < 0 || fin > 10)) {
      addToast('error', 'Điểm cuối kỳ phải từ 0 đến 10.');
      return;
    }
    const totalScore = computedTotal();
    const grade = gradeFromScore(totalScore);
    const payload = {
      id: scoreModal.existingId || `sc${Date.now()}`,
      studentId: scoreModal.studentId,
      courseId: scoreModal.courseId,
      enrollmentId: scoreModal.enrollmentId,
      regular: reg || 0,
      midterm: mid || 0,
      final: fin || 0,
      score: totalScore,
      grade,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    if (scoreModal.existingId) {
      dispatch({ type: 'UPDATE_SCORE', payload });
    } else {
      dispatch({ type: 'ADD_SCORE_LOCAL', payload: { ...payload, id: `local-sc-${Date.now()}` } });
    }
    setScoreModal(null);
    addNotification('Cập nhật điểm', `Đã cập nhật điểm cho ${scoreModal.studentName} - môn ${scoreModal.courseName}`, 'score', ['teacher'], currentUser?.id);
  };

  const openScoreModal = (item: typeof myStudents[0]) => {
    if (!item.student || !item.course) return;
    setEditRegular(item.score ? String(item.score.regular ?? '') : '');
    setEditMidterm(item.score ? String(item.score.midterm ?? '') : '');
    setEditFinal(item.score ? String(item.score.final ?? '') : '');
    setScoreModal({
      enrollmentId: item.enrollment.id,
      studentId: item.student.id,
      courseId: item.course.id,
      studentName: item.student.name,
      courseName: item.course.name,
      currentScore: item.score?.score ?? 0,
      existingId: item.score?.id,
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Học sinh & Điểm số</h1>
        <p className="text-gray-500 text-sm mt-1">{myStudents.length} học sinh đang học với bạn</p>
      </div>

      {studentsWithoutScores.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-amber-600" />
            <h2 className="font-semibold text-amber-800">Cần nhập điểm ({studentsWithoutScores.length})</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {studentsWithoutScores.map(item => (
              <button
                key={item.enrollment.id}
                onClick={() => openScoreModal(item)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-sm text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <span className="font-medium">{item.student?.name}</span>
                <span className="text-amber-400">·</span>
                <span className="text-amber-600">{item.course?.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học sinh..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-56" />
          </div>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="">Tất cả môn học</option>
            {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">Học sinh</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Môn học</th>
                <th className="text-left px-5 py-3 font-medium">Lớp</th>
                <th className="text-left px-5 py-3 font-medium">Phòng</th>
                <th className="text-center px-5 py-3 font-medium">Điểm</th>
                <th className="text-center px-5 py-3 font-medium">Xếp loại</th>
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
                  <td className="px-5 py-3 text-sm text-gray-600">{item.course?.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {(() => {
                      const schedule = schedules.find(s => s.courseId === item.course?.id && s.status === 'active');
                      const room = schedule ? classrooms.find(r => r.id === schedule.classroomId) : null;
                      return room?.name ?? '—';
                    })()}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {item.score?.score !== undefined ? (
                      <span className="text-sm font-bold text-gray-800">{item.score.score}</span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {item.score?.grade ? (
                      <Badge variant={(item.score.score ?? 0) >= 8 ? 'green' : (item.score.score ?? 0) >= 5 ? 'blue' : 'orange'}>
                        {item.score.grade}
                      </Badge>
                    ) : (
                      <button
                        onClick={() => navigate('/teacher/points')}
                        className="text-xs text-amber-600 hover:text-amber-800 font-medium underline underline-offset-2"
                      >
                        Nhập điểm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myStudents.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có học sinh nào</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!scoreModal}
        onClose={() => setScoreModal(null)}
        title={scoreModal?.existingId ? 'Cập nhật điểm' : 'Nhập điểm'}
        size="sm"
      >
        {scoreModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-medium text-gray-800">{scoreModal.studentName}</p>
              <p className="text-gray-500">{scoreModal.courseName}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Điểm thường kỳ (0-10)</label>
                <input
                  type="number"
                  value={editRegular}
                  onChange={e => setEditRegular(e.target.value)}
                  className="input"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="VD: 8"
                />
              </div>
              <div>
                <label className="label">Điểm giữa kỳ (0-10)</label>
                <input
                  type="number"
                  value={editMidterm}
                  onChange={e => setEditMidterm(e.target.value)}
                  className="input"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="VD: 7.5"
                />
              </div>
              <div>
                <label className="label">Điểm cuối kỳ (0-10)</label>
                <input
                  type="number"
                  value={editFinal}
                  onChange={e => setEditFinal(e.target.value)}
                  className="input"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="VD: 8.5"
                />
              </div>
            </div>
            {(editRegular || editMidterm || editFinal) && (
              <div className="text-sm text-gray-500 space-y-1">
                <p>Tổng điểm: <span className="font-bold text-gray-800">{computedTotal().toFixed(2)}</span></p>
                <p>
                  Xếp loại dự kiến:{' '}
                  <Badge variant={computedTotal() >= 8 ? 'green' : computedTotal() >= 5 ? 'blue' : 'orange'}>
                    {gradeFromScore(computedTotal())}
                  </Badge>
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setScoreModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Huỷ</button>
              <button onClick={handleSaveScore} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Lưu điểm</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
