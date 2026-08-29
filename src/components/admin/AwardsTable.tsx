import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Star, 
  CheckCircle, 
  Clock, 
  FileSpreadsheet, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { Award, AppUser, DepartmentId, AwardLevel, AwardStatus } from '../../types';
import { DEPARTMENTS, AWARD_LEVELS } from '../../data/mockData';
import { exportAwardsToCSV, downloadAwardImage } from '../../lib/exportUtils';

interface AwardsTableProps {
  currentUser: AppUser;
  awards: Award[];
  onSelectAward: (award: Award) => void;
  onEditAward: (award: Award) => void;
  onDeleteAward: (awardId: string) => void;
  onToggleFeatured: (awardId: string) => void;
  onToggleStatus: (awardId: string, newStatus: AwardStatus) => void;
  onOpenAddModal: () => void;
}

export const AwardsTable: React.FC<AwardsTableProps> = ({
  currentUser,
  awards,
  onSelectAward,
  onEditAward,
  onDeleteAward,
  onToggleFeatured,
  onToggleStatus,
  onOpenAddModal
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Filters State
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentId | 'all'>(
    isSuperAdmin ? 'all' : (currentUser.department as DepartmentId)
  );
  const [levelFilter, setLevelFilter] = useState<AwardLevel | 'all'>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<AwardStatus | 'all'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete Confirmation State
  const [awardToDelete, setAwardToDelete] = useState<Award | null>(null);

  // Filter awards based on role and table filters
  const filteredAwards = awards.filter(award => {
    if (award.deleted) return false;
    
    // RBAC check: Department Admin can ONLY see/manage their department
    if (!isSuperAdmin && award.department !== currentUser.department) {
      return false;
    }

    if (departmentFilter !== 'all' && award.department !== departmentFilter) {
      return false;
    }

    if (levelFilter !== 'all' && award.level !== levelFilter) {
      return false;
    }

    if (yearFilter !== 'all' && award.academicYear !== yearFilter) {
      return false;
    }

    if (statusFilter !== 'all' && award.status !== statusFilter) {
      return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = award.awardName?.toLowerCase().includes(q);
      const matchRecipient = award.recipientName?.toLowerCase().includes(q);
      const matchOrganizer = award.organizer?.toLowerCase().includes(q);
      const matchTags = award.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchRecipient && !matchOrganizer && !matchTags) {
        return false;
      }
    }

    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAwards.length / pageSize) || 1;
  const paginatedAwards = filteredAwards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Unique Academic Years for Filter
  const availableYears = Array.from(new Set(awards.map(a => a.academicYear).filter(Boolean))).sort().reverse();

  const handleExportCSV = () => {
    exportAwardsToCSV(filteredAwards, `awards_${departmentFilter}_${Date.now()}.csv`);
  };

  const handleConfirmDelete = () => {
    if (awardToDelete) {
      onDeleteAward(awardToDelete.id);
      setAwardToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            จัดการข้อมูลผลงานและรางวัล
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isSuperAdmin 
              ? 'จัดการ เพิ่ม ลบ แก้ไข อนุมัติ และส่งออกข้อมูลผลงานของทุกฝ่าย' 
              : `จัดการข้อมูลเฉพาะฝ่าย: ${DEPARTMENTS[currentUser.department]?.name}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ส่งออก CSV (Excel)</span>
          </button>

          <button
            id="admin-add-award-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผลงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อรางวัล, ผู้รับ, ผู้จัด..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Department Filter (Only for Super Admin) */}
          {isSuperAdmin && (
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value as any); setCurrentPage(1); }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="all">ทุกฝ่าย (ทั้งหมด)</option>
                {Object.values(DEPARTMENTS).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => { setLevelFilter(e.target.value as any); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="all">ทุกระดับรางวัล</option>
              {Object.values(AWARD_LEVELS).map(lvl => (
                <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="all">ทุกปีการศึกษา</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>ปีการศึกษา {yr}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>พบ {filteredAwards.length} รายการ (หน้า {currentPage} / {totalPages})</span>
          <div className="flex items-center gap-2">
            <span>แสดง:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value={10}>10 รายการ</option>
              <option value={25}>25 รายการ</option>
              <option value={50}>50 รายการ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">⭐</th>
                <th className="py-3 px-4">ชื่อผลงาน / รางวัล</th>
                <th className="py-3 px-4">ผู้ได้รับรางวัล</th>
                <th className="py-3 px-4">ฝ่าย</th>
                <th className="py-3 px-4">ระดับ</th>
                <th className="py-3 px-4">ปีการศึกษา</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-center">ภาพเกียรติบัตร</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAwards.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                    <p className="font-medium text-slate-600">ไม่พบข้อมูลผลงานตามเงื่อนไขที่เลือก</p>
                    <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
                  </td>
                </tr>
              ) : (
                paginatedAwards.map((award) => {
                  const dept = DEPARTMENTS[award.department];
                  const levelInfo = AWARD_LEVELS[award.level];

                  return (
                    <tr key={award.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Featured Star Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onToggleFeatured(award.id)}
                          title={award.featured ? 'นำออกจากผลงานเด่น' : 'ปักหมุดเป็นผลงานเด่น (Hall of Fame)'}
                          className={`p-1 rounded-md transition-colors ${
                            award.featured ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-400'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${award.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Award Title */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[260px]">
                        <span 
                          onClick={() => onSelectAward(award)}
                          className="hover:text-blue-600 cursor-pointer line-clamp-2"
                        >
                          {award.awardName}
                        </span>
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4 text-slate-700 max-w-[180px]">
                        <span className="line-clamp-2 font-medium">{award.recipientName}</span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {dept?.shortName || award.department}
                        </span>
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelInfo?.badgeText || 'bg-slate-100'}`}>
                          {levelInfo?.name || award.level}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {award.academicYear}
                      </td>

                      {/* Status Toggle (Super Admin can approve/publish) */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            const next = award.status === 'published' ? 'pending' : 'published';
                            onToggleStatus(award.id, next);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                            award.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {award.status === 'published' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{award.status === 'published' ? 'เผยแพร่แล้ว' : 'รอตรวจสอบ'}</span>
                        </button>
                      </td>

                      {/* Certificate Image Download */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={async () => {
                            const url = award.certificateUrl || award.imageUrl;
                            if (!url) return;
                            const safeName = (award.recipientName || 'ผลงาน').replace(/\s+/g, '_');
                            const safeTitle = (award.awardName || 'เกียรติบัตร').replace(/\s+/g, '_').slice(0, 30);
                            await downloadAwardImage(url, `เกียรติบัตร_${safeName}_${safeTitle}.jpg`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium transition-colors"
                          title="ดาวน์โหลดภาพเกียรติบัตร"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden xl:inline">ดาวน์โหลด</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => onSelectAward(award)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditAward(award)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAwardToDelete(award)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            กำลังแสดง {(currentPage - 1) * pageSize + 1} ถึง {Math.min(currentPage * pageSize, filteredAwards.length)} จากทั้งหมด {filteredAwards.length} รายการ
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-800">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {awardToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ยืนยันการลบผลงานรางวัล?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณกำลังจะลบรายการ <strong className="text-slate-800">"{awardToDelete.awardName}"</strong>
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200">
              ระบบจะทำการย้ายไปยังถังขยะ (Soft Delete) และบันทึกประวัติไว้ใน Audit Log โดย Super Admin สามารถกู้คืนได้
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAwardToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                ยืนยันลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
