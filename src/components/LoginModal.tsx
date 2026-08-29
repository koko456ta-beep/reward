import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles, 
  Building2, 
  Users, 
  Coins, 
  Key, 
  User, 
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { AppUser, DepartmentId, SystemSettings } from '../types';
import { INITIAL_USERS, DEPARTMENTS } from '../data/mockData';
import { googleSignIn } from '../lib/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AppUser) => void;
  settings?: SystemSettings;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const showDemoLogin = settings?.enableDemoLogin !== false;

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      const result = await googleSignIn();
      if (result && result.user) {
        // Map Google User to AppUser with Super Admin permissions or Department Admin
        const googleUser: AppUser = {
          uid: result.user.uid,
          username: result.user.email?.split('@')[0] || 'google_user',
          displayName: result.user.displayName || result.user.email || 'ผู้ใช้ Google',
          email: result.user.email || '',
          role: 'super_admin', // Default to super_admin for creator or admin
          department: 'all',
          avatarUrl: result.user.photoURL || undefined,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        onLogin(googleUser);
        onClose();
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setError(err?.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found = INITIAL_USERS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() || 
           u.email.toLowerCase() === username.trim().toLowerCase()
    );

    if (found) {
      onLogin(found);
      onClose();
    } else {
      setError('ไม่พบบัญชีผู้ใช้นี้ กรุณาตรวจสอบชื่อผู้ใช้หรืออีเมล');
    }
  };

  const handleSelectQuickAccount = (user: AppUser) => {
    onLogin(user);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                เข้าสู่ระบบเจ้าหน้าที่
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                สำหรับผู้ดูแลระบบและคณะทำงานทั้ง 5 ฝ่าย
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Quick Demo One-Click Logins (Shown only when enabled in settings) */}
          {showDemoLogin ? (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  เลือกสิทธิ์เข้าใช้งานทันที (One-Click Demo)
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">
                  เปิดใช้งานโดยแอดมิน
                </span>
              </div>

              <div className="space-y-2">
                {/* Super Admin */}
                <button
                  id="login-quick-super-admin"
                  onClick={() => handleSelectQuickAccount(INITIAL_USERS[0])}
                  className="w-full text-left p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      SA
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        Super Admin (ผู้อำนวยการ / ผู้ดูแลสูงสุด)
                      </p>
                      <p className="text-[11px] text-indigo-700">
                        จัดการได้ทุกฝ่าย, เพิ่มผู้ใช้, อนุมัติผลงาน, ดูรายงานรวม
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 5 Department Admins */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {INITIAL_USERS.slice(1).map((usr) => {
                    const dept = DEPARTMENTS[usr.department];
                    return (
                      <button
                        key={usr.uid}
                        id={`login-quick-${usr.username}`}
                        onClick={() => handleSelectQuickAccount(usr)}
                        className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-white transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: dept?.color }} 
                          />
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 text-xs truncate">
                              Admin {dept?.shortName}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {usr.displayName.split(' ')[0]}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>โหมด One-Click Demo ถูกปิดการใช้งานโดยผู้ดูแลระบบ กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div>
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm text-slate-700 shadow-xs group disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              )}
              <span>{googleLoading ? 'กำลังเข้าสู่ระบบด้วย Google...' : 'เข้าสู่ระบบด้วย Google'}</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-4 text-xs text-slate-400">หรือ เข้าสู่ระบบด้วยรหัสผ่าน</span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ชื่อผู้ใช้งาน หรือ อีเมล
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="เช่น super_admin หรือ academic_admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
