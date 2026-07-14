import type { Course, Classroom, Schedule, Enrollment, Payment, Rating, Score } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  let body: Record<string, unknown> | null = null;
  try {
    body = await res.json();
  } catch { /* ignore */ }
  if (!res.ok) {
    const msg = (body?.message as string) || `Lỗi server: ${res.status}`;
    if (res.status === 403) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    if (res.status === 401) throw new Error('Không có quyền truy cập.');
    throw new Error(msg);
  }
  if (body && body.code !== undefined && body.code !== 1000) {
    throw new Error((body.message as string) || 'Request failed');
  }
  return body?.result as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: authHeaders() });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API}${path}`, { method: 'DELETE', headers: authHeaders() });
  await handleResponse(res);
}

type UnknownJson = Record<string, unknown>;

function asRecord(v: unknown): UnknownJson {
  return (v && typeof v === 'object' ? v : {}) as UnknownJson;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export async function fetchAllCourses(schedules: unknown[]): Promise<Course[]> {
  const coursesRaw = await apiGet<unknown[]>('/courses');
  const courses = asArray(coursesRaw);

  return courses.map(c => {
    const cObj = asRecord(c);
    const cId = String(cObj.id ?? '');
    const cTitle = String(cObj.title ?? '');
    const cDescription = String(cObj.description ?? '');
    const cPrice = typeof cObj.price === 'number' ? cObj.price : Number(cObj.price ?? 0);
    const cSlot = typeof cObj.slot === 'number' ? cObj.slot : Number(cObj.slot ?? 0);
    const cImgs = asArray(cObj.imgs);
    const cDocs = asArray(cObj.documents).map(d => {
      const dObj = asRecord(d);
      return { title: String(dObj.title ?? ''), url: String(dObj.url ?? '') };
    });

    const fromSchedule = schedules.find(s => {
      const sObj = asRecord(s);
      const course = asRecord(sObj.course);
      const teacher = asRecord(sObj.teacher);
      return String(course?.id ?? '') === cId && Boolean(teacher?.id);
    });

    const fromScheduleObj = fromSchedule ? asRecord(fromSchedule) : {};
    const fromTeacher = asRecord(fromScheduleObj.teacher);

    return {
      id: cId,
      name: cTitle,
      description: cDescription,
      teacherId: String(cObj.teacherId ?? fromTeacher.id ?? ''),
      price: Number.isFinite(cPrice) ? cPrice : 0,
      duration: typeof cObj.duration === 'number' ? cObj.duration : 0,
      level: (cObj.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      category: String(cObj.category ?? ''),
      maxStudents: Number.isFinite(cSlot) ? cSlot : 0,
      image: String(cImgs[0] ?? ''),
      documents: cDocs,
      status: 'active' as const,
      createdAt: '',
    };
  });
}

export async function fetchAllClassrooms(): Promise<Classroom[]> {
  const roomsRaw = await apiGet<unknown[]>('/classRooms');
  const rooms = asArray(roomsRaw);

  return rooms.map(r => {
    const rObj = asRecord(r);
    const statusRaw = String(rObj.status ?? '');
    const status =
      statusRaw === 'MAINTENANCE'
        ? 'maintenance'
        : statusRaw === 'OCCUPIED'
          ? 'occupied'
          : 'available';

    const capacity = typeof rObj.capacity === 'number' ? rObj.capacity : Number(rObj.capacity ?? 20);

    return {
      id: String(rObj.id ?? ''),
      name: String(rObj.name ?? rObj.roomNumber ?? ''),
      capacity: Number.isFinite(capacity) ? capacity : 20,
      location: String(rObj.location ?? ''),
      equipment: String(rObj.equipment ?? ''),
      status: status as 'available' | 'occupied' | 'maintenance',
    };
  });
}

export async function fetchAllSchedules(): Promise<Schedule[]> {
  const schedulesRaw = await apiGet<unknown[]>('/schedules');
  const schedules = asArray(schedulesRaw);

  return schedules.map(s => {
    const sObj = asRecord(s);
    const courseObj = asRecord(sObj.course);
    const teacherObj = asRecord(sObj.teacher);
    const classRoomObj = asRecord(sObj.classRoom);

    const dayRaw = String(sObj.dayOfWeek ?? '');

    const dayOfWeek =
      dayRaw === 'MONDAY'
        ? 1
        : dayRaw === 'TUESDAY'
          ? 2
          : dayRaw === 'WEDNESDAY'
            ? 3
            : dayRaw === 'THURSDAY'
              ? 4
              : dayRaw === 'FRIDAY'
                ? 5
                : dayRaw === 'SATURDAY'
                  ? 6
                  : 0;

    const slotRaw = sObj.slot;
    return {
      id: String(sObj.id ?? ''),
      courseId: String(courseObj.id ?? ''),
      classroomId: String(classRoomObj.id ?? ''),
      teacherId: String(teacherObj.id ?? ''),
      dayOfWeek,
      startTime: typeof sObj.startTime === 'string' ? sObj.startTime.substring(0, 5) : '00:00',
      endTime: typeof sObj.endTime === 'string' ? sObj.endTime.substring(0, 5) : '00:00',
      startDate: typeof sObj.startDate === 'string' ? sObj.startDate : '',
      endDate: typeof sObj.endDate === 'string' ? sObj.endDate : '',
      status: 'active' as const,
      slot: typeof slotRaw === 'number' ? slotRaw : undefined,
    };
  });
}

export async function fetchAllEnrollments(): Promise<Enrollment[]> {
  const bookingsRaw = await apiGet<unknown[]>('/bookings');
  const bookings = asArray(bookingsRaw);

  return bookings.map(b => {
    const bObj = asRecord(b);
    const userObj = asRecord(bObj.user);
    const scheduleObj = asRecord(bObj.schedule);
    const courseObj = asRecord(scheduleObj.course);

    const statusRaw = String(bObj.status ?? '');
    const status =
      statusRaw === 'CONFIRMED' ? 'active' : statusRaw === 'CANCELLED' ? 'cancelled' : 'active';

    return {
      id: String(bObj.id ?? ''),
      studentId: String(userObj.id ?? ''),
      courseId: String(courseObj.id ?? ''),
      enrolledAt: String(bObj.createdAt ?? ''),
      status: status as 'active' | 'cancelled',
    };
  });
}

export async function fetchAllPayments(): Promise<Payment[]> {
  const paymentsRaw = await apiGet<unknown[]>('/payments');
  const payments = asArray(paymentsRaw);
  return payments.map(p => {
    const pObj = asRecord(p);
    const bookingObj = asRecord(pObj.booking);
    const userObj = asRecord(bookingObj.user);
    const scheduleObj = asRecord(bookingObj.schedule);
    const courseObj = asRecord(scheduleObj.course);

    const statusRaw = String(pObj.status ?? '');
    const status =
      statusRaw === 'SUCCESS' ? 'paid' : statusRaw === 'CANCELLED' ? 'refunded' : 'pending';

    return {
      id: String(pObj.id ?? ''),
      studentId: String(userObj.id ?? ''),
      courseId: String(courseObj.id ?? ''),
      enrollmentId: String(bookingObj.id ?? ''),
      amount: typeof pObj.amount === 'number' ? pObj.amount : Number(pObj.amount ?? 0),
      method: 'transfer' as const,
      status: status as 'pending' | 'paid' | 'refunded',
      paidAt: statusRaw === 'SUCCESS' && typeof pObj.paidAt === 'string' ? pObj.paidAt : undefined,
      createdAt: typeof bookingObj.createdAt === 'string' ? bookingObj.createdAt : '',
    };
  });
}

export async function fetchAllRatings(): Promise<Rating[]> {
  const ratingsRaw = await apiGet<unknown[]>('/ratings');
  const ratings = asArray(ratingsRaw);
  return ratings.map(r => {
    const rObj = asRecord(r);
    const paymentObj = asRecord(rObj.payment);
    const bookingObj = asRecord(paymentObj.booking);
    const scheduleObj = asRecord(bookingObj.schedule);
    const courseObj = asRecord(scheduleObj.course);
    const userObj = asRecord(bookingObj.user ?? paymentObj.user);

    const starsRaw = rObj.score;
    const stars = typeof starsRaw === 'number' ? starsRaw : Number(starsRaw ?? 0);

    return {
      id: String(rObj.id ?? ''),
      studentId: String(userObj.id ?? ''),
      courseId: String(courseObj.id ?? ''),
      stars: Number.isFinite(stars) ? stars : 0,
      comment: String(rObj.comment ?? ''),
      createdAt: '',
    };
  });
}

export async function fetchAllScores(): Promise<Score[]> {
  const scoresRaw = await apiGet<unknown[]>('/scores');
  const scores = asArray(scoresRaw);

  return scores.map(s => {
    const sObj = asRecord(s);

    const paymentObj = asRecord(sObj.payment);
    const bookingObj = asRecord(paymentObj.booking);
    const scheduleObj = asRecord(bookingObj.schedule);
    const courseObj = asRecord(scheduleObj.course);

    const regularRaw = sObj.attendanceScore;
    const midtermRaw = sObj.midtermScore;
    const finalRaw = sObj.finalScore;
    const scoreRaw = sObj.averageScore;

    const regular = typeof regularRaw === 'number' ? regularRaw : undefined;
    const midterm = typeof midtermRaw === 'number' ? midtermRaw : undefined;
    const final = typeof finalRaw === 'number' ? finalRaw : undefined;
    const score = typeof scoreRaw === 'number' ? scoreRaw : undefined;

    const gradeRaw = sObj.classification;
    const grade = gradeRaw !== undefined && gradeRaw !== null && gradeRaw !== 'NOT_GRADED' ? String(gradeRaw) : undefined;

    const studentObj = asRecord(bookingObj.user);

    return {
      id: String(sObj.id ?? ''),
      studentId: String(studentObj.id ?? ''),
      courseId: String(courseObj.id ?? ''),
      enrollmentId: String(bookingObj.id ?? ''),
      regular,
      midterm,
      final,
      score,
      grade,
      updatedAt: '',
    };
  });
}


export async function fetchCartItems(userId: string): Promise<{ id: string; courseId: string; studentId: string }[]> {
  try {
    const itemsRaw = await apiGet<unknown[]>(`/carts/user/${userId}`);
    const items = asArray(itemsRaw);

    return items.map(item => {
      const iObj = asRecord(item);
      const courseObj = asRecord(iObj.course);
      const userObj = asRecord(iObj.user);

      return {
        id: String(iObj.id ?? ''),
        courseId: String(courseObj.id ?? ''),
        studentId: String(userObj.id ?? ''),
      };
    });

  } catch {
    return [];
  }
}

export async function createCourse(data: { title: string; description: string; slot: number; price: number; duration: number; level: string; category: string; teacherId?: string; image?: string; documents?: { title: string; url: string }[] }): Promise<void> {
  await apiPost('/courses', { ...data, images: data.image ? [data.image] : [], documents: data.documents || [] });
}

export async function updateCourse(id: string, data: { title: string; description: string; slot: number; price: number; duration: number; level: string; category: string; teacherId?: string; image?: string; documents?: { title: string; url: string }[] }): Promise<void> {
  await apiPut(`/courses/${id}`, { ...data, images: data.image ? [data.image] : [], documents: data.documents || [] });
}

export async function deleteCourse(id: string): Promise<void> {
  await apiDelete(`/courses/${id}`);
}

export async function createClassroom(data: { name: string; capacity: number; location: string; equipment: string; status: string }): Promise<void> {
  await apiPost('/classRooms', data);
}

export async function updateClassroom(id: string, data: { name: string; capacity: number; location: string; equipment: string; status: string }): Promise<void> {
  await apiPut(`/classRooms/${id}`, data);
}

export async function deleteClassroom(id: string): Promise<void> {
  await apiDelete(`/classRooms/${id}`);
}

export async function createSchedule(data: {
  startTime: string; endTime: string; dayOfWeek: string;
  startDate: string; endDate: string; slot?: number;
  classRoomId: string; courseId: string; teacherId: string;
}): Promise<void> {
  await apiPost('/schedules', data);
}

export async function updateSchedule(id: string, data: {
  startTime: string; endTime: string; dayOfWeek: string;
  startDate: string; endDate: string; slot?: number;
  classRoomId: string; courseId: string; teacherId: string;
}): Promise<void> {
  await apiPut(`/schedules/${id}`, data);
}

export async function deleteSchedule(id: string): Promise<void> {
  await apiDelete(`/schedules/${id}`);
}

export async function createBooking(data: { description: string; scheduleId: string; userId: string }): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/bookings', data);
}


export async function deleteBooking(id: string): Promise<void> {

  await apiDelete(`/bookings/${id}`);
}

export async function createPayment(data: { bookingId: string }): Promise<unknown> {
  return apiPost('/payments', data);
}

export async function updatePaymentStatus(id: string, status: string): Promise<void> {
  await apiPut(`/payments/${id}`, { status });
}

export async function deletePayment(id: string): Promise<void> {
  await apiDelete(`/payments/${id}`);
}


export async function createRating(data: { score: number; comment: string; paymentId: string }): Promise<void> {
  await apiPost('/ratings', data);
}

export async function updateRating(id: string, data: { score: number; comment: string }): Promise<void> {
  await apiPut(`/ratings/${id}`, data);
}

export async function deleteRating(id: string): Promise<void> {
  await apiDelete(`/ratings/${id}`);
}

export async function createScore(paymentId: string, data: { attendanceScore?: number; midtermScore?: number; finalScore?: number }): Promise<void> {
  await apiPost(`/scores/payment/${paymentId}`, data);
}

export async function updateScore(id: string, data: { attendanceScore?: number; midtermScore?: number; finalScore?: number }): Promise<void> {
  await apiPut(`/scores/${id}`, data);
}

export async function addCartItem(data: { courseId: string; userId: string }): Promise<void> {
  await apiPost('/carts', data);
}

export async function removeCartItem(cartId: string): Promise<void> {
  await apiDelete(`/carts/${cartId}`);
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
  
  const data = await res.json();
  if (data.code !== 1000) {
    throw new Error(data.message || 'Upload failed');
  }
  return data.result;
}
