import React, { useState, useEffect, useMemo } from 'react';
import { Award, AppUser, DepartmentId, AwardLevel, AwardFilterState, SystemSettings, ActivityLog, AwardStatus } from './types';
import { 
  getAwards, 
  saveAward, 
  deleteAward, 
  getSystemSettings, 
  saveSystemSettings, 
  getUsers, 
  saveUser, 
  updateUser, 
  getActivityLogs, 
  logActivity,
  subscribeToAwards,
  subscribeToSettings,
  subscribeToLogs,
  subscribeToUsers
} from './lib/storage';
import { INITIAL_USERS } from './data/mockData';

// Public Components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatsCounter } from './components/StatsCounter';
import { HallOfFame } from './components/HallOfFame';
import { FilterBar } from './components/FilterBar';
import { AwardCard } from './components/AwardCard';
import { AwardDetailModal } from './components/AwardDetailModal';
import { LoginModal } from './components/LoginModal';
import { AboutView } from './components/AboutView';
import { EPortfolioHub } from './components/EPortfolioHub';
import { PublicReportsView } from './components/PublicReportsView';
import { Footer } from './components/Footer';

// Admin Components
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AwardsTable } from './components/admin/AwardsTable';
import { AwardFormModal } from './components/admin/AwardFormModal';
import { UserManagement } from './components/admin/UserManagement';
import { ActivityLogView } from './components/admin/ActivityLogView';
import { ReportsExportView } from './components/admin/ReportsExportView';
import { SystemSettingsView } from './components/admin/SystemSettingsView';
import { DocsArchitectureView } from './components/admin/DocsArchitectureView';

export function App() {
  // Global App States
  const [awards, setAwards] = useState<Award[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Navigation & View States
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'about' | 'portfolio' | 'reports'>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Auth State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Selected Award for View Modal & Edit Modal
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [isAwardFormOpen, setIsAwardFormOpen] = useState(false);

  // Public Filter States
  const [filters, setFilters] = useState<AwardFilterState>({
    search: '',
    department: 'all',
    level: 'all',
    academicYear: 'all',
    featuredOnly: false,
    sortBy: 'newest'
  });

  // Load initial data and subscribe to real-time Firestore updates
  useEffect(() => {
    // Initial local cache hydration
    setAwards(getAwards());
    setUsers(getUsers());
    setSettings(getSystemSettings());
    setLogs(getActivityLogs());

    // Setup real-time cloud sync listeners
    const unsubAwards = subscribeToAwards((updatedAwards) => {
      setAwards(updatedAwards);
    });

    const unsubSettings = subscribeToSettings((updatedSettings) => {
      setSettings(updatedSettings);
    });

    const unsubLogs = subscribeToLogs((updatedLogs) => {
      setLogs(updatedLogs);
    });

    const unsubUsers = subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
    });

    return () => {
      unsubAwards();
      unsubSettings();
      unsubLogs();
      unsubUsers();
    };
  }, []);

  // Filtered Awards for Public View
  const publicAwards = useMemo(() => {
    const safeAwards = Array.isArray(awards) ? awards : [];
    return safeAwards.filter(award => {
      if (!award) return false;
      // Must not be deleted
      if (award.deleted) return false;

      // Must be published in public view
      if (award.status !== 'published') return false;

      // Department Filter
      if (filters.department !== 'all' && award.department !== filters.department) {
        return false;
      }

      // Level Filter
      if (filters.level !== 'all' && award.level !== filters.level) {
        return false;
      }

      // Academic Year Filter
      if (filters.academicYear !== 'all' && award.academicYear !== filters.academicYear) {
        return false;
      }

      // Featured Only Filter
      if (filters.featuredOnly && !award.featured) {
        return false;
      }

      // Search query filter (Name, Recipient, Organizer, Tags)
      if (filters.search?.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchName = award.awardName?.toLowerCase().includes(q);
        const matchRecipient = award.recipientName?.toLowerCase().includes(q);
        const matchOrganizer = award.organizer?.toLowerCase().includes(q);
        const matchTags = award.tags?.some(t => t.toLowerCase().includes(q));

        if (!matchName && !matchRecipient && !matchOrganizer && !matchTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.awardDate).getTime() - new Date(a.awardDate).getTime();
      }
      if (filters.sortBy === 'oldest') {
        return new Date(a.awardDate).getTime() - new Date(b.awardDate).getTime();
      }
      if (filters.sortBy === 'name') {
        return (a.awardName || '').localeCompare(b.awardName || '', 'th');
      }
      return 0;
    });
  }, [awards, filters]);

  // Featured awards for Hall of Fame
  const featuredAwards = useMemo(() => {
    const safeAwards = Array.isArray(awards) ? awards : [];
    return safeAwards.filter(a => a && !a.deleted && a.status === 'published' && a.featured);
  }, [awards]);

  // Public Search Handlers
  const handleSelectDepartment = (dept: DepartmentId | 'all') => {
    setFilters(prev => ({ ...prev, department: dept }));
    setCurrentView('public');
  };

  const handleSelectLevel = (level: AwardLevel | 'all') => {
    setFilters(prev => ({ ...prev, level }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      department: 'all',
      level: 'all',
      academicYear: 'all',
      featuredOnly: false,
      sortBy: 'newest'
    });
  };

  // Auth Handlers
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentView('admin');
    logActivity({
      userId: user.uid,
      userName: user.displayName,
      userRole: user.role,
      department: user.department,
      action: 'login',
      details: `ผู้ใช้ ${user.displayName} เข้าสู่ระบบ`
    });
    setLogs(getActivityLogs());
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('public');
  };

  const handleQuickSwitchUser = (username: string) => {
    const target = INITIAL_USERS.find(u => u.username === username);
    if (target) {
      setCurrentUser(target);
    }
  };

  // Award CRUD Handlers
  const handleOpenAddAward = () => {
    setEditingAward(null);
    setIsAwardFormOpen(true);
  };

  const handleOpenEditAward = (award: Award) => {
    setEditingAward(award);
    setIsAwardFormOpen(true);
  };

  const handleSaveAwardSubmit = async (awardData: Partial<Award>) => {
    const isNew = !editingAward;
    const awardToSave: Award = {
      id: editingAward ? editingAward.id : 'award_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      awardName: awardData.awardName || '',
      recipientName: awardData.recipientName || '',
      recipientType: awardData.recipientType || 'student',
      department: awardData.department || 'academic',
      level: awardData.level || 'national',
      academicYear: awardData.academicYear || '2569',
      awardDate: awardData.awardDate || new Date().toISOString().slice(0, 10),
      organizer: awardData.organizer || '',
      description: awardData.description || '',
      certificateUrl: awardData.certificateUrl || '',
      certificateFileId: awardData.certificateFileId || '',
      imageUrl: awardData.imageUrl || '',
      imageFileId: awardData.imageFileId || '',
      status: awardData.status || 'published',
      featured: awardData.featured || false,
      allowDownload: awardData.allowDownload !== false,
      tags: awardData.tags || [],
      driveFolder: awardData.driveFolder || 'ผลงานโรงเรียน/เกียรติบัตร',
      createdBy: currentUser ? currentUser.uid : 'system',
      createdByName: currentUser ? currentUser.displayName : 'ระบบ',
      createdAt: editingAward ? editingAward.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false
    };

    await saveAward(awardToSave);
    setAwards(getAwards());

    // Log Activity
    await logActivity({
      userId: currentUser?.uid || 'system',
      userName: currentUser?.displayName || 'เจ้าหน้าที่',
      userRole: currentUser?.role || 'academic_admin',
      department: awardToSave.department,
      action: isNew ? 'create' : 'update',
      recordId: awardToSave.id,
      recordTitle: awardToSave.awardName,
      details: isNew ? `บันทึกผลงานใหม่ "${awardToSave.awardName}"` : `แก้ไขข้อมูลผลงาน "${awardToSave.awardName}"`
    });
    setLogs(getActivityLogs());
  };

  const handleDeleteAward = async (awardId: string) => {
    const target = awards.find(a => a.id === awardId);
    await deleteAward(awardId);
    setAwards(getAwards());

    if (target) {
      await logActivity({
        userId: currentUser?.uid || 'system',
        userName: currentUser?.displayName || 'เจ้าหน้าที่',
        userRole: currentUser?.role || 'super_admin',
        department: target.department,
        action: 'delete',
        recordId: target.id,
        recordTitle: target.awardName,
        details: `ลบผลงาน "${target.awardName}" (ย้ายไปถังขยะ)`
      });
      setLogs(getActivityLogs());
    }
  };

  const handleToggleFeatured = async (awardId: string) => {
    const target = awards.find(a => a.id === awardId);
    if (!target) return;

    const updated: Award = {
      ...target,
      featured: !target.featured,
      updatedAt: new Date().toISOString()
    };

    await saveAward(updated);
    setAwards(getAwards());

    await logActivity({
      userId: currentUser?.uid || 'system',
      userName: currentUser?.displayName || 'เจ้าหน้าที่',
      userRole: currentUser?.role || 'academic_admin',
      department: target.department,
      action: 'featured_toggle',
      recordId: target.id,
      recordTitle: target.awardName,
      details: `${updated.featured ? 'ปักหมุด' : 'ยกเลิกปักหมุด'} ผลงานเด่น "${target.awardName}"`
    });
    setLogs(getActivityLogs());
  };

  const handleToggleStatus = async (awardId: string, newStatus: AwardStatus) => {
    const target = awards.find(a => a.id === awardId);
    if (!target) return;

    const updated: Award = {
      ...target,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    await saveAward(updated);
    setAwards(getAwards());

    await logActivity({
      userId: currentUser?.uid || 'system',
      userName: currentUser?.displayName || 'เจ้าหน้าที่',
      userRole: currentUser?.role || 'super_admin',
      department: target.department,
      action: 'approve',
      recordId: target.id,
      recordTitle: target.awardName,
      details: `เปลี่ยนสถานะผลงาน "${target.awardName}" เป็น ${newStatus}`
    });
    setLogs(getActivityLogs());
  };

  // User Management Handlers (Super Admin)
  const handleAddUser = (newUser: AppUser) => {
    saveUser(newUser);
    setUsers(getUsers());
    logActivity({
      userId: currentUser?.uid || 'system',
      userName: currentUser?.displayName || 'Super Admin',
      userRole: 'super_admin',
      department: 'all',
      action: 'create',
      details: `สร้างบัญชีผู้ใช้ใหม่: ${newUser.displayName} (${newUser.role})`
    });
    setLogs(getActivityLogs());
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    updateUser(updatedUser);
    setUsers(getUsers());
    logActivity({
      userId: currentUser?.uid || 'system',
      userName: currentUser?.displayName || 'Super Admin',
      userRole: 'super_admin',
      department: 'all',
      action: 'update',
      details: `อัปเดตข้อมูลผู้ใช้: ${updatedUser.displayName}`
    });
    setLogs(getActivityLogs());
  };

  // Settings Handler
  const handleSaveSettings = (newSettings: SystemSettings) => {
    saveSystemSettings(newSettings);
    setSettings(newSettings);
    logActivity({
      userId: currentUser?.uid || 'system',
      userName: currentUser?.displayName || 'Super Admin',
      userRole: 'super_admin',
      department: 'all',
      action: 'settings_update',
      details: `บันทึกการตั้งค่าระบบและข้อมูลสถานศึกษา`
    });
    setLogs(getActivityLogs());
  };

  // RENDER ADMIN VIEW
  if (currentView === 'admin' && currentUser) {
    return (
      <AdminLayout
        currentUser={currentUser}
        settings={settings}
        activeTab={adminTab}
        setActiveTab={setAdminTab}
        onLogout={handleLogout}
        onGoToPublic={() => setCurrentView('public')}
        onQuickSwitchUser={handleQuickSwitchUser}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            currentUser={currentUser}
            awards={awards}
            onSelectAward={setSelectedAward}
            onNavigateTab={setAdminTab}
          />
        )}

        {adminTab === 'awards' && (
          <AwardsTable
            currentUser={currentUser}
            awards={awards}
            onSelectAward={setSelectedAward}
            onEditAward={handleOpenEditAward}
            onDeleteAward={handleDeleteAward}
            onToggleFeatured={handleToggleFeatured}
            onToggleStatus={handleToggleStatus}
            onOpenAddModal={handleOpenAddAward}
          />
        )}

        {adminTab === 'add_award' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs max-w-4xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">บันทึกผลงานรางวัลใหม่</h2>
            <p className="text-xs text-slate-500 mb-6">กรอกข้อมูลและอัปโหลดไฟล์ภาพเกียรติบัตรเข้าสู่ระบบคลังผลงาน</p>
            <button
              onClick={handleOpenAddAward}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md"
            >
              เปิดหน้าต่างบันทึกผลงาน
            </button>
          </div>
        )}

        {adminTab === 'reports' && (
          <ReportsExportView
            awards={awards}
            currentUser={currentUser}
            settings={settings}
          />
        )}

        {adminTab === 'logs' && (
          <ActivityLogView
            logs={logs}
            currentUser={currentUser}
          />
        )}

        {adminTab === 'users' && currentUser.role === 'super_admin' && (
          <UserManagement
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {adminTab === 'settings' && currentUser.role === 'super_admin' && (
          <SystemSettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            awards={awards}
          />
        )}

        {adminTab === 'docs' && (
          <DocsArchitectureView />
        )}

        {/* Global Modals in Admin */}
        <AwardDetailModal
          award={selectedAward}
          onClose={() => setSelectedAward(null)}
          settings={settings}
          onSelectDepartment={handleSelectDepartment}
        />

        <AwardFormModal
          isOpen={isAwardFormOpen}
          onClose={() => setIsAwardFormOpen(false)}
          onSubmit={handleSaveAwardSubmit}
          initialAward={editingAward}
          currentUser={currentUser}
        />
      </AdminLayout>
    );
  }

  // RENDER PUBLIC VIEW & ABOUT VIEW
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        settings={settings}
        activeView={currentView}
        setActiveView={setCurrentView}
        activeDepartment={filters.department}
        onSelectDepartment={handleSelectDepartment}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onGoToAbout={() => setCurrentView('about')}
        onGoToPortfolio={() => setCurrentView('portfolio')}
        onGoToReports={() => setCurrentView('reports')}
        currentUser={currentUser}
        onGoToAdmin={() => setCurrentView('admin')}
        searchQuery={filters.search}
        setSearchQuery={(q) => setFilters(prev => ({ ...prev, search: q }))}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'about' && (
          <AboutView settings={settings} />
        )}

        {currentView === 'portfolio' && (
          <div className="py-8">
            <EPortfolioHub
              awards={awards}
              settings={settings}
              onSelectAward={setSelectedAward}
              onSelectDepartment={handleSelectDepartment}
            />
          </div>
        )}

        {currentView === 'reports' && (
          <div className="py-8">
            <PublicReportsView
              awards={awards}
              settings={settings}
              onSelectDepartment={handleSelectDepartment}
            />
          </div>
        )}

        {currentView === 'public' && (
          <div className="space-y-12 pb-16">
            {/* Hero Section */}
            <HeroSection
              settings={settings}
              awards={awards}
              selectedDepartment={filters.department}
              searchQuery={filters.search}
              setSearchQuery={(q) => setFilters(prev => ({ ...prev, search: q }))}
              onExplore={() => {
                const el = document.getElementById('awards-catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectDepartment={handleSelectDepartment}
            />

            {/* Live Statistics Counter Bar */}
            <StatsCounter awards={awards} />

            {/* Hall of Fame Highlights (Only when viewing all or when featured exist) */}
            {featuredAwards.length > 0 && filters.department === 'all' && (
              <HallOfFame
                awards={featuredAwards}
                onSelectAward={setSelectedAward}
              />
            )}

            {/* Main Catalog & Search Section */}
            <section id="awards-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {filters.department === 'all' 
                      ? 'คลังผลงานและรางวัลทั้งหมดของโรงเรียน' 
                      : `ผลงานและรางวัลฝ่าย: ${filters.department}`}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    แสดงผลงานที่ได้รับการบันทึกและตรวจสอบอย่างเป็นทางการ
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  พบทั้งหมด <strong className="text-blue-600">{publicAwards.length}</strong> รายการ
                </span>
              </div>

              {/* Real-time Filter & Search Bar */}
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={handleResetFilters}
              />

              {/* Awards Grid Cards */}
              {publicAwards.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    🔍
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    ไม่พบผลงานที่ตรงกับเงื่อนไขการค้นหา
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    ลองปรับคำค้นหา หรือกดปุ่ม "ล้างตัวกรองทั้งหมด" เพื่อดูรายการผลงานทั้งหมด
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {publicAwards.map((award) => (
                    <AwardCard
                      key={award.id}
                      award={award}
                      onSelectAward={setSelectedAward}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onSelectDepartment={handleSelectDepartment}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onGoToAbout={() => setCurrentView('about')}
        onGoToPortfolio={() => setCurrentView('portfolio')}
        onGoToReports={() => setCurrentView('reports')}
      />

      {/* Global Modals */}
      <AwardDetailModal
        award={selectedAward}
        onClose={() => setSelectedAward(null)}
        settings={settings}
        onSelectDepartment={handleSelectDepartment}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
export default App;
