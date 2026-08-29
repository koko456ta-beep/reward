import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  PlusCircle, 
  Users, 
  History, 
  FileSpreadsheet, 
  Settings, 
  BookOpen, 
  LogOut, 
  ArrowLeft, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  Building2,
  GraduationCap,
  Coins
} from 'lucide-react';
import { AppUser, DepartmentId, SystemSettings } from '../../types';
import { DEPARTMENTS, INITIAL_SETTINGS } from '../../data/mockData';

export type AdminTab = 
  | 'dashboard'
  | 'awards'
  | 'add_award'
  | 'logs'
  | 'reports'
  | 'users'
  | 'settings'
  | 'docs';

interface AdminLayoutProps {
  currentUser: AppUser;
  settings?: SystemSettings;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onGoToPublic: () => void;
  onQuickSwitchUser: (username: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  settings = INITIAL_SETTINGS,
  activeTab,
  setActiveTab,
  onLogout,
  onGoToPublic,
  onQuickSwitchUser,
  children
}) => {
  const safeSettings = settings || INITIAL_SETTINGS;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isSuperAdmin = currentUser.role === 'super_admin';
  const deptInfo = currentUser.department !== 'all' ? DEPARTMENTS[currentUser.department] : null;

  const menuItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'แดชบอร์ดภาพรวม',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowed: true
    },
    {
      id: 'awards' as AdminTab,
      label: 'จัดการข้อมูลผลงาน/รางวัล',
      icon: <Trophy className="w-4 h-4" />,
      allowed: true
    },
    {
      id: 'add_award' as AdminTab,
      label: 'บันทึกผลงานรางวัลใหม่',
      icon: <PlusCircle className="w-4 h-4" />,
      allowed: true
    },
    {
      id: 'reports' as AdminTab,
      label: 'รายงานและการส่งออก',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      allowed: true
    },
    {
      id: 'logs' as AdminTab,
      label: 'ประวัติการทำงาน (Audit Log)',
      icon: <History className="w-4 h-4" />,
      allowed: true
    },
    {
      id: 'users' as AdminTab,
      label: 'จัดการผู้ใช้งาน (5 ฝ่าย)',
      icon: <Users className="w-4 h-4" />,
      allowed: isSuperAdmin,
      badge: isSuperAdmin ? 'Super Admin' : undefined
    },
    {
      id: 'settings' as AdminTab,
      label: 'ตั้งค่าระบบและข้อมูลโรงเรียน',
      icon: <Settings className="w-4 h-4" />,
      allowed: isSuperAdmin,
      badge: isSuperAdmin ? 'Super Admin' : undefined
    },
    {
      id: 'docs' as AdminTab,
      label: 'คู่มือและสถาปัตยกรรมระบบ',
      icon: <BookOpen className="w-4 h-4" />,
      allowed: true
    }
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs font-bold text-amber-300 overflow-hidden p-1 bg-white">
                {safeSettings.schoolLogoUrl ? (
                  <img
                    src={safeSettings.schoolLogoUrl}
                    alt={safeSettings.schoolName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Trophy className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-sm text-white tracking-tight leading-tight">
                  ระบบบริหารจัดการหลังบ้าน
                </p>
                <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                  {safeSettings.schoolName}
                </p>
              </div>
            </div>
          </div>

          {/* User Info & Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Switch Dropdown */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <span className="text-[11px] text-slate-400 px-2 font-medium">สลับฝ่าย:</span>
              <button
                onClick={() => onQuickSwitchUser('super_admin')}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  currentUser.role === 'super_admin' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Super
              </button>
              <button
                onClick={() => onQuickSwitchUser('academic_admin')}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  currentUser.role === 'academic_admin' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                วิชาการ
              </button>
              <button
                onClick={() => onQuickSwitchUser('affairs_admin')}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  currentUser.role === 'affairs_admin' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                กิจการ
              </button>
              <button
                onClick={() => onQuickSwitchUser('general_admin')}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  currentUser.role === 'general_admin' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                ทั่วไป
              </button>
              <button
                onClick={() => onQuickSwitchUser('personnel_admin')}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  currentUser.role === 'personnel_admin' ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                บุคคล
              </button>
              <button
                onClick={() => onQuickSwitchUser('budget_admin')}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  currentUser.role === 'budget_admin' ? 'bg-sky-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                งบประมาณ
              </button>
            </div>

            {/* Back to public */}
            <button
              onClick={onGoToPublic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">หน้าเว็บหลัก</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Active User Card */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                />
                <div className="truncate">
                  <p className="font-bold text-slate-900 text-xs truncate">
                    {currentUser.displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentUser.position || 'เจ้าหน้าที่ผู้ดูแล'}
                  </p>
                </div>
              </div>

              {/* Department Badge */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">สิทธิ์การจัดการ:</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isSuperAdmin 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : deptInfo?.bgColor || 'bg-blue-100 text-blue-800'
                }`}>
                  {isSuperAdmin ? '👑 Super Admin (ทุกฝ่าย)' : deptInfo?.shortName}
                </span>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1">
              {menuItems.filter(item => item.allowed).map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`admin-menu-${item.id}`}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firebase Firestore</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Cloud Sync</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};
