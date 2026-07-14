export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
  accountId?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  price: number;
  duration: number; // số buổi
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  maxStudents: number;
  image: string;
  status: 'active' | 'inactive';
  documents?: { title: string; url: string }[];
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Schedule {
  id: string;
  courseId: string;
  classroomId: string;
  teacherId: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ... 6=Sat
  startTime: string; // "08:00"
  endTime: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'cancelled';
  slot?: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'cancelled' | 'completed';
}

export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentId: string;
  amount: number;
  method: 'cash' | 'transfer' | 'card';
  status: 'pending' | 'paid' | 'refunded';
  paidAt?: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  studentId: string;
  courseId: string;
  stars: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Score {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentId: string;
  regular?: number;
  midterm?: number;
  final?: number;
  score?: number;
  grade?: string;
  updatedAt: string;
}
