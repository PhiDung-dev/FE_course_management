import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserRole } from '../types';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'enrollment' | 'payment' | 'score' | 'system' | 'cart';
  userId?: string;
  roles: UserRole[];
  read: boolean;
  createdAt: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type: Notification['type'], roles?: UserRole[], userId?: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: (userId?: string, userRole?: UserRole) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((title: string, message: string, type: Notification['type'], roles?: UserRole[], userId?: string) => {
    const id = `n${Date.now()}`;
    setNotifications(prev => [{ id, title, message, type, userId: userId || '', roles: roles || ['admin', 'teacher', 'student'], read: false, createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback((userId?: string, userRole?: UserRole) => {
    if (userId) {
      setNotifications(prev => prev.filter(n => !(n.userId === userId || (!n.userId && n.roles.includes(userRole || 'student')))));
    } else {
      setNotifications([]);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markRead, markAllRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used inside NotificationProvider');
  return ctx;
}
