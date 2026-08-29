import React from 'react';
import { Award } from '../types';
import { DEPARTMENTS, AWARD_LEVELS } from '../data/mockData';
import { Calendar, User, Eye, Star, Globe2, Sparkles, Building2, GraduationCap, Users, Coins, Download } from 'lucide-react';

interface AwardCardProps {
  award: Award;
  onSelectAward: (award: Award) => void;
}

export const AwardCard: React.FC<AwardCardProps> = ({ award, onSelectAward }) => {
  const dept = DEPARTMENTS[award.department];
  const levelInfo = AWARD_LEVELS[award.level];

  const getDeptIcon = (iconName?: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-3 h-3" />;
      case 'Sparkles': return <Sparkles className="w-3 h-3" />;
      case 'Building2': return <Building2 className="w-3 h-3" />;
      case 'Users': return <Users className="w-3 h-3" />;
      case 'Coins': return <Coins className="w-3 h-3" />;
      default: return null;
    }
  };

  const handleDirectDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadUrl = award.certificateUrl || award.imageUrl;
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `เกียรติบัตร_${(award.recipientName || 'ผลงาน').replace(/\s+/g, '_')}_${award.awardName.slice(0, 20)}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id={`award-card-${award.id}`}
      onClick={() => onSelectAward(award)}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-400/80 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
    >
      {/* Thumbnail Banner */}
      <div className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden">
        <img
          src={award.imageUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80'}
          alt={award.awardName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent"></div>

        {/* Level Badge (Top Left) */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${levelInfo?.badgeBg || 'bg-slate-700 text-white'} flex items-center gap-1 shadow-xs`}>
            {award.level === 'international' && <Globe2 className="w-3 h-3 text-amber-300" />}
            {award.level === 'national' && <Star className="w-3 h-3 text-rose-200 fill-rose-200" />}
            {levelInfo?.name || award.level}
          </span>
        </div>

        {/* Academic Year Badge & Direct Download Button (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {award.allowDownload !== false && (
            <button
              onClick={handleDirectDownload}
              title="ดาวน์โหลดเกียรติบัตร / รูปผลงาน"
              className="p-1.5 rounded-lg bg-black/60 hover:bg-blue-600 text-white backdrop-blur-xs transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          {award.featured && (
            <span className="p-1 rounded-md bg-amber-500 text-white shadow-xs" title="ผลงานแนะนำ">
              <Star className="w-3 h-3 fill-white" />
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
            ปี {award.academicYear}
          </span>
        </div>

        {/* Department Pill (Bottom Left) */}
        <div className="absolute bottom-2.5 left-3">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/90 text-slate-800 shadow-xs flex items-center gap-1 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept?.color }} />
            {dept?.shortName || award.department}
          </span>
        </div>

        {/* Award Date (Bottom Right) */}
        <div className="absolute bottom-2.5 right-3 text-[11px] text-slate-200">
          {award.awardDate}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {award.awardName}
          </h3>

          <div className="mt-3 flex items-start gap-2 text-xs text-slate-700 font-medium">
            <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{award.recipientName}</span>
          </div>

          {award.organizer && (
            <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">
              จัดโดย: {award.organizer}
            </p>
          )}

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 font-normal leading-relaxed">
            {award.description}
          </p>
        </div>

        {/* Card Footer with Direct Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{award.viewsCount || 100} ครั้ง</span>
          </div>

          <div className="flex items-center gap-1.5">
            {award.allowDownload !== false && (
              <button
                onClick={handleDirectDownload}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium flex items-center gap-1 transition-colors"
                title="ดาวน์โหลดไฟล์เกียรติบัตร"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>ดาวน์โหลด</span>
              </button>
            )}
            <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-800 flex items-center gap-0.5 pl-1">
              ดูรายละเอียด
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
