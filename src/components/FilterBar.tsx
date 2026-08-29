import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Search, 
  ArrowUpDown, 
  Calendar, 
  Layers, 
  Sparkles,
  Trophy
} from 'lucide-react';
import { AwardFilterState, AwardLevel, DepartmentId, AcademicYear } from '../types';
import { DEPARTMENTS, AWARD_LEVELS, INITIAL_ACADEMIC_YEARS } from '../data/mockData';

interface FilterBarProps {
  filters: AwardFilterState;
  onFilterChange: React.Dispatch<React.SetStateAction<AwardFilterState>> | ((updater: any) => void);
  onResetFilters?: () => void;
  academicYears?: AcademicYear[];
  totalCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  academicYears = INITIAL_ACADEMIC_YEARS,
  totalCount
}) => {
  const safeYears = Array.isArray(academicYears) && academicYears.length > 0 
    ? academicYears 
    : INITIAL_ACADEMIC_YEARS;

  const updateFilters = (patch: Partial<AwardFilterState>) => {
    if (typeof onFilterChange === 'function') {
      onFilterChange((prev: AwardFilterState) => ({
        ...prev,
        ...patch
      }));
    }
  };

  const hasActiveFilters = 
    (filters.search && filters.search.trim() !== '') ||
    filters.department !== 'all' ||
    filters.level !== 'all' ||
    filters.academicYear !== 'all' ||
    filters.featuredOnly ||
    filters.sortBy !== 'newest';

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      updateFilters({
        search: '',
        department: 'all',
        level: 'all',
        academicYear: 'all',
        featuredOnly: false,
        sortBy: 'newest'
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-6 space-y-4">
      {/* Search Input and Reset Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="filter-search-input"
            type="text"
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="ค้นหาชื่อรางวัล, ชื่อผู้รับ, หน่วยงานที่มอบ, หรือคำสำคัญ (Tags)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => updateFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Featured Toggle Button */}
          <button
            id="filter-featured-toggle"
            onClick={() => updateFilters({ featuredOnly: !filters.featuredOnly })}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filters.featuredOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${filters.featuredOnly ? 'text-white fill-white' : 'text-amber-500'}`} />
            <span>เฉพาะผลงานเด่น</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              id="filter-reset-btn"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        {/* 1. Department Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            ฝ่ายที่รับผิดชอบ
          </label>
          <select
            id="filter-department-select"
            value={filters.department || 'all'}
            onChange={(e) => updateFilters({ department: e.target.value as DepartmentId | 'all' })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
          >
            <option value="all">ทุกฝ่าย (ทั้งหมด)</option>
            {Object.values(DEPARTMENTS).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* 2. Level Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            ระดับรางวัล
          </label>
          <select
            id="filter-level-select"
            value={filters.level || 'all'}
            onChange={(e) => updateFilters({ level: e.target.value as AwardLevel | 'all' })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
          >
            <option value="all">ทุกระดับรางวัล</option>
            {Object.values(AWARD_LEVELS).map((lvl) => (
              <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
            ))}
          </select>
        </div>

        {/* 3. Academic Year Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            ปีการศึกษา
          </label>
          <select
            id="filter-year-select"
            value={filters.academicYear || 'all'}
            onChange={(e) => updateFilters({ academicYear: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
          >
            <option value="all">ทุกปีการศึกษา</option>
            {safeYears.map((yr) => (
              <option key={yr.id} value={yr.year}>{yr.label}</option>
            ))}
          </select>
        </div>

        {/* 4. Sort By */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            เรียงลำดับตาม
          </label>
          <select
            id="filter-sort-select"
            value={filters.sortBy || 'newest'}
            onChange={(e) => updateFilters({ sortBy: e.target.value as 'newest' | 'oldest' | 'name' })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
          >
            <option value="newest">วันที่ล่าสุด (ใหม่ - เก่า)</option>
            <option value="oldest">วันที่เก่าสุด (เก่า - ใหม่)</option>
            <option value="name">ชื่อผลงาน (ก - ฮ)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
