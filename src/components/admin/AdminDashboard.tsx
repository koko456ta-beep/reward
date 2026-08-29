import React from 'react';
import { 
  Trophy, 
  Globe2, 
  Star, 
  Flag, 
  Award as AwardIcon, 
  PlusCircle, 
  FileSpreadsheet, 
  Users, 
  ArrowUpRight, 
  Clock, 
  CheckCircle,
  Building2,
  Sparkles,
  GraduationCap,
  Coins
} from 'lucide-react';
import { Award, AppUser, DepartmentId } from '../../types';
import { DEPARTMENTS, AWARD_LEVELS } from '../../data/mockData';

interface AdminDashboardProps {
  currentUser: AppUser;
  awards: Award[];
  onSelectAward: (award: Award) => void;
  onNavigateTab: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  awards,
  onSelectAward,
  onNavigateTab
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  
  // Filter awards based on user role
  const userAwards = isSuperAdmin 
    ? awards.filter(a => !a.deleted)
    : awards.filter(a => !a.deleted && a.department === currentUser.department);

  const totalCount = userAwards.length;
  const publishedCount = userAwards.filter(a => a.status === 'published').length;
  const pendingCount = userAwards.filter(a => a.status === 'pending').length;
  const internationalCount = userAwards.filter(a => a.level === 'international').length;
  const nationalCount = userAwards.filter(a => a.level === 'national').length;
  const regionalCount = userAwards.filter(a => a.level === 'regional' || a.level === 'provincial').length;

  // Level Distribution
  const levelCounts: Record<string, number> = {};
  Object.keys(AWARD_LEVELS).forEach(lvl => {
    levelCounts[lvl] = userAwards.filter(a => a.level === lvl).length;
  });

  // Department Distribution (for Super Admin)
  const deptCounts: Record<string, number> = {};
  Object.keys(DEPARTMENTS).forEach(deptId => {
    deptCounts[deptId] = awards.filter(a => !a.deleted && a.department === deptId).length;
  });

  // Recent 5 awards
  const recentAwards = [...userAwards].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isSuperAdmin ? 'แดชบอร์ดภาพรวมผู้ดูแลระบบสูงสุด (Super Admin)' : `แดชบอร์ดฝ่าย: ${DEPARTMENTS[currentUser.department]?.name}`}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            ยินดีต้อนรับคุณ {currentUser.displayName} — ตรวจสอบและจัดการผลงานรางวัลของสถานศึกษา
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('add_award')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>บันทึกผลงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ผลงานทั้งหมด</span>
            <Trophy className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">เผยแพร่แล้ว {publishedCount} รายการ</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ระดับนานาชาติ</span>
            <Globe2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{internationalCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">International Level</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ระดับชาติ</span>
            <Flag className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{nationalCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">National Level</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ระดับภาค/จังหวัด</span>
            <AwardIcon className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{regionalCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Regional & Provincial</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">รอการอนุมัติ</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Pending Approval</p>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Distribution Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4 flex items-center justify-between">
            <span>การกระจายตัวตามระดับรางวัล</span>
            <span className="text-xs text-slate-400 font-normal">ทั้งหมด {totalCount} รายการ</span>
          </h3>

          <div className="space-y-3">
            {Object.values(AWARD_LEVELS).map((lvl) => {
              const count = levelCounts[lvl.id] || 0;
              const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

              return (
                <div key={lvl.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lvl.color }} />
                      {lvl.name}
                    </span>
                    <span className="text-slate-600 font-semibold">{count} รายการ ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: lvl.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Breakdown (Super Admin) or Highlights */}
        {isSuperAdmin ? (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4 flex items-center justify-between">
              <span>สถิติผลงานแบ่งตาม 5 ฝ่ายหลัก</span>
              <span className="text-xs text-slate-400 font-normal">Super Admin View</span>
            </h3>

            <div className="space-y-3">
              {Object.values(DEPARTMENTS).map((dept) => {
                const count = deptCounts[dept.id] || 0;
                const totalAll = awards.filter(a => !a.deleted).length;
                const percent = totalAll > 0 ? Math.round((count / totalAll) * 100) : 0;

                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                        {dept.name} ({dept.shortName})
                      </span>
                      <span className="text-slate-600 font-semibold">{count} ผลงาน ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: dept.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2">
                ฝ่าย: {DEPARTMENTS[currentUser.department]?.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {DEPARTMENTS[currentUser.department]?.description}
              </p>
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 space-y-1">
                <p className="font-semibold">หมวดหมู่ระบบคลังผลงาน:</p>
                <p className="font-medium text-[11px] text-blue-700">ฝ่าย{DEPARTMENTS[currentUser.department]?.name} (คลังเกียรติบัตรและผลงานดิจิทัล)</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">ผลงานทั้งหมดของฝ่าย: {totalCount} รายการ</span>
              <button
                onClick={() => onNavigateTab('awards')}
                className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                ดูรายการทั้งหมด <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Awards Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              ผลงานและรางวัลที่บันทึกล่าสุด
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">5 รายการล่าสุดในระบบ</p>
          </div>
          <button
            onClick={() => onNavigateTab('awards')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            ดูทั้งหมด ({totalCount}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">ชื่อรางวัล</th>
                <th className="py-3 px-4">ผู้ได้รับรางวัล</th>
                <th className="py-3 px-4">ฝ่าย</th>
                <th className="py-3 px-4">ระดับ</th>
                <th className="py-3 px-4">ปีการศึกษา</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAwards.map((award) => {
                const dept = DEPARTMENTS[award.department];
                const levelInfo = AWARD_LEVELS[award.level];

                return (
                  <tr key={award.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[280px] truncate">
                      {award.awardName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate">
                      {award.recipientName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {dept?.shortName || award.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelInfo?.badgeText || 'bg-slate-100'}`}>
                        {levelInfo?.name || award.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {award.academicYear}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectAward(award)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        ดูข้อมูล
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
