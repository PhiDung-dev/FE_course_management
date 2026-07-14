import { useState } from 'react';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotify } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';

type Tab = 'profile' | 'password';

const roleLabel: Record<string, string> = {
  admin: 'Quản trị viên',
  teacher: 'Giáo viên',
  student: 'Học sinh',
};

const roleColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-emerald-100 text-emerald-700',
};

export default function ProfilePage() {
  const { currentUser, updateProfile, updatePassword } = useAuth();
  const { addNotification } = useNotify();
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile form state — khởi tạo từ currentUser
  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [avatar, setAvatar] = useState(currentUser?.avatar ?? '');
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password form state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSaveProfile = async () => {
    if (!name) return;
    try {
      await updateProfile(currentUser!.id, { name, phone, avatar });
      setProfileMsg({ ok: true, text: 'Cập nhật thông tin thành công!' });
      addToast('success', 'Cập nhật thông tin cá nhân thành công!');
      addNotification('Cập nhật hồ sơ', 'Thông tin cá nhân đã được cập nhật', 'system', ['admin', 'teacher', 'student'], currentUser?.id);
      setTimeout(() => setProfileMsg(null), 3000);
    } catch {
      setProfileMsg({ ok: false, text: 'Cập nhật thất bại. Vui lòng thử lại!' });
      addToast('error', 'Cập nhật thất bại. Vui lòng thử lại!');
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  const handleChangePassword = async () => {
    setPassMsg(null);
    if (newPass.length < 6) {
      setPassMsg({ ok: false, text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ ok: false, text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    const err = await updatePassword(currentUser!.id, currentPass, newPass);
    if (err) {
      setPassMsg({ ok: false, text: err });
      addToast('error', err);
      return;
    }
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setPassMsg({ ok: true, text: 'Đổi mật khẩu thành công!' });
    addToast('success', 'Đổi mật khẩu thành công!');
    addNotification('Đổi mật khẩu', 'Mật khẩu đã được thay đổi thành công', 'system', ['admin', 'teacher', 'student'], currentUser?.id);
    setTimeout(() => setPassMsg(null), 3000);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tài khoản của tôi</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {/* User card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex items-center gap-4">
        {(avatar || currentUser?.avatar) ? (
          <img
            src={avatar || currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100"
            onError={e => { (e.target as HTMLImageElement).src = ''; }}
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {currentUser?.name[0]}
          </div>
        )}
        <div>
          <h2 className="font-semibold text-gray-800 text-lg">{currentUser?.name}</h2>
          <p className="text-gray-500 text-sm">{currentUser?.email}</p>
          <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor[currentUser?.role ?? '']}`}>
            {roleLabel[currentUser?.role ?? '']}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {([['profile', <User size={14} />, 'Thông tin'], ['password', <Lock size={14} />, 'Mật khẩu']] as const).map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {tab === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="label">Họ và tên</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input value={currentUser?.email} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
            </div>
            <div>
              <label className="label">Số điện thoại</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="09xxxxxxxx" />
            </div>
            <div>
              <label className="label">Ảnh đại diện (URL)</label>
              <input value={avatar} onChange={e => setAvatar(e.target.value)} className="input" placeholder="https://images.pexels.com/..." />
            </div>
            {profileMsg && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${profileMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {profileMsg.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {profileMsg.text}
              </div>
            )}
            <button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
              Lưu thay đổi
            </button>
          </div>
        )}

        {tab === 'password' && (
          <div className="space-y-4">
            <div>
              <label className="label">Mật khẩu hiện tại</label>
              <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="input" placeholder="••••••" />
            </div>
            <div>
              <label className="label">Mật khẩu mới</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="input" placeholder="Ít nhất 6 ký tự" />
            </div>
            <div>
              <label className="label">Xác nhận mật khẩu mới</label>
              <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="input" placeholder="Nhập lại mật khẩu" />
            </div>
            {passMsg && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${passMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {passMsg.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {passMsg.text}
              </div>
            )}
            <button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
              Đổi mật khẩu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
