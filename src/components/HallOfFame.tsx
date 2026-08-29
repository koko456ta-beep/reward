import React from 'react';
import { Trophy, Star, Sparkles, ExternalLink, Globe2, ChevronRight, Award as AwardIcon } from 'lucide-react';
import { Award } from '../types';
import { DEPARTMENTS, AWARD_LEVELS } from '../data/mockData';

interface HallOfFameProps {
  awards: Award[];
  onSelectAward: (award: Award) => void;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ awards, onSelectAward }) => {
  // Filter for featured OR international & national awards
  const topAwards = awards
    .filter(a => !a.deleted && a.status === 'published' && (a.featured || a.level === 'international' || a.level === 'national'))
    .slice(0, 4);

  if (topAwards.length === 0) return null;

  return (
    <section className="mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-200/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Header with Trophy and Gold flare */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  หอเกียรติยศ (Hall of Fame)
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  ผลงานระดับสูงสุด
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                ผลงานและรางวัลเชิดชูเกียรติระดับนานาชาติและระดับชาติที่สร้างชื่อเสียงให้กับโรงเรียน
              </p>
            </div>
          </div>
        </div>

        {/* Top Awards Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {topAwards.map((award) => {
            const dept = DEPARTMENTS[award.department];
            const levelInfo = AWARD_LEVELS[award.level];

            return (
              <div
                key={award.id}
                id={`hof-${award.id}`}
                onClick={() => onSelectAward(award)}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                {/* Image / Certificate thumbnail banner */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={award.imageUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80'}
                    alt={award.awardName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

                  {/* Level Pill on Image */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${levelInfo.badgeBg} flex items-center gap-1 shadow-sm`}>
                      {award.level === 'international' ? (
                        <Globe2 className="w-3 h-3 text-amber-300" />
                      ) : (
                        <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                      )}
                      {levelInfo.name}
                    </span>
                  </div>

                  {/* Year Tag */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      ปี {award.academicYear}
                    </span>
                  </div>

                  {/* Department Name at Bottom of Image */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/20 backdrop-blur-md">
                      {dept?.shortName || award.department}
                    </span>
                    <span className="text-[11px] text-slate-200">{award.awardDate}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {award.awardName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      <span className="truncate">{award.recipientName}</span>
                    </p>
                    {award.organizer && (
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        จัดโดย: {award.organizer}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                    <span>ดูเกียรติบัตรและรายละเอียด</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
