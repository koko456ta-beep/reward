import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  LogIn, 
  LogOut, 
  LayoutDashboard, 
  GraduationCap, 
  Sparkles, 
  Building2, 
  Users, 
  Coins, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Info,
  Award as AwardIcon
} from 'lucide-react';
import { AppUser, DepartmentId, SystemSettings } from '../types';
import { DEPARTMENTS } from '../data/mockData';

interface NavbarProps {
  currentUser: AppUser | null;
  settings: SystemSettings;
  activeView?: 'public' | 'admin' | 'about' | 'portfolio' | 'reports';
  setActiveView?: (view: 'public' | 'admin' | 'about' | 'portfolio' | 'reports') => void;
  selectedDepartment?: DepartmentId | 'all';
  setSelectedDepartment?: (dept: DepartmentId | 'all') => void;
  activeDepartment?: DepartmentId | 'all';
  onSelectDepartment?: (dept: DepartmentId | 'all') => void;
  onOpenLogin: () => void;
  onLogout?: () => void;
  onQuickSwitchUser?: (username: string) => void;
  onGoToAbout?: () => void;
  onGoToAdmin?: () => void;
  onGoToPortfolio?: () => void;
  onGoToReports?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  settings,
  activeView = 'public',
  setActiveView,
  selectedDepartment,
  setSelectedDepartment,
  activeDepartment,
  onSelectDepartment,
  onOpenLogin,
  onLogout,
  onQuickSwitchUser,
  onGoToAbout,
  onGoToAdmin,
  onGoToPortfolio,
  onGoToReports,
  searchQuery = '',
  setSearchQuery
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

  const currentDept = activeDepartment || selectedDepartment || 'all';

  const handleSelectDept = (dept: DepartmentId | 'all') => {
    if (onSelectDepartment) onSelectDepartment(dept);
    if (setSelectedDepartment) setSelectedDepartment(dept);
    if (setActiveView) setActiveView('public');
    setDeptDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleNavigateView = (view: 'public' | 'admin' | 'about' | 'portfolio' | 'reports') => {
    if (view === 'about' && onGoToAbout) onGoToAbout();
    else if (view === 'admin' && onGoToAdmin) onGoToAdmin();
    else if (view === 'portfolio' && onGoToPortfolio) onGoToPortfolio();
    else if (view === 'reports' && onGoToReports) onGoToReports();
    else if (setActiveView) setActiveView(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      {/* Top Notice Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-white">{settings?.schoolName || 'โรงเรียน'}</span>
            <span className="hidden sm:inline text-slate-400">| {settings?.schoolMotto || 'คลังผลงานและรางวัล'}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-slate-400 text-xs hidden md:inline">ระบบจัดเก็บและเผยแพร่ผลงานรางวัล</span>
            {currentUser && (
              <span className="bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 border border-indigo-700/50">
                <ShieldCheck className="w-3 h-3 text-indigo-300" />
                {currentUser.role === 'super_admin' ? 'Super Admin' : DEPARTMENTS[currentUser.department]?.shortName || currentUser.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & School Name */}
          <div 
            id="nav-brand"
            onClick={() => handleSelectDept('all')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                {settings?.schoolLogoUrl ? (
                  <img
                    src={settings.schoolLogoUrl}
                    alt={settings.schoolName || 'School Logo'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Trophy className="w-6 h-6 text-amber-500" />
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-blue-700 transition-colors">
                  คลังผลงานและรางวัล
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  5 ฝ่าย
                </span>
              </div>
              <span className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-[320px]">
                {settings?.schoolName || 'โรงเรียน'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-home-btn"
              onClick={() => handleSelectDept('all')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'public' && currentDept === 'all'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              หน้าแรก
            </button>

            {/* Department Dropdown */}
            <div className="relative">
              <button
                id="nav-dept-dropdown-btn"
                onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentDept !== 'all' && activeView === 'public'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>ผลงาน 5 ฝ่าย</span>
                {currentDept !== 'all' && (
                  <span className="px-1.5 py-0.2 rounded text-xs bg-blue-200 text-blue-900 font-bold">
                    {DEPARTMENTS[currentDept]?.shortName}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${deptDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {deptDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setDeptDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleSelectDept('all')}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 ${
                      currentDept === 'all' ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <AwardIcon className="w-4 h-4 text-slate-400" />
                      ทุกฝ่าย (ผลงานทั้งหมด)
                    </span>
                  </button>
                  <div className="my-1 border-t border-slate-100"></div>
                  {Object.values(DEPARTMENTS).map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => handleSelectDept(dept.id)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        currentDept === dept.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: dept.color }}
                      />
                      <div className="flex flex-col">
                        <span>{dept.name}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{dept.shortName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              id="nav-portfolio-btn"
              onClick={() => handleNavigateView('portfolio')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'portfolio'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              แฟ้มสะสมงาน (E-Portfolio)
            </button>

            <button
              id="nav-reports-btn"
              onClick={() => handleNavigateView('reports')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'reports'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              สถิติและรายงาน
            </button>

            <button
              id="nav-about-btn"
              onClick={() => handleNavigateView('about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'about'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              เกี่ยวกับระบบ
            </button>
          </nav>

          {/* Search bar & Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search */}
            {setSearchQuery && (
              <div className="relative hidden md:block w-48 xl:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อรางวัล, ผู้รับ..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeView !== 'public' && setActiveView) setActiveView('public');
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-400 rounded-lg outline-none transition-all"
                />
              </div>
            )}

            {/* Auth / Admin Action */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-medium transition-colors"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.displayName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500"
                  />
                  <div className="flex flex-col text-left max-w-[110px] sm:max-w-[160px] truncate hidden sm:block">
                    <span className="font-semibold text-slate-900 text-xs truncate leading-tight">{currentUser.displayName.split(' ')[0]}</span>
                    <span className="text-[10px] text-blue-600 truncate">
                      {currentUser.role === 'super_admin' ? 'Super Admin' : DEPARTMENTS[currentUser.department]?.shortName || currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs text-slate-500 font-medium">เข้าสู่ระบบในฐานะ</p>
                      <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{currentUser.displayName}</p>
                      <p className="text-xs text-slate-500">{currentUser.email}</p>
                    </div>

                    <div className="p-1">
                      <button
                        id="nav-go-admin-btn"
                        onClick={() => handleNavigateView('admin')}
                        className={`w-full text-left px-3.5 py-2 rounded-lg text-sm flex items-center gap-2.5 ${
                          activeView === 'admin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span>ระบบจัดการหลังบ้าน (Dashboard)</span>
                      </button>

                      <button
                        onClick={() => handleNavigateView('public')}
                        className={`w-full text-left px-3.5 py-2 rounded-lg text-sm flex items-center gap-2.5 ${
                          activeView === 'public' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>กลับไปหน้าเว็บไซต์สาธารณะ</span>
                      </button>
                    </div>

                    {/* Quick Switch demo accounts for instant evaluation */}
                    {onQuickSwitchUser && (
                      <div className="px-3 py-2 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          สลับบัญชีทดสอบฝ่าย (Quick Switch)
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <button
                            onClick={() => { onQuickSwitchUser('super_admin'); setUserDropdownOpen(false); }}
                            className="px-2 py-1 bg-slate-100 hover:bg-indigo-100 text-slate-700 rounded text-left truncate text-[11px]"
                          >
                            👑 Super Admin
                          </button>
                          <button
                            onClick={() => { onQuickSwitchUser('academic_admin'); setUserDropdownOpen(false); }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-left truncate text-[11px]"
                          >
                            📘 ฝ่ายวิชาการ
                          </button>
                          <button
                            onClick={() => { onQuickSwitchUser('affairs_admin'); setUserDropdownOpen(false); }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-left truncate text-[11px]"
                          >
                            ✨ ฝ่ายกิจการ
                          </button>
                          <button
                            onClick={() => { onQuickSwitchUser('general_admin'); setUserDropdownOpen(false); }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-left truncate text-[11px]"
                          >
                            🏫 ฝ่ายทั่วไป
                          </button>
                          <button
                            onClick={() => { onQuickSwitchUser('personnel_admin'); setUserDropdownOpen(false); }}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-left truncate text-[11px]"
                          >
                            👥 ฝ่ายบุคคล
                          </button>
                          <button
                            onClick={() => { onQuickSwitchUser('budget_admin'); setUserDropdownOpen(false); }}
                            className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded text-left truncate text-[11px]"
                          >
                            💰 ฝ่ายงบประมาณ
                          </button>
                        </div>
                      </div>
                    )}

                    {onLogout && (
                      <div className="pt-1 border-t border-slate-100 p-1">
                        <button
                          id="nav-logout-btn"
                          onClick={() => {
                            onLogout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>ออกจากระบบ (Logout)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-btn-modal"
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบเจ้าหน้าที่</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="space-y-1">
            <button
              onClick={() => handleSelectDept('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentDept === 'all' && activeView === 'public' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
              }`}
            >
              หน้าแรก (ผลงานทั้งหมด)
            </button>
            <div className="pl-2 pt-1 pb-1">
              <p className="text-xs font-semibold text-slate-400 px-2 py-1">เลือกดูตามฝ่าย</p>
              {Object.values(DEPARTMENTS).map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleSelectDept(dept.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs flex items-center gap-2 ${
                    currentDept === dept.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                  {dept.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleNavigateView('portfolio')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeView === 'portfolio' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
              }`}
            >
              แฟ้มสะสมงาน (E-Portfolio)
            </button>
            <button
              onClick={() => handleNavigateView('reports')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeView === 'reports' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
              }`}
            >
              สถิติและรายงาน
            </button>
            <button
              onClick={() => handleNavigateView('about')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeView === 'about' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
              }`}
            >
              เกี่ยวกับระบบ
            </button>

            {currentUser && (
              <button
                onClick={() => handleNavigateView('admin')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 flex items-center gap-2 mt-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                เข้าสู่ระบบจัดการหลังบ้าน
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
