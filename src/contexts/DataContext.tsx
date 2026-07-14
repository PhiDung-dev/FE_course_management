import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { Course, Classroom, Schedule, Enrollment, Payment, Rating, Score } from '../types';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id?: string;
  courseId: string;
  studentId: string;
}

interface DataState {
  courses: Course[];
  classrooms: Classroom[];
  schedules: Schedule[];
  enrollments: Enrollment[];
  payments: Payment[];
  ratings: Rating[];
  scores: Score[];
  cart: CartItem[];
}

type DataAction =
  | { type: 'SET_ALL'; payload: DataState }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'ADD_CLASSROOM'; payload: Classroom }
  | { type: 'UPDATE_CLASSROOM'; payload: Classroom }
  | { type: 'DELETE_CLASSROOM'; payload: string }
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'DELETE_SCHEDULE'; payload: string }
  | { type: 'ADD_ENROLLMENT'; payload: Enrollment }
  | { type: 'UPDATE_ENROLLMENT'; payload: Enrollment }
  | { type: 'DELETE_ENROLLMENT'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'DELETE_PAYMENT'; payload: string }
  | { type: 'ADD_RATING'; payload: Rating }
  | { type: 'UPDATE_RATING'; payload: Rating }
  | { type: 'DELETE_RATING'; payload: string }
  | { type: 'ADD_SCORE'; payload: Score }
  | { type: 'UPDATE_SCORE'; payload: Score }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { courseId: string; studentId: string } }
  | { type: 'CLEAR_CART'; payload: { studentId: string } }
  | { type: 'ADD_ENROLLMENT_LOCAL'; payload: Enrollment }
  | { type: 'ADD_PAYMENT_LOCAL'; payload: Payment }
  | { type: 'ADD_SCORE_LOCAL'; payload: Score }
  | { type: 'ADD_RATING_LOCAL'; payload: Rating };

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_ALL':
      return action.payload;
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return { ...state, courses: state.courses.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_COURSE':
      return { ...state, courses: state.courses.filter(c => c.id !== action.payload) };
    case 'ADD_CLASSROOM':
      return { ...state, classrooms: [...state.classrooms, action.payload] };
    case 'UPDATE_CLASSROOM':
      return { ...state, classrooms: state.classrooms.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'DELETE_CLASSROOM':
      return { ...state, classrooms: state.classrooms.filter(r => r.id !== action.payload) };
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };
    case 'UPDATE_SCHEDULE':
      return { ...state, schedules: state.schedules.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SCHEDULE':
      return { ...state, schedules: state.schedules.filter(s => s.id !== action.payload) };
    case 'ADD_ENROLLMENT':
      return { ...state, enrollments: [...state.enrollments, action.payload] };
    case 'UPDATE_ENROLLMENT':
      return { ...state, enrollments: state.enrollments.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_ENROLLMENT':
      return { ...state, enrollments: state.enrollments.filter(e => e.id !== action.payload) };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    case 'UPDATE_PAYMENT':
      return { ...state, payments: state.payments.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PAYMENT':
      return { ...state, payments: state.payments.filter(p => p.id !== action.payload) };
    case 'ADD_RATING':
      return { ...state, ratings: [...state.ratings, action.payload] };
    case 'ADD_SCORE':
      return { ...state, scores: [...state.scores, action.payload] };
    case 'UPDATE_SCORE':
      return { ...state, scores: state.scores.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => !(item.courseId === action.payload.courseId && item.studentId === action.payload.studentId)) };
    case 'CLEAR_CART':
      return { ...state, cart: state.cart.filter(item => item.studentId !== action.payload.studentId) };
    case 'ADD_ENROLLMENT_LOCAL':
      return { ...state, enrollments: [...state.enrollments, action.payload] };
    case 'ADD_PAYMENT_LOCAL':
      return { ...state, payments: [...state.payments, action.payload] };
    case 'ADD_SCORE_LOCAL':
      return { ...state, scores: [...state.scores, action.payload] };
    case 'ADD_RATING_LOCAL':
      return { ...state, ratings: [...state.ratings, action.payload] };
    default:
      return state;
  }
}

interface DataContextValue extends DataState {
  dispatch: (action: DataAction) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, refreshUsers } = useAuth();
  const [state, rawDispatch] = useReducer(dataReducer, {
    courses: [],
    classrooms: [],
    schedules: [],
    enrollments: [],
    payments: [],
    ratings: [],
    scores: [],
    cart: [],
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  function loadLocal<T>(key: string): T[] {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }
  function saveLocal(key: string, data: unknown[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  const refreshAll = useCallback(async () => {
    if (!localStorage.getItem('db_cleared')) {
      ['enrollments','payments','scores','ratings'].forEach(k => localStorage.removeItem(k));
      localStorage.setItem('db_cleared', 'true');
    }

    const safeFetch = <T,>(fn: () => Promise<T>): Promise<T | null> =>
      fn().catch(() => null);

    const [schedules, classrooms, enrollments, payments, ratings, scores] = await Promise.all([
      safeFetch(() => api.fetchAllSchedules()),
      safeFetch(() => api.fetchAllClassrooms()),
      safeFetch(() => api.fetchAllEnrollments()),
      safeFetch(() => api.fetchAllPayments()),
      safeFetch(() => api.fetchAllRatings()),
      safeFetch(() => api.fetchAllScores()),
    ]);

    const courses = await safeFetch(() => api.fetchAllCourses(schedules || []));

    let cart: CartItem[] = [];
    if (currentUser?.id) {
      cart = (await safeFetch(() => api.fetchCartItems(currentUser.id))) || [];
    }

    rawDispatch({
      type: 'SET_ALL',
      payload: {
        courses: courses || [],
        classrooms: classrooms || [],
        schedules: schedules || [],
        enrollments: enrollments || [],
        payments: payments || [],
        ratings: ratings || [],
        scores: scores || [],
        cart,
      },
    });
  }, [currentUser?.id]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const dispatch = useCallback(async (action: DataAction) => {
    const s = stateRef.current;
    try {
      switch (action.type) {
        case 'ADD_COURSE': {
          await api.createCourse({
            title: action.payload.name,
            description: action.payload.description,
            slot: action.payload.maxStudents,
            price: action.payload.price,
            duration: action.payload.duration,
            level: action.payload.level,
            category: action.payload.category,
            teacherId: action.payload.teacherId || undefined,
            image: action.payload.image,
            documents: action.payload.documents,
          });
          const schedules = await api.fetchAllSchedules();
          const courses = await api.fetchAllCourses(schedules);
          rawDispatch({ type: 'SET_ALL', payload: { ...s, courses } });
          return;
        }
        case 'UPDATE_COURSE': {
          await api.updateCourse(action.payload.id, {
            title: action.payload.name,
            description: action.payload.description,
            slot: action.payload.maxStudents,
            price: action.payload.price,
            duration: action.payload.duration,
            level: action.payload.level,
            category: action.payload.category,
            teacherId: action.payload.teacherId || undefined,
            image: action.payload.image,
            documents: action.payload.documents,
          });
          rawDispatch(action);
          return;
        }
        case 'DELETE_COURSE': {
          await api.deleteCourse(action.payload);
          rawDispatch(action);
          return;
        }
        case 'ADD_CLASSROOM': {
          await api.createClassroom({
            name: action.payload.name,
            capacity: action.payload.capacity,
            location: action.payload.location,
            equipment: action.payload.equipment,
            status: action.payload.status.toUpperCase(),
          });
          const classrooms = await api.fetchAllClassrooms();
          rawDispatch({ type: 'SET_ALL', payload: { ...s, classrooms } });
          return;
        }
        case 'UPDATE_CLASSROOM': {
          await api.updateClassroom(action.payload.id, {
            name: action.payload.name,
            capacity: action.payload.capacity,
            location: action.payload.location,
            equipment: action.payload.equipment,
            status: action.payload.status.toUpperCase(),
          });
          rawDispatch(action);
          return;
        }
        case 'DELETE_CLASSROOM': {
          await api.deleteClassroom(action.payload);
          rawDispatch(action);
          return;
        }
        case 'ADD_SCHEDULE': {
          const toApiTime = (t: string) => (t.length === 5 ? `${t}:00` : t);
          const course = s.courses.find(c => c.id === action.payload.courseId);
          await api.createSchedule({
            startTime: toApiTime(action.payload.startTime),
            endTime: toApiTime(action.payload.endTime),
            dayOfWeek: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][action.payload.dayOfWeek],
            startDate: action.payload.startDate,
            endDate: action.payload.endDate,
            slot: course?.maxStudents || 20,
            classRoomId: action.payload.classroomId,
            courseId: action.payload.courseId,
            teacherId: action.payload.teacherId,
          });
          const schedules = await api.fetchAllSchedules();
          rawDispatch({ type: 'SET_ALL', payload: { ...s, schedules } });
          return;
        }
        case 'UPDATE_SCHEDULE': {
          const toApiTime = (t: string) => (t.length === 5 ? `${t}:00` : t);
          const course = s.courses.find(c => c.id === action.payload.courseId);
          await api.updateSchedule(action.payload.id, {
            startTime: toApiTime(action.payload.startTime),
            endTime: toApiTime(action.payload.endTime),
            dayOfWeek: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][action.payload.dayOfWeek],
            startDate: action.payload.startDate,
            endDate: action.payload.endDate,
            slot: course?.maxStudents || 20,
            classRoomId: action.payload.classroomId,
            courseId: action.payload.courseId,
            teacherId: action.payload.teacherId,
          });
          rawDispatch(action);
          return;
        }
        case 'DELETE_SCHEDULE': {
          await api.deleteSchedule(action.payload);
          rawDispatch(action);
          return;
        }
        case 'ADD_ENROLLMENT': {
          const schedule = s.schedules.find(sh => sh.courseId === action.payload.courseId);
          if (schedule) {
            try {
              await api.createBooking({
                description: '',
                scheduleId: schedule.id,
                userId: action.payload.studentId,
              });
            } catch { /* API failed, use local state */ }
          }
          rawDispatch(action);
          return;
        }
        case 'ADD_ENROLLMENT_LOCAL': {
          rawDispatch(action);
          saveLocal('enrollments', [...s.enrollments.filter(e => e.id.startsWith('local-')), action.payload]);
          return;
        }
        case 'ADD_SCORE_LOCAL': {
          rawDispatch(action);
          saveLocal('scores', [...s.scores.filter(sc => sc.id.startsWith('local-')), action.payload]);
          return;
        }
        case 'ADD_RATING_LOCAL': {
          rawDispatch(action);
          saveLocal('ratings', [...s.ratings.filter(r => r.id.startsWith('local-')), action.payload]);
          return;
        }
        case 'UPDATE_ENROLLMENT': {
          if (action.payload.status === 'cancelled') {
            try {
              await api.deleteBooking(action.payload.id);
            } catch { /* API failed, use local state */ }
          }
          rawDispatch(action);
          return;
        }
        case 'ADD_PAYMENT': {
          let bookingId = action.payload.enrollmentId;
          if (!bookingId) {
            const schedule = s.schedules.find(sh => sh.courseId === action.payload.courseId);
            if (!schedule) {
              throw new Error("Môn học chưa được phân lịch, không thể đăng ký");
            }
            try {
              const booking = await api.createBooking({
                description: '',
                scheduleId: schedule.id,
                userId: action.payload.studentId,
              });
              bookingId = booking.id;
            } catch (err: any) {
              throw new Error("Lỗi tạo hóa đơn đặt chỗ: " + err.message);
            }
          }
          const createdPayment = await api.createPayment({ bookingId }) as any;
          if (action.payload.status === 'paid' && createdPayment && createdPayment.id) {
             await api.updatePaymentStatus(createdPayment.id, 'SUCCESS');
          }
          const payments = await api.fetchAllPayments();
          rawDispatch({ type: 'SET_ALL', payload: { ...s, payments } });
          return;
        }
        case 'ADD_PAYMENT_LOCAL': {
          rawDispatch(action);
          saveLocal('payments', [...s.payments.filter(p => p.id.startsWith('local-')), action.payload]);
          return;
        }
        case 'UPDATE_PAYMENT': {
          const statusMap: Record<string, string> = { paid: 'SUCCESS', pending: 'PENDING', refunded: 'CANCELLED' };
          await api.updatePaymentStatus(action.payload.id, statusMap[action.payload.status] || 'SUCCESS');
          const payments = await api.fetchAllPayments();
          rawDispatch({ type: 'SET_ALL', payload: { ...s, payments } });
          return;
        }
        case 'DELETE_PAYMENT': {
          await api.deletePayment(action.payload);
          rawDispatch(action);
          return;
        }
        case 'ADD_RATING': {
          try {
            const payment = s.payments.find(
              p => p.courseId === action.payload.courseId && p.studentId === action.payload.studentId
            );
            if (payment) {
              await api.createRating({
                score: action.payload.stars,
                comment: action.payload.comment,
                paymentId: payment.id,
              });
            }
          } catch { /* API failed */ }
          rawDispatch(action);
          return;
        }
        case 'UPDATE_RATING': {
          try {
            await api.updateRating(action.payload.id, {
              score: action.payload.stars,
              comment: action.payload.comment,
            });
          } catch { /* API failed */ }
          const ratings = await api.fetchAllRatings();
          rawDispatch({ type: 'SET_ALL', payload: { ...s, ratings } });
          return;
        }
        case 'DELETE_RATING': {
          try {
            await api.deleteRating(action.payload);
          } catch { /* API failed */ }
          const ratings = await api.fetchAllRatings();
          rawDispatch({ type: 'SET_ALL', payload: { ...s, ratings } });
          return;
        }
        case 'ADD_SCORE': {
          const existingScore = s.scores.find(sc => sc.enrollmentId === action.payload.enrollmentId);
          if (existingScore) {
            try {
              await api.updateScore(existingScore.id, {
                attendanceScore: action.payload.regular,
                midtermScore: action.payload.midterm,
                finalScore: action.payload.final,
              });
            } catch { /* API failed */ }
            rawDispatch({ type: 'UPDATE_SCORE', payload: { ...action.payload, id: existingScore.id } });
          } else {
            try {
              const payment = s.payments.find(p => p.enrollmentId === action.payload.enrollmentId);
              if (payment) {
                await api.createScore(payment.id, {
                  attendanceScore: action.payload.regular,
                  midtermScore: action.payload.midterm,
                  finalScore: action.payload.final,
                });
              }
            } catch { /* API failed */ }
            rawDispatch(action);
          }
          return;
        }
        case 'UPDATE_SCORE': {
          try {
            await api.updateScore(action.payload.id, {
              attendanceScore: action.payload.regular,
              midtermScore: action.payload.midterm,
              finalScore: action.payload.final,
            });
          } catch { /* API failed */ }
          rawDispatch(action);
          return;
        }
        case 'ADD_TO_CART': {
          await api.addCartItem({
            courseId: action.payload.courseId,
            userId: action.payload.studentId,
          });
          const cart = await api.fetchCartItems(action.payload.studentId);
          rawDispatch({ type: 'SET_ALL', payload: { ...s, cart } });
          await refreshUsers();
          return;
        }
        case 'REMOVE_FROM_CART': {
          const cartItem = s.cart.find(c => c.courseId === action.payload.courseId && c.studentId === action.payload.studentId);
          if (cartItem?.id) {
            await api.removeCartItem(cartItem.id);
          }
          rawDispatch(action);
          return;
        }
        case 'CLEAR_CART': {
          const items = s.cart.filter(c => c.studentId === action.payload.studentId);
          await Promise.all(items.map(item => item.id ? api.removeCartItem(item.id).catch(() => {}) : Promise.resolve()));
          rawDispatch(action);
          return;
        }
        default:
          rawDispatch(action);
      }
    } catch (err) {
      console.error(`Action ${action.type} failed:`, err);
      throw err;
    }
  }, [refreshUsers]);

  return (
    <DataContext.Provider value={{ ...state, dispatch, refreshAll }}>
      {children}
    </DataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}