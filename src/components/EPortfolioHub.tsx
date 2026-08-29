import React, { useState, useMemo } from 'react';
import { 
  User, 
  Search, 
  Trophy, 
  Award as AwardIcon, 
  BookOpen, 
  ChevronRight, 
  Calendar, 
  Download, 
  Eye, 
  ExternalLink,
  GraduationCap,
  Sparkles,
  Building2,
  Users,
  Coins,
  Filter,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Award, DepartmentId, SystemSettings } from '../types';
import { DEPARTMENTS, AWARD_LEVELS, INITIAL_SETTINGS } from '../data/mockData';
import { downloadAwardImage } from '../lib/exportUtils';

interface EPortfolioHubProps {
  awards: Award[];
  settings?: SystemSettings;
  onSelectAward: (award: Award) => void;
  onSelectDepartment?: (dept: DepartmentId | 'all') => void;
}

interface RecipientProfile {
  name: string;
  recipientType: 'student' | 'teacher' | 'staff' | 'institution';
  awards: Award[];
  departmentCounts: Record<DepartmentId, number>;
  totalAwards: number;
  highestLevel: string;
  years: string[];
}

export const EPortfolioHub: React.FC<EPortfolioHubProps> = ({
  awards = [],
  settings = INITIAL_SETTINGS,
  onSelectAward,
  onSelectDepartment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipientType, setSelectedRecipientType] = useState<'all' | 'student' | 'teacher' | 'staff' | 'institution'>('all');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<DepartmentId | 'all'>('all');
  const [activeRecipientName, setActiveRecipientName] = useState<string | null>(null);

  const safeAwards = useMemo(() => {
    return (Array.isArray(awards) ? awards : []).filter(a => !a.deleted && a.status === 'published');
  }, [awards]);

  // Group awards by unique Recipient Name
  const recipientProfiles = useMemo(() => {
    const map = new Map<string, RecipientProfile>();

    safeAwards.forEach(award => {
      const rawName = (award.recipientName || 'ไม่ระบุชื่อ').trim();
      if (!rawName) return;

      if (!map.has(rawName)) {
        map.set(rawName, {
          name: rawName,
          recipientType: award.recipientType || 'student',
          awards: [],
          departmentCounts: {
            academic: 0,
            affairs: 0,
            general: 0,
            personnel: 0,
            budget: 0
          },
          totalAwards: 0,
          highestLevel: award.level,
          years: []
        });
      }

      const profile = map.get(rawName)!;
      profile.awards.push(award);
      profile.totalAwards += 1;
      if (award.department && profile.departmentCounts[award.department] !== undefined) {
        profile.departmentCounts[award.department] += 1;
      }
      if (award.academicYear && !profile.years.includes(award.academicYear)) {
        profile.years.push(award.academicYear);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalAwards - a.totalAwards);
  }, [safeAwards]);

  // Filter recipient profiles
  const filteredProfiles = useMemo(() => {
    return recipientProfiles.filter(profile => {
      if (selectedRecipientType !== 'all' && profile.recipientType !== selectedRecipientType) {
        return false;
      }

      if (selectedDepartmentFilter !== 'all') {
        if ((profile.departmentCounts[selectedDepartmentFilter] || 0) === 0) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = profile.name.toLowerCase().includes(q);
        const matchAward = profile.awards.some(a => a.awardName.toLowerCase().includes(q) || a.organizer?.toLowerCase().includes(q));
        if (!matchName && !matchAward) return false;
      }

      return true;
    });
  }, [recipientProfiles, selectedRecipientType, selectedDepartmentFilter, searchQuery]);

  // Selected Profile for deep inspection
  const currentProfile = useMemo(() => {
    if (!activeRecipientName) {
      return filteredProfiles[0] || null;
    }
    return recipientProfiles.find(p => p.name === activeRecipientName) || filteredProfiles[0] || null;
  }, [activeRecipientName, filteredProfiles, recipientProfiles]);

  const getRecipientTypeBadge = (type: string) => {
    switch (type) {
      case 'student':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">นักเรียน</span>;
      case 'teacher':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">ครูและบุคลากรทางการศึกษา</span>;
      case 'staff':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">เจ้าหน้าที่ / บุคลากร</span>;
      case 'institution':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">สถานศึกษา / องค์กร</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  const getDeptIcon = (deptId: DepartmentId) => {
    switch (deptId) {
      case 'academic': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'affairs': return <Sparkles className="w-3.5 h-3.5" />;
      case 'general': return <Building2 className="w-3.5 h-3.5" />;
      case 'personnel': return <Users className="w-3.5 h-3.5" />;
      case 'budget': return <Coins className="w-3.5 h-3.5" />;
      default: return <AwardIcon className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-indigo-800/40">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-3 backdrop-blur-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Digital E-Portfolio Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            แฟ้มสะสมงานดิจิทัล (E-Portfolio รายบุคคล)
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-light">
            สืบค้นและรวบรวมประวัติผลงาน เกียรติบัตร และรางวัลที่ได้รับ เชื่อมโยงตามรายชื่อบุคคล พร้อมแสดงสถิติจำนวนรางวัลและจำแนกตาม 5 ฝ่ายหลักของโรงเรียน
          </p>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ-นามสกุล, นักเรียน, ครู หรือชื่อรางวัล..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Recipient Type */}
          <select
            value={selectedRecipientType}
            onChange={(e) => setSelectedRecipientType(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-700"
          >
            <option value="all">ทุกกลุ่มบุคคล ({recipientProfiles.length})</option>
            <option value="student">นักเรียน</option>
            <option value="teacher">ครูและบุคลากร</option>
            <option value="institution">สถานศึกษา / โรงเรียน</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartmentFilter}
            onChange={(e) => setSelectedDepartmentFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-700"
          >
            <option value="all">ทุกฝ่ายงาน</option>
            {Object.values(DEPARTMENTS).map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Two Column Layout: Master-Detail E-Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Person Profiles */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>รายชื่อผู้มีผลงาน ({filteredProfiles.length} รายการ)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">คลิกเพื่อดูแฟ้มสะสมงาน</span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredProfiles.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                <User className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">ไม่พบรายชื่อผู้รับรางวัล</p>
                <p className="text-xs text-slate-400">ลองปรับคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
              </div>
            ) : (
              filteredProfiles.map((profile) => {
                const isSelected = currentProfile?.name === profile.name;
                return (
                  <div
                    key={profile.name}
                    onClick={() => setActiveRecipientName(profile.name)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-md ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">
                            {profile.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            {getRecipientTypeBadge(profile.recipientType)}
                            {profile.years.length > 0 && (
                              <span className="text-[10px] text-slate-500">
                                ปีการศึกษา: {profile.years.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Total Count Badge */}
                      <div className="flex flex-col items-end">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200">
                          <Trophy className="w-3.5 h-3.5 text-amber-600" />
                          <span>{profile.totalAwards} รางวัล</span>
                        </span>
                      </div>
                    </div>

                    {/* Department mini-chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                      {Object.entries(profile.departmentCounts).map(([dId, count]) => {
                        if (count === 0) return null;
                        const dept = DEPARTMENTS[dId as DepartmentId];
                        return (
                          <span
                            key={dId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700"
                            title={dept?.name}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept?.color }} />
                            <span>{dept?.shortName}: {count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail Portfolio Card */}
        <div className="lg:col-span-7">
          {currentProfile ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden sticky top-24 space-y-6 p-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {currentProfile.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      {getRecipientTypeBadge(currentProfile.recipientType)}
                      <span className="text-xs text-slate-500">
                        รวมทั้งหมด <strong>{currentProfile.totalAwards}</strong> รางวัลและเกียรติบัตร
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-center">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase">รางวัลสะสม</p>
                    <p className="text-lg font-bold text-amber-900 leading-tight">{currentProfile.totalAwards}</p>
                  </div>
                </div>
              </div>

              {/* Department breakdown summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>สถิติจำนวนผลงานจำแนกตาม 5 ฝ่าย</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(DEPARTMENTS).map(([dId, dept]) => {
                    const count = currentProfile.departmentCounts[dId as DepartmentId] || 0;
                    return (
                      <div
                        key={dId}
                        onClick={() => onSelectDepartment && onSelectDepartment(dId as DepartmentId)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          count > 0 ? 'bg-white border-slate-200 hover:border-blue-400' : 'bg-slate-100/60 border-transparent text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span style={{ color: dept.color }}>{getDeptIcon(dId as DepartmentId)}</span>
                          <span className="truncate font-medium">{dept.shortName}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Awards Timeline / Grid for this person */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>รายการผลงานและเกียรติบัตร ({currentProfile.awards.length} รายการ)</span>
                  <span className="text-xs font-normal text-slate-500">คลิกเพื่อดูหรือดาวน์โหลด</span>
                </h4>

                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {currentProfile.awards.map((award) => {
                    const dept = DEPARTMENTS[award.department];
                    const levelInfo = AWARD_LEVELS[award.level];

                    return (
                      <div
                        key={award.id}
                        onClick={() => onSelectAward(award)}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group cursor-pointer"
                      >
                        {/* Thumbnail */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                            <img
                              src={award.imageUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=200&auto=format&fit=crop&q=80'}
                              alt={award.awardName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${levelInfo?.badgeBg || 'bg-slate-700 text-white'}`}>
                                {levelInfo?.name || award.level}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                ปี {award.academicYear}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500">
                                {award.awardDate}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {award.awardName}
                            </h5>
                            {award.organizer && (
                              <p className="text-[11px] text-slate-400 truncate">
                                จัดโดย: {award.organizer}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAward(award);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ดูเกียรติบัตร</span>
                          </button>
                          {award.allowDownload !== false && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const imgUrl = award.certificateUrl || award.imageUrl;
                                if (!imgUrl) return;
                                const safeName = (award.recipientName || 'ผลงาน').replace(/\s+/g, '_');
                                const safeTitle = (award.awardName || 'เกียรติบัตร').replace(/\s+/g, '_').slice(0, 30);
                                await downloadAwardImage(imgUrl, `เกียรติบัตร_${safeName}_${safeTitle}.jpg`);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="ดาวน์โหลดภาพเกียรติบัตร"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">เลือกรายชื่อผู้รับรางวัลเพื่อดูแฟ้มสะสมงาน</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
