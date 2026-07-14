import { BookOpen, Star, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Badge from '../../components/Badge';

export default function StudentResults() {
  const { currentUser } = useAuth();
  const { courses, enrollments, scores } = useData();

  const myEnrollments = enrollments.filter(e => e.studentId === currentUser?.id && (e.status === 'active' || e.status === 'completed'));
  const myScores = scores.filter(s => s.studentId === currentUser?.id);

  const results = myEnrollments.map(e => {
    const course = courses.find(c => c.id === e.courseId);
    const score = myScores.find(s => s.enrollmentId === e.id);
    return { course, enrollment: e, score };
  });

  const validScores = myScores.filter(s => typeof s.score === 'number');

  const avgScore = validScores.length
    ? (validScores.reduce((s, sc) => s + sc.score!, 0) / validScores.length).toFixed(1)
    : null;

  const totalCredits = myEnrollments.length;

  const gradeColor = (score: number) => {
    if (score >= 8.5) return 'green';
    if (score >= 7) return 'blue';
    if (score >= 5) return 'yellow';
    return 'orange';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kết quả học tập</h1>
        <p className="text-gray-500 text-sm mt-1">Bảng điểm và tiến độ học tập của bạn</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0"><BookOpen size={20} className="text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Đã đăng ký</p>
            <p className="text-xl font-bold text-blue-700">{totalCredits} môn</p>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0"><Award size={20} className="text-emerald-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Đã có điểm</p>
            <p className="text-xl font-bold text-emerald-700">{validScores.length} môn</p>
          </div>
        </div>
        <div className="bg-violet-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0"><TrendingUp size={20} className="text-violet-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Điểm TB</p>
            <p className="text-xl font-bold text-violet-700">{avgScore ?? '—'}</p>
          </div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0"><Star size={20} className="text-amber-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Xếp loại</p>
            <p className="text-xl font-bold text-amber-700">
              {avgScore ? (parseFloat(avgScore) >= 8.5 ? 'Giỏi' : parseFloat(avgScore) >= 7 ? 'Khá' : parseFloat(avgScore) >= 5 ? 'TB' : 'Yếu') : '—'}
            </p>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>Bạn chưa đăng ký môn học nào.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">Môn học</th>
                  <th className="text-center px-5 py-3 font-medium">Số buổi</th>
                  <th className="text-center px-5 py-3 font-medium">Giá</th>
                  <th className="text-center px-5 py-3 font-medium">Điểm</th>
                  <th className="text-center px-5 py-3 font-medium">Xếp loại</th>
                  <th className="text-center px-5 py-3 font-medium">Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {results.map(({ course, enrollment, score }) => (
                  <tr key={enrollment.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {course && <img src={course.image} alt={course.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{course?.name}</p>
                          <p className="text-xs text-gray-400">{course?.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-sm text-gray-600">{course?.duration ?? '—'}</td>
                    <td className="px-5 py-3 text-center text-sm text-gray-600">{course?.price.toLocaleString('vi-VN')}đ</td>
                    <td className="px-5 py-3 text-center">
                      {score ? (
                        <span className="text-lg font-bold text-gray-800">{score.score}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {score?.grade ? (
                        <Badge variant={gradeColor(score.score ?? 0)}>{score.grade}</Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center text-sm text-gray-500">{enrollment.enrolledAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
