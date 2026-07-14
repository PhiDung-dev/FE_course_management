import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

export default function Login() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [accounts, courses] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/accounts`).then(r => r.json()),
          api.fetchAllCourses([]),
        ]);

        const list = (accounts?.result ?? []) as Array<{ role?: { roleName?: string } }>;
        setStats({
          students: list.filter(a => a.role?.roleName === 'STUDENT').length,
          teachers: list.filter(a => a.role?.roleName === 'TEACHER').length,
          courses: courses.length,
        });
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const err = await login(email, password);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }
  };

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : currentUser.role === 'teacher' ? '/teacher' : '/student');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex">
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-16 text-white">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <GraduationCap size={22} />
          </div>
          <span className="text-2xl font-bold">EduHub</span>
        </div>
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Nền tảng quản lý
          <br />
          khóa học hiện đại
        </h1>
        <p className="text-blue-300 text-lg leading-relaxed">
          Quản lý hoạt động giảng dạy, lịch học, học sinh và thanh toán trong một giao diện duy nhất.
        </p>
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            [stats.students, 'Học viên'],
            [stats.teachers, 'Giáo viên'],
            [stats.courses, 'Khóa học'],
          ].map(([num, label]) => (
            <div key={label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">{num}</p>
              <p className="text-blue-300 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">EduHub</span>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Đăng nhập</h2>
            <p className="text-gray-500 text-sm mb-6">Nhập tài khoản của bạn để tiếp tục.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all pr-10"
                    placeholder="******"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Đăng ký ngay
              </Link>
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                to="/courses"
                className="block text-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                Xem khóa học không cần đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
