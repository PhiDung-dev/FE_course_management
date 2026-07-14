import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import CalendarView from '../../components/CalendarView';

export default function TeacherSchedule() {
  const { currentUser, users } = useAuth();
  const { schedules, courses, classrooms } = useData();

  const mySchedules = schedules.filter(s => s.teacherId === currentUser?.id);

  const now = new Date();
  const today = now.getDay();

  const upcomingSchedules = mySchedules.filter(s => {
    if (s.status !== 'active') return false;
    if (s.dayOfWeek !== today) return false;
    const [h, m] = s.startTime.split(':').map(Number);
    const sTime = new Date();
    sTime.setHours(h, m, 0, 0);
    const diffMin = (sTime.getTime() - now.getTime()) / 60000;
    return diffMin > 0 && diffMin <= 30;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lịch dạy cá nhân</h1>
        <p className="text-gray-500 text-sm mt-1">{mySchedules.filter(s => s.status === 'active').length} lịch dạy đang hoạt động</p>
      </div>

      {upcomingSchedules.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="font-semibold text-amber-800 mb-2">Sắp đến giờ dạy</p>
          <div className="space-y-1">
            {upcomingSchedules.map(s => {
              const course = courses.find(c => c.id === s.courseId);
              return (
                <p key={s.id} className="text-sm text-amber-700">
                  {course?.name} lúc {s.startTime}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {mySchedules.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p>Chưa có lịch dạy nào được phân công.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <CalendarView schedules={mySchedules} courses={courses} classrooms={classrooms} users={users} />
        </div>
      )}
    </div>
  );
}
