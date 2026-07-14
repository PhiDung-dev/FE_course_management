import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, GraduationCap, CreditCard, Star, Info, ShoppingCart } from 'lucide-react';
import { useNotify } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const iconMap = {
  enrollment: <GraduationCap size={14} className="text-blue-500" />,
  payment: <CreditCard size={14} className="text-emerald-500" />,
  score: <Star size={14} className="text-amber-500" />,
  system: <Info size={14} className="text-violet-500" />,
  cart: <ShoppingCart size={14} className="text-orange-500" />,
};

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const { notifications, markRead, markAllRead, clearNotifications } = useNotify();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const userId = currentUser?.id || '';
  const role = currentUser?.role || 'student';
  const userNotifications = notifications.filter(n =>
    n.userId === userId || (!n.userId && n.roles.includes(role))
  );
  const userUnread = userNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={18} />
        {userUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
            {userUnread > 9 ? '9+' : userUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Thông báo</h3>
            <div className="flex gap-1">
              {userUnread > 0 && (
                <button onClick={markAllRead} className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Đánh dấu đã đọc">
                  <CheckCheck size={14} />
                </button>
              )}
              <button onClick={() => clearNotifications(userId, role)} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors" title="Xoá tất cả">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {userNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Không có thông báo</div>
            ) : (
              userNotifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                >
                  <div className="mt-0.5 flex-shrink-0">{iconMap[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
