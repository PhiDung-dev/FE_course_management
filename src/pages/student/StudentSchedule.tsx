import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import CalendarView from '../../components/CalendarView';

export default function StudentSchedule() {
  const { currentUser, users } = useAuth();
  const { courses, schedules, classrooms, enrollments } = useData();

  const myEnrollments = enrollments.filter(e => e.studentId === currentUser?.id && e.status === 'active');
  const myCourseIds = myEnrollments.map(e => e.courseId);
  const mySchedules = schedules.filter(s => myCourseIds.includes(s.courseId));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lịch học cá nhân</h1>
        <p className="text-gray-500 text-sm mt-1">{mySchedules.filter(s => s.status === 'active').length} buổi học mỗi tuần</p>
      </div>

      {mySchedules.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p>Bạn chưa có lịch học nào. Hãy đăng ký môn học trước!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <CalendarView schedules={mySchedules} courses={courses} classrooms={classrooms} linkPrefix="/student/course" users={users} />
        </div>
      )}
    </div>
  );
}
