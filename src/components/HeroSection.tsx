import React from 'react';
import { 
  Trophy, 
  Search, 
  Sparkles, 
  GraduationCap, 
  Building2, 
  Users, 
  Coins, 
  Award as AwardIcon,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DepartmentId, SystemSettings, Award } from '../types';
import { DEPARTMENTS } from '../data/mockData';

interface HeroSectionProps {
  settings: SystemSettings;
  awards?: Award[];
  selectedDepartment?: DepartmentId | 'all';
  setSelectedDepartment?: (dept: DepartmentId | 'all') => void;
  onSelectDepartment?: (dept: DepartmentId | 'all') => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onExplore?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  awards = [],
  selectedDepartment = 'all',
  setSelectedDepartment,
  onSelectDepartment,
  searchQuery = '',
  setSearchQuery,
  onExplore
}) => {
  const safeAwards = Array.isArray(awards) ? awards : [];
  const handleSelect = (dept: DepartmentId | 'all') => {
    if (setSelectedDepartment) setSelectedDepartment(dept);
    if (onSelectDepartment) onSelectDepartment(dept);
    if (onExplore) onExplore();
  };

  // Count awards per department
  const getDeptCount = (deptId: DepartmentId) => {
    return safeAwards.filter(a => !a.deleted && a.status === 'published' && a.department === deptId).length;
  };

  const totalPublished = safeAwards.filter(a => !a.deleted && a.status === 'published').length;

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Coins': return <Coins className="w-5 h-5" />;
      default: return <AwardIcon className="w-5 h-5" />;
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-10 pb-16 sm:pt-14 sm:pb-20">
      {/* Background Decorative Pattern & Glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* School Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-400 text-xs sm:text-sm font-medium shadow-inner mb-6 backdrop-blur-xs">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-200">{settings?.schoolName || 'โรงเรียน'}</span>
            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
            <span className="text-amber-400 font-semibold">Digital Award Archives</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight sm:leading-snug">
            ผลงานและรางวัลแห่งความภาคภูมิใจ
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            รวบรวมผลงาน เกียรติบัตร และความสำเร็จอันทรงคุณค่าของนักเรียน ครู และบุคลากรของโรงเรียน ครอบคลุมการดำเนินงานทั้ง 5 ฝ่ายหลัก
          </p>

          {/* Hero Search Box */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-xl rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 p-1.5 focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white/15 transition-all">
              <Search className="w-5 h-5 text-slate-300 ml-3.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อรางวัล, ผู้รับรางวัล, ปีการศึกษา..."
                className="w-full bg-transparent px-3.5 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 text-xs text-slate-300 hover:text-white bg-white/10 rounded-lg mr-1 transition-colors"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 5 Departments Quick Navigation Pills */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              จำแนกผลงานตามฝ่าย (5 ฝ่ายหลัก)
            </span>
            <span>{totalPublished} ผลงานที่เผยแพร่</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* All */}
            <button
              id="hero-dept-all"
              onClick={() => handleSelect('all')}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                selectedDepartment === 'all'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/30 scale-[1.02]'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <AwardIcon className={`w-5 h-5 ${selectedDepartment === 'all' ? 'text-white' : 'text-blue-400'}`} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  selectedDepartment === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {totalPublished}
                </span>
              </div>
              <p className="font-semibold text-xs sm:text-sm">ทุกฝ่าย</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">รวมผลงานทั้งหมด</p>
            </button>

            {/* 5 Departments */}
            {Object.values(DEPARTMENTS).map((dept) => {
              const count = getDeptCount(dept.id);
              const isSelected = selectedDepartment === dept.id;

              return (
                <button
                  key={dept.id}
                  id={`hero-dept-${dept.id}`}
                  onClick={() => handleSelect(dept.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-slate-800 border-2 text-white shadow-lg scale-[1.02]'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                  style={{
                    borderColor: isSelected ? dept.color : undefined
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: dept.color }}>
                      {getDeptIcon(dept.iconName)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </div>
                  <p className="font-semibold text-xs sm:text-sm truncate">{dept.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{dept.shortName}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
