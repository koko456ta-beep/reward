import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Award as AwardIcon, 
  Trophy,
  Globe2, 
  Flag, 
  Building2, 
  Users, 
  Coins, 
  GraduationCap, 
  Sparkles,
  Download,
  Printer,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Award, DepartmentId, AwardLevel, SystemSettings } from '../types';
import { DEPARTMENTS, AWARD_LEVELS, INITIAL_SETTINGS } from '../data/mockData';
import { exportAwardsToCSV, triggerPrint } from '../lib/exportUtils';

interface PublicReportsViewProps {
  awards: Award[];
  settings?: SystemSettings;
  onSelectDepartment?: (dept: DepartmentId | 'all') => void;
}

export const PublicReportsView: React.FC<PublicReportsViewProps> = ({
  awards = [],
  settings = INITIAL_SETTINGS,
  onSelectDepartment
}) => {
  const safeSettings = settings || INITIAL_SETTINGS;
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'all'>('all');

  const publishedAwards = useMemo(() => {
    return (Array.isArray(awards) ? awards : []).filter(a => !a.deleted && a.status === 'published');
  }, [awards]);

  // Extract unique academic years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    publishedAwards.forEach(a => {
      if (a.academicYear) set.add(a.academicYear);
    });
    return Array.from(set).sort().reverse();
  }, [publishedAwards]);

  // Filtered dataset for statistics
  const filteredAwards = useMemo(() => {
    return publishedAwards.filter(a => {
      if (selectedYear !== 'all' && a.academicYear !== selectedYear) return false;
      if (selectedDept !== 'all' && a.department !== selectedDept) return false;
      return true;
    });
  }, [publishedAwards, selectedYear, selectedDept]);

  // Department Distribution
  const deptStats = useMemo(() => {
    return Object.entries(DEPARTMENTS).map(([deptId, dept]) => {
      const count = filteredAwards.filter(a => a.department === deptId).length;
      const percentage = filteredAwards.length > 0 ? Math.round((count / filteredAwards.length) * 100) : 0;
      return {
        id: deptId as DepartmentId,
        ...dept,
        count,
        percentage
      };
    });
  }, [filteredAwards]);

  // Level Distribution
  const levelStats = useMemo(() => {
    return Object.entries(AWARD_LEVELS).map(([levelKey, level]) => {
      const count = filteredAwards.filter(a => a.level === levelKey).length;
      const percentage = filteredAwards.length > 0 ? Math.round((count / filteredAwards.length) * 100) : 0;
      return {
        key: levelKey as AwardLevel,
        ...level,
        count,
        percentage
      };
    });
  }, [filteredAwards]);

  // Recipient Type Distribution
  const recipientTypeStats = useMemo(() => {
    const studentCount = filteredAwards.filter(a => a.recipientType === 'student').length;
    const teacherCount = filteredAwards.filter(a => a.recipientType === 'teacher').length;
    const staffCount = filteredAwards.filter(a => a.recipientType === 'staff').length;
    const institutionCount = filteredAwards.filter(a => a.recipientType === 'institution').length;

    return [
      { label: 'นักเรียน', count: studentCount, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
      { label: 'ครูและอาจารย์', count: teacherCount, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
      { label: 'เจ้าหน้าที่ / บุคลากร', count: staffCount, color: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
      { label: 'สถานศึกษา (โรงเรียน)', count: institutionCount, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' }
    ];
  }, [filteredAwards]);

  const handleExportCSV = () => {
    exportAwardsToCSV(
      filteredAwards,
      `รายงานสถิติผลงาน_${safeSettings.schoolName}_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Building2': return <Building2 className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      case 'Coins': return <Coins className="w-4 h-4" />;
      default: return <AwardIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Executive Reports & Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              สถิติและรายงานสรุปผลงานสถานศึกษา
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-light">
              ศูนย์รวมข้อมูลสถิติผลสัมฤทธิ์ การจัดอันดับรางวัล และรายงานผลการดำเนินงาน 5 ฝ่ายหลัก สำหรับการประกันคุณภาพและประเมินสถานศึกษา
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ส่งออก Excel (CSV)</span>
            </button>
            <button
              onClick={triggerPrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงาน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">ตัวกรองข้อมูล:</span>
          
          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800"
          >
            <option value="all">ทุกปีการศึกษา</option>
            {availableYears.map(year => (
              <option key={year} value={year}>ปีการศึกษา {year}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800"
          >
            <option value="all">ทุกฝ่ายงาน (5 ฝ่าย)</option>
            {Object.values(DEPARTMENTS).map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          แสดงข้อมูลจาก <strong className="text-blue-600">{filteredAwards.length}</strong> รายการรางวัลที่เผยแพร่
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">รางวัลทั้งหมด</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{filteredAwards.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">ผลงานที่ได้รับการรับรอง</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/30 shadow-xs">
          <p className="text-xs font-bold text-rose-600 uppercase">ระดับชาติ & นานาชาติ</p>
          <p className="text-3xl font-bold text-rose-700 mt-2">
            {filteredAwards.filter(a => a.level === 'national' || a.level === 'international').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">ผลงานระดับสูงสุด</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 uppercase">นักเรียนที่ได้รับรางวัล</p>
          <p className="text-3xl font-bold text-emerald-700 mt-2">
            {filteredAwards.filter(a => a.recipientType === 'student').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">ผลสัมฤทธิ์ผู้เรียน</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 shadow-xs">
          <p className="text-xs font-bold text-blue-600 uppercase">ครูและบุคลากร</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">
            {filteredAwards.filter(a => a.recipientType === 'teacher' || a.recipientType === 'staff').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">การพัฒนาวิชาชีพ</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>การกระจายผลงานตาม 5 ฝ่ายงานหลัก</span>
            </h3>
            <span className="text-xs text-slate-400">สัดส่วนร้อยละ (%)</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {deptStats.map(dept => (
              <div 
                key={dept.id}
                onClick={() => onSelectDepartment && onSelectDepartment(dept.id)}
                className="space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    <span style={{ color: dept.color }}>{getDeptIcon(dept.iconName)}</span>
                    <span>{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{dept.count} ผลงาน</span>
                    <span className="text-slate-400 font-mono text-xs">({dept.percentage}%)</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${dept.percentage}%`,
                      backgroundColor: dept.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level Distribution Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>จำแนกตามระดับรางวัล (International to School)</span>
            </h3>
            <span className="text-xs text-slate-400">ระดับความสำเร็จ</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {levelStats.map(lvl => (
              <div key={lvl.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${lvl.badgeBg}`}>
                      {lvl.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{lvl.count} รางวัล</span>
                    <span className="text-slate-400 font-mono text-xs">({lvl.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-700 rounded-full transition-all duration-500"
                    style={{ width: `${lvl.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recipient breakdown & Official statement */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>จำแนกตามกลุ่มผู้ได้รับรางวัล (Student / Teacher / Staff)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recipientTypeStats.map(item => (
            <div key={item.label} className={`p-4 rounded-2xl border border-slate-100 ${item.bg}`}>
              <span className={`text-xs font-bold ${item.text}`}>{item.label}</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{item.count}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">รางวัลที่ได้รับ</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
