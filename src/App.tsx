import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import type { UserRole } from './types';

// Layout
import AppLayout from './components/AppLayout';
import ToastContainer from './components/ToastContainer';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';
import PublicCourses from './pages/PublicCourses';
import PublicCourseDetail from './pages/PublicCourseDetail';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminClassrooms from './pages/admin/AdminClassrooms';
import AdminPayments from './pages/admin/AdminPayments';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherSchedule from './pages/teacher/TeacherSchedule';
import TeacherPoints from './pages/teacher/TeacherPoints';
import TeacherDocuments from './pages/teacher/TeacherDocuments';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentBuyCourses from './pages/student/StudentBuyCourses';
import StudentRatings from './pages/student/StudentRatings';
import CourseDetail from './pages/student/CourseDetail';
import ShoppingCartPage from './pages/student/ShoppingCart';
import StudentResults from './pages/student/StudentResults';
import StudentDocuments from './pages/student/StudentDocuments';

// Shared pages
import ProfilePage from './pages/shared/ProfilePage';

// --- ProtectedRoute ---
// Bảo vệ các route cần đăng nhập — nếu chưa login, chuyển về /login
// roles: nếu có, kiểm tra thêm role (admin, teacher, student)
function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    // User đã đăng nhập nhưng sai role — chuyển về dashboard đúng của role họ
    return <Navigate to={`/${currentUser.role}`} replace />;
  }

  return <>{children}</>;
}

// --- RootRedirect ---
// Route / tự động redirect về dashboard tương ứng với role
// Nếu chưa login → /courses (trang công khai)
function RootRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/courses" replace />;
  return <Navigate to={`/${currentUser.role}`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root: redirect theo role */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public routes — không cần đăng nhập */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/courses" element={<PublicCourses />} />
      <Route path="/courses/:id" element={<PublicCourseDetail />} />

      {/* Protected routes — có sidebar layout */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        {/* Shared routes — mọi role đã đăng nhập đều truy cập được */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute roles={['admin']}><AdminCourses /></ProtectedRoute>} />
        <Route path="/admin/schedules" element={<ProtectedRoute roles={['admin']}><AdminSchedules /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><AdminStudents /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute roles={['admin']}><AdminTeachers /></ProtectedRoute>} />
        <Route path="/admin/classrooms" element={<ProtectedRoute roles={['admin']}><AdminClassrooms /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/students" element={<ProtectedRoute roles={['teacher']}><TeacherStudents /></ProtectedRoute>} />
        <Route path="/teacher/courses" element={<ProtectedRoute roles={['teacher']}><TeacherCourses /></ProtectedRoute>} />
        <Route path="/teacher/schedule" element={<ProtectedRoute roles={['teacher']}><TeacherSchedule /></ProtectedRoute>} />
        <Route path="/teacher/points" element={<ProtectedRoute roles={['teacher']}><TeacherPoints /></ProtectedRoute>} />
        <Route path="/teacher/documents" element={<ProtectedRoute roles={['teacher']}><TeacherDocuments /></ProtectedRoute>} />

        {/* Student routes */}
        <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/schedule" element={<ProtectedRoute roles={['student']}><StudentSchedule /></ProtectedRoute>} />
        <Route path="/student/courses" element={<ProtectedRoute roles={['student']}><StudentBuyCourses /></ProtectedRoute>} />
        <Route path="/student/course/:id" element={<ProtectedRoute roles={['student']}><CourseDetail /></ProtectedRoute>} />
        <Route path="/student/documents" element={<ProtectedRoute roles={['student']}><StudentDocuments /></ProtectedRoute>} />
        <Route path="/student/cart" element={<ProtectedRoute roles={['student']}><ShoppingCartPage /></ProtectedRoute>} />
        <Route path="/student/ratings" element={<ProtectedRoute roles={['student']}><StudentRatings /></ProtectedRoute>} />
        <Route path="/student/results" element={<ProtectedRoute roles={['student']}><StudentResults /></ProtectedRoute>} />
      </Route>

      {/* Fallback — redirect về root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <ToastProvider>
              <AppRoutes />
              <ToastContainer />
            </ToastProvider>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
