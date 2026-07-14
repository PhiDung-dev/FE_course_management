import React, { createContext, useContext, useState, useCallback, useEffect, useReducer, useRef } from 'react';
import type { User, UserRole } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function authHeaders() {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function decodeJWT(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

type AuthAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'UPDATE_USER'; payload: User };

function authReducer(state: User[], action: AuthAction): User[] {
  switch (action.type) {
    case 'SET_USERS':
      return action.payload;
    case 'ADD_USER':
      return [...state, action.payload];
    case 'DELETE_USER':
      return state.filter(u => u.id !== action.payload);
    case 'UPDATE_USER':
      return state.map(u => u.id === action.payload.id ? action.payload : u);
    default:
      return state;
  }
}

async function fetchUsers(): Promise<User[]> {
  try {
    const [usersRes, accountsRes] = await Promise.all([
      fetch(`${API}/users`),
      fetch(`${API}/accounts`),
    ]);
    const usersJson = await usersRes.json();
    const accountsJson = await accountsRes.json();
    const usersList = (usersJson.result ?? []) as unknown[];
    const accountsList = (accountsJson.result ?? []) as unknown[];

    return accountsList.map((acc) => {
      const accObj = acc as { id?: string; username?: string; role?: { roleName?: string }; };
      const userData = (usersList as unknown[]).find(u => {
        const uObj = u as { account?: { id?: string } };
        return uObj.account?.id === accObj.id;
      }) as { id?: string; fullName?: string; email?: string; phoneNumber?: string; avatar?: string } | undefined;

      const role: UserRole = accObj.role?.roleName === 'ADMIN' ? 'admin' : accObj.role?.roleName === 'TEACHER' ? 'teacher' : 'student';
      return {
        id: userData?.id || accObj.id || '',
        accountId: accObj.id || '',
        name: userData?.fullName || accObj.username || '',
        email: userData?.email || accObj.username || '',
        password: '',
        role,
        phone: userData?.phoneNumber || '',
        avatar: userData?.avatar || '',
        createdAt: '',
      };
    });
  } catch {
    return [];
  }
}

interface AuthContextValue {
  currentUser: User | null;
  token: string | null;
  users: User[];
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  register: (name: string, email: string, password: string, phone?: string) => Promise<string | null>;
  updateProfile: (id: string, data: Partial<User>) => Promise<void>;
  updatePassword: (id: string, currentPassword: string, newPassword: string) => Promise<string | null>;
  isRole: (...roles: UserRole[]) => boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, rawDispatch] = useReducer(authReducer, []);
  const usersRef = useRef(users);
  usersRef.current = users;

  useEffect(() => {
    fetchUsers().then(users => {
      rawDispatch({ type: 'SET_USERS', payload: users });
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = users.find(u => u.email === parsed.email);
          if (updated && (updated.id !== parsed.id || updated.name !== parsed.name)) {
            setCurrentUser(updated);
            localStorage.setItem('currentUser', JSON.stringify(updated));
          }
        } catch { /* ignore */ }
      }
    });
  }, []);

  const dispatch = useCallback(async (action: AuthAction) => {
    switch (action.type) {
      case 'ADD_USER': {
        if (action.payload.role === 'teacher') {
          const accRes = await fetch(`${API}/accounts/teachers`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ username: action.payload.email, password: action.payload.password || '123456' }),
          });
          const accJson = await accRes.json();
          if (accJson.code !== 1000) throw new Error(accJson.message || 'Tạo tài khoản thất bại');
          if (accJson.result?.id) {
            const userRes = await fetch(`${API}/users`, {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({
                fullName: action.payload.name,
                email: action.payload.email,
                phoneNumber: action.payload.phone || '',
                address: '',
                dateOfBirth: null,
                accountId: accJson.result.id,
              }),
            });
            const userJson = await userRes.json();
            if (userJson.code !== 1000) throw new Error(userJson.message || 'Tạo hồ sơ thất bại');
          }
          const allUsers = await fetchUsers();
          rawDispatch({ type: 'SET_USERS', payload: allUsers });
        }
        return;
      }
      case 'DELETE_USER': {
        try {
          const res = await fetch(`${API}/users/${action.payload}`, { method: 'DELETE', headers: authHeaders() });
          const json = await res.json();
          if (json.code !== 1000) throw new Error(json.message || 'Xoá thất bại');
        } catch {
          // fallback: try deleting by accountId
          const user = usersRef.current.find(u => u.id === action.payload);
          if (user?.accountId) {
            try {
              await fetch(`${API}/users/${user.accountId}`, { method: 'DELETE', headers: authHeaders() });
            } catch { /* ignore */ }
          }
        }
        const allUsers = await fetchUsers();
        rawDispatch({ type: 'SET_USERS', payload: allUsers });
        return;
      }
      default:
        rawDispatch(action);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      const json = await res.json();
      if (json.code !== 1000) return json.message || 'Đăng nhập thất bại';
      const jwt: string = json.result.token;
      setToken(jwt);
      localStorage.setItem('token', jwt);
      const decoded = decodeJWT(jwt);
      const username: string = decoded?.sub || email;
      let allUsers = await fetchUsers();
      let current = allUsers.find(u => u.email === username);
      if (current && current.id === current.accountId) {
        try {
          const userRes = await fetch(`${API}/users`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              fullName: current.name,
              email: current.email,
              phoneNumber: current.phone || '',
              address: '',
              dateOfBirth: null,
              accountId: current.accountId,
            }),
          });
          const userJson = await userRes.json();
          if (userJson.code === 1000) {
            allUsers = await fetchUsers();
            dispatch({ type: 'SET_USERS', payload: allUsers });
            current = allUsers.find(u => u.email === username) || current;
          }
        } catch { /* ignore */ }
      }
      dispatch({ type: 'SET_USERS', payload: allUsers });
      if (current) {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.avatar) {
              current = { ...current, avatar: parsed.avatar };
            }
          } catch { /* ignore */ }
        }
        setCurrentUser(current);
        localStorage.setItem('currentUser', JSON.stringify(current));
      }
      return null;
    } catch {
      return 'Không thể kết nối đến server';
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      const json = await res.json();
      if (json.code !== 1000) return json.message || 'Đăng ký thất bại';
      if (json.result?.id) {
        await fetch(`${API}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: name,
            email,
            phoneNumber: phone || '',
            address: '',
            dateOfBirth: null,
            accountId: json.result.id,
          }),
        });
      }
      const allUsers = await fetchUsers();
      dispatch({ type: 'SET_USERS', payload: allUsers });
      return null;
    } catch {
      return 'Không thể kết nối đến server';
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (id: string, data: Partial<User>) => {
    try {
      const current = users.find(u => u.id === id);

      const res = await fetch(`${API}/users/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          fullName: data.name ?? current?.name,
          email: current?.email ?? data.email,
          phoneNumber: data.phone ?? current?.phone,
          address: '',
          dateOfBirth: null,
          avatar: data.avatar ?? current?.avatar ?? '',
        }),
      });

      const json = await res.json();
      if (json.code !== 1000) throw new Error(json.message || 'Cập nhật thất bại');

      const updated = { ...current, ...data } as User;
      setCurrentUser(prev => (prev?.id === id ? updated : prev));
      localStorage.setItem('currentUser', JSON.stringify(updated));
      const allUsers = await fetchUsers();
      rawDispatch({ type: 'SET_USERS', payload: allUsers });
    } catch {
      throw new Error('Update profile failed');
    }
  }, [users]);

  const updatePassword = useCallback(async (id: string, currentPassword: string, newPassword: string): Promise<string | null> => {
    const accountId = users.find(u => u.id === id)?.accountId || id;
    try {
      const res = await fetch(`${API}/accounts/password/${accountId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.code !== 1000) return json.message || 'Đổi mật khẩu thất bại';
      return null;
    } catch {
      return 'Không thể kết nối đến server';
    }
  }, [users]);

  const isRole = useCallback((...roles: UserRole[]) => {
    return !!currentUser && roles.includes(currentUser.role);
  }, [currentUser]);

  const refreshUsers = useCallback(async () => {
    const allUsers = await fetchUsers();
    rawDispatch({ type: 'SET_USERS', payload: allUsers });
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const updated = allUsers.find(u => u.email === parsed.email);
        if (updated) {
          setCurrentUser(updated);
          localStorage.setItem('currentUser', JSON.stringify(updated));
        }
      } catch { /* ignore */ }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, token, users, dispatch, login, logout, register, updateProfile, updatePassword, isRole, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}