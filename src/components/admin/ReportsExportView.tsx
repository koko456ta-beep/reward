import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  FileText, 
  Calendar, 
  Building2, 
  Trophy, 
  CheckCircle2, 
  Filter,
  Layers
} from 'lucide-react';
import { Award, AppUser, DepartmentId, AwardLevel, SystemSettings } from '../../types';
import { DEPARTMENTS, AWARD_LEVELS, INITIAL_ACADEMIC_YEARS, INITIAL_SETTINGS } from '../../data/mockData';
import { exportAwardsToCSV, triggerPrint } from '../../lib/exportUtils';

interface ReportsExportViewProps {
  awards: Award[];
  currentUser: AppUser;
  settings?: SystemSettings;
}

export const ReportsExportView: React.FC<ReportsExportViewProps> = ({
  awards,
  currentUser,
  settings = INITIAL_SETTINGS
}) => {
  const safeSettings = settings || INITIAL_SETTINGS;
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Filter State for Report
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'all'>(
    isSuperAdmin ? 'all' : (currentUser.department as DepartmentId)
  );
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<AwardLevel | 'all'>('all');

  // Filter data for report
  const reportAwards = awards.filter(award => {
    if (award.deleted) return false;

    if (!isSuperAdmin && award.department !== currentUser.department) {
      return false;
    }

    if (selectedDept !== 'all' && award.department !== selectedDept) {
      return false;
    }

    if (selectedYear !== 'all' && award.academicYear !== selectedYear) {
      return false;
    }

    if (selectedLevel !== 'all' && award.level !== selectedLevel) {
      return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    exportAwardsToCSV(
      reportAwards, 
      `รายงานสรุปผลงาน_${selectedDept}_ปี${selectedYear}_${new Date().toISOString().slice(0,10)}.csv`
    );
  };

  const handlePrintReport = () => {
    triggerPrint();
  };

  // Calculations for Summary
  const countInternational = reportAwards.filter(a => a.level === 'international').length;
  const countNational = reportAwards.filter(a => a.level === 'national').length;
  const countRegional = reportAwards.filter(a => a.level === 'regional').length;
  const countProvincial = reportAwards.filter(a => a.level === 'provincial').length;
  const countDistrict = reportAwards.filter(a => a.level === 'district').length;
  const countSchool = reportAwards.filter(a => a.level === 'school').length;

  return (
    <div className="space-y-6">
      {/* Header (No print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            รายงานและสรุปผลงาน (Reports & Export)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            สร้างรายงานสรุปผลงานรางวัลทางการเพื่อการประเมินสถานศึกษาและการประกันคุณภาพ (SAR / สมศ.)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ดาวน์โหลดไฟล์ Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงานทางการ</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters (No print) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          กำหนดเงื่อนไขการออกรายงาน
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ฝ่ายที่รับผิดชอบ
            </label>
            <select
              value={selectedDept}
              disabled={!isSuperAdmin}
              onChange={(e) => setSelectedDept(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="all">ทุกฝ่าย (รวมผลงานทั้งโรงเรียน)</option>
              {Object.values(DEPARTMENTS).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ปีการศึกษา
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="all">ทุกปีการศึกษา (สะสมทั้งหมด)</option>
              {INITIAL_ACADEMIC_YEARS.map(yr => (
                <option key={yr.id} value={yr.year}>ปีการศึกษา {yr.year}</option>
              ))}
            </select>
          </div>

          {/* Award Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ระดับรางวัล
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="all">ทุกระดับรางวัล</option>
              {Object.values(AWARD_LEVELS).map(lvl => (
                <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Official Printable Report Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Official School Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            แบบรายงานสรุปข้อมูลผลงานและรางวัลเชิดชูเกียรติ
          </h1>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">
            {safeSettings.schoolName}
          </h2>
          <p className="text-xs text-slate-600">
            {selectedDept === 'all' ? 'ข้อมูลรวมทั้ง 5 ฝ่ายหลัก' : `ฝ่าย: ${DEPARTMENTS[selectedDept]?.name}`} | {selectedYear === 'all' ? 'ข้อมูลสะสมทุกปีการศึกษา' : `ปีการศึกษา ${selectedYear}`}
          </p>
          <p className="text-[11px] text-slate-400">
            วันที่พิมพ์เอกสาร: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Summary Metric Matrix */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            ตารางสรุปสถิติจำนวนรางวัลตามระดับ
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-slate-600 font-medium">นานาชาติ</p>
              <p className="text-lg font-bold text-blue-700 mt-1">{countInternational}</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-slate-600 font-medium">ระดับชาติ</p>
              <p className="text-lg font-bold text-rose-700 mt-1">{countNational}</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-slate-600 font-medium">ระดับภาค</p>
              <p className="text-lg font-bold text-purple-700 mt-1">{countRegional}</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-slate-600 font-medium">ระดับจังหวัด</p>
              <p className="text-lg font-bold text-amber-700 mt-1">{countProvincial}</p>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
              <p className="text-slate-600 font-medium">ระดับเขต</p>
              <p className="text-lg font-bold text-teal-700 mt-1">{countDistrict}</p>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
              <p className="text-slate-600 font-medium">รวมทั้งหมด</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{reportAwards.length}</p>
            </div>
          </div>
        </div>

        {/* Detailed Awards List Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            บัญชีรายชื่อผลงานและรางวัลที่ได้รับการบันทึก ({reportAwards.length} รายการ)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300 w-10 text-center">ที่</th>
                  <th className="py-2 px-3 border-r border-slate-300">ชื่อรางวัล / ผลงาน</th>
                  <th className="py-2 px-3 border-r border-slate-300">ผู้ได้รับรางวัล</th>
                  <th className="py-2 px-3 border-r border-slate-300">ฝ่าย</th>
                  <th className="py-2 px-3 border-r border-slate-300">ระดับ</th>
                  <th className="py-2 px-3 border-r border-slate-300">ปีการศึกษา</th>
                  <th className="py-2 px-3">หน่วยงานผู้จัด / มอบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportAwards.map((award, index) => {
                  const dept = DEPARTMENTS[award.department];
                  const levelInfo = AWARD_LEVELS[award.level];

                  return (
                    <tr key={award.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                        {award.awardName}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-800">
                        {award.recipientName}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        {dept?.shortName || award.department}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-semibold">
                        {levelInfo?.name || award.level}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center">
                        {award.academicYear}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {award.organizer || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Blocks for Official Endorsement */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
          <div className="space-y-12">
            <p className="font-semibold text-slate-800">ผู้จัดทำและตรวจสอบรายงาน</p>
            <div className="space-y-1">
              <p className="text-slate-500">ลงชื่อ ............................................................</p>
              <p className="font-medium text-slate-800">({currentUser.displayName})</p>
              <p className="text-slate-500">{currentUser.position || 'เจ้าหน้าที่ผู้ดูแลระบบ'}</p>
            </div>
          </div>

          <div className="space-y-12">
            <p className="font-semibold text-slate-800">ผู้รับรองรายงาน (ผู้อำนวยการสถานศึกษา)</p>
            <div className="space-y-1">
              <p className="text-slate-500">ลงชื่อ ............................................................</p>
              <p className="font-medium text-slate-800">(ดร.สมชาย ปรีชานนท์)</p>
              <p className="text-slate-500">ผู้อำนวยการโรงเรียน</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
