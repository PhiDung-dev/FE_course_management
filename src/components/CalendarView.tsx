import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, User } from 'lucide-react';
import Modal from './Modal';
import type { Schedule, Course, Classroom, User as UserType } from '../types';

const DAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const HOURS = Array.from({ length: 14 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);

const COURSE_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-emerald-100 border-emerald-300 text-emerald-800',
  'bg-violet-100 border-violet-300 text-violet-800',
  'bg-amber-100 border-amber-300 text-amber-800',
  'bg-rose-100 border-rose-300 text-rose-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-teal-100 border-teal-300 text-teal-800',
];

function getWeekDates(weekOffset: number) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1 + weekOffset * 7);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(d: Date) {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function isToday(d: Date) {
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

interface CalendarViewProps {
  schedules: Schedule[];
  courses: Course[];
  classrooms: Classroom[];
  linkPrefix?: string;
  users?: UserType[];
  onSlotClick?: (dayOfWeek: number, time: string) => void;
  onEditSchedule?: (schedule: Schedule) => void;
}

export default function CalendarView({ schedules, courses, classrooms, linkPrefix, users, onSlotClick, onEditSchedule }: CalendarViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const weekDates = getWeekDates(weekOffset);

  const colorMap: Record<string, string> = {};
  const getColor = (courseId: string) => {
    if (!colorMap[courseId]) {
      const used = Object.keys(colorMap).length;
      colorMap[courseId] = COURSE_COLORS[used % COURSE_COLORS.length];
    }
    return colorMap[courseId];
  };

  const scheduleMap: Record<number, Schedule[]> = {};
  for (let d = 0; d < 7; d++) scheduleMap[d] = [];
  for (const s of schedules) {
    if (s.status === 'active' && scheduleMap[s.dayOfWeek]) {
      scheduleMap[s.dayOfWeek].push(s);
    }
  }

  const getPos = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h - 6) * 60 + m;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-gray-700">
            Tuần {weekDates[0] && formatDate(weekDates[0])} - {weekDates[6] && formatDate(weekDates[6])}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-blue-600 hover:underline ml-2"
            >
              Hôm nay
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[800px]">
          <div className="h-12 border-b border-r border-gray-200 bg-gray-50" />
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={`h-12 flex flex-col items-center justify-center border-b border-r border-gray-200 ${
                isToday(weekDates[i]) ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
              }`}
            >
              <span className="text-xs font-medium leading-tight">{day}</span>
              <span className={`text-sm font-bold leading-tight ${isToday(weekDates[i]) ? 'text-blue-600' : 'text-gray-800'}`}>
                {weekDates[i]?.getDate()}/{weekDates[i]?.getMonth() + 1}
              </span>
            </div>
          ))}

          {HOURS.map(hour => {
            const h = parseInt(hour);
            return (
              <>
                <div key={`t-${hour}`} className="h-[60px] border-b border-r border-gray-100 text-xs text-gray-400 pr-2 text-right pt-0.5">
                  {hour}
                </div>
                {[0, 1, 2, 3, 4, 5, 6].map(day => {
                  const schedulesAtTime = scheduleMap[day].filter(s => {
                    const start = getPos(s.startTime);
                    const current = (h - 6) * 60;
                    return start >= current && start < current + 60;
                  });
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-[60px] border-b border-r border-gray-100 relative ${onSlotClick ? 'cursor-pointer hover:bg-blue-50/40' : ''}`}
                      onClick={() => onSlotClick?.(day, hour)}
                    >
                      {schedulesAtTime.map(s => {
                        const course = courses.find(c => c.id === s.courseId);
                        const room = classrooms.find(r => r.id === s.classroomId);
                        const startMin = getPos(s.startTime);
                        const endMin = getPos(s.endTime);
                        const top = startMin - (h - 6) * 60;
                        const height = endMin - startMin;

                        return (
                          <div
                            key={s.id}
                            className={`absolute left-0.5 right-0.5 rounded-lg border px-1.5 py-0.5 text-xs overflow-hidden cursor-pointer hover:opacity-80 transition-opacity z-10 ${getColor(s.courseId)}`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            title={`${course?.name}\n${room?.name}\n${s.startTime}-${s.endTime}`}
                            onClick={e => {
                              e.stopPropagation();
                              if (onEditSchedule) {
                                onEditSchedule(s);
                              } else {
                                setSelectedSchedule(s);
                              }
                            }}
                          >
                            {linkPrefix ? (
                              <Link to={`${linkPrefix}/${s.courseId}`} className="block leading-tight" onClick={e => e.stopPropagation()}>
                                <div className="font-medium truncate">{course?.name}</div>
                                <div className="opacity-75 truncate">{s.startTime} - {s.endTime}</div>
                                {room && <div className="opacity-75 truncate">{room.name}</div>}
                              </Link>
                            ) : (
                              <>
                                <div className="font-medium truncate">{course?.name}</div>
                                <div className="opacity-75 truncate">{s.startTime} - {s.endTime}</div>
                                {room && <div className="opacity-75 truncate">{room.name}</div>}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            );
          })}
        </div>
      </div>

      <Modal isOpen={!!selectedSchedule} onClose={() => setSelectedSchedule(null)} title="Chi tiết lịch học" size="md">
        {selectedSchedule && (() => {
          const course = courses.find(c => c.id === selectedSchedule.courseId);
          const room = classrooms.find(r => r.id === selectedSchedule.classroomId);
          const teacher = users?.find(u => u.id === selectedSchedule.teacherId);
          return (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">{course?.name || 'Không xác định'}</h3>

              {teacher && (
                <div className="flex items-center gap-3 text-gray-700">
                  <User size={18} className="text-gray-400 shrink-0" />
                  <span>Giáo viên: <span className="font-medium">{teacher.name}</span></span>
                </div>
              )}

              {room && (
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin size={18} className="text-gray-400 shrink-0" />
                  <span>Phòng: <span className="font-medium">{room.name}</span> - {room.location}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={18} className="text-gray-400 shrink-0" />
                <span>Thứ: <span className="font-medium">{DAYS[selectedSchedule.dayOfWeek]}</span></span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Clock size={18} className="text-gray-400 shrink-0" />
                <span>Giờ: <span className="font-medium">{selectedSchedule.startTime} - {selectedSchedule.endTime}</span></span>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm font-medium text-blue-800">Thời gian học:</p>
                <p className="text-sm text-blue-700">Từ {selectedSchedule.startDate} đến {selectedSchedule.endDate}</p>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
