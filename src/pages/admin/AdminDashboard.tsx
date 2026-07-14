import { BookOpen, Users, GraduationCap, CreditCard, Building2, TrendingUp, DollarSign, Star } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';

export default function AdminDashboard() {
  const { courses, enrollments, payments, classrooms, ratings } = useData();
  const { users } = useAuth();

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const recentPayments = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const activeEnrollments = enrollments.filter(e => e.status === 'active' && users.some(u => u.id === e.studentId));

  const topCourses = [...courses]
    .map(c => ({
      ...c,
      count: activeEnrollments.filter(e => e.courseId === c.id).length,
      revenue: payments.filter(p => p.courseId === c.id && p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const avgRating = (courseId: string) => {
    const rs = ratings.filter(r => r.courseId === courseId);
    if (!rs.length) return null;
    return (rs.reduce((s, r) => s + r.stars, 0) / rs.length).toFixed(1);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <p className="text-gray-500 text-sm mt-1">Xem nhanh tình trạng hoạt động</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Môn học" value={courses.filter(c => c.status === 'active').length} icon={<BookOpen size={22} />} color="blue" sub="đang mở" />
        <StatCard label="Học sinh" value={students.length} icon={<GraduationCap size={22} />} color="emerald" sub="đã đăng ký" />
        <StatCard label="Giáo viên" value={teachers.length} icon={<Users size={22} />} color="violet" sub="đang giảng dạy" />
        <StatCard label="Phòng học" value={classrooms.length} icon={<Building2 size={22} />} color="amber" sub="trong hệ thống" />
        <StatCard label="Đăng ký học" value={activeEnrollments.length} icon={<TrendingUp size={22} />} color="rose" sub="đang hoạt động" />
        <StatCard label="Doanh thu" value={totalRevenue >= 1000000 ? `${(totalRevenue / 1_000_000).toFixed(1)}M` : `${totalRevenue.toLocaleString('vi-VN')}đ`} icon={<CreditCard size={22} />} color="blue" sub="đã thanh toán" />
        <StatCard label="Chờ xử lý" value={totalPending >= 1000000 ? `${(totalPending / 1_000_000).toFixed(1)}M` : `${totalPending.toLocaleString('vi-VN')}đ`} icon={<DollarSign size={22} />} color="amber" sub="chưa thanh toán" />
        <StatCard label="Tổng số môn" value={courses.length} icon={<BookOpen size={22} />} color="rose" sub="cả active & inactive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top courses by enrollment */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Môn học mua nhiều nhất
          </h2>
          <div className="space-y-4">
            {topCourses.map((course, idx) => {
              const pct = course.maxStudents > 0 ? Math.round((course.count / course.maxStudents) * 100) : 0;
              return (
                <div key={course.id}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 truncate mr-2">{course.name}</span>
                        <span className="text-gray-400 flex-shrink-0">{course.count} học viên</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-8">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 ml-8 mt-0.5">
                    <span>{course.revenue.toLocaleString('vi-VN')}đ</span>
                    {avgRating(course.id) && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Star size={10} /> {avgRating(course.id)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {topCourses.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Thanh toán gần đây</h2>
          <div className="space-y-3">
            {recentPayments.map(p => {
              const student = users.find(u => u.id === p.studentId);
              const course = courses.find(c => c.id === p.courseId);
              return (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{student?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{course?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-gray-700">{p.amount.toLocaleString('vi-VN')}đ</p>
                    <Badge variant={p.status === 'paid' ? 'green' : p.status === 'pending' ? 'yellow' : 'red'}>
                      {p.status === 'paid' ? 'Đã thanh toán' : p.status === 'pending' ? 'Chờ xử lý' : 'Hoàn tiền'}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {recentPayments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có giao dịch</p>
            )}
          </div>
        </div>
      </div>

      {/* Course overview table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-6">
        <h2 className="font-semibold text-gray-800 mb-4">Tổng quan các môn học</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left px-3 py-3 font-medium">Môn học</th>
                <th className="text-left px-3 py-3 font-medium">Giáo viên</th>
                <th className="text-center px-3 py-3 font-medium">Học viên</th>
                <th className="text-center px-3 py-3 font-medium">Doanh thu</th>
                <th className="text-center px-3 py-3 font-medium">Đánh giá</th>
                <th className="text-center px-3 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => {
                const teacher = users.find(u => u.id === c.teacherId);
                const count = activeEnrollments.filter(e => e.courseId === c.id).length;
                const revenue = payments.filter(p => p.courseId === c.id && p.status === 'paid').reduce((s, p) => s + p.amount, 0);
                const avg = avgRating(c.id);
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-3 font-medium text-gray-800">{c.name}</td>
                    <td className="px-3 py-3 text-gray-600">{teacher?.name ?? '—'}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{count}/{c.maxStudents}</td>
                    <td className="px-3 py-3 text-center text-emerald-600 font-medium">{revenue.toLocaleString('vi-VN')}đ</td>
                    <td className="px-3 py-3 text-center text-yellow-600">{avg ? `${avg} ⭐` : '—'}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant={c.status === 'active' ? 'green' : 'gray'}>{c.status === 'active' ? 'Đang mở' : 'Tạm dừng'}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
