import React from 'react';
import { Trophy, Globe2, Award as AwardIcon, Flag, MapPin, Users } from 'lucide-react';
import { Award } from '../types';

interface StatsCounterProps {
  awards: Award[];
}

export const StatsCounter: React.FC<StatsCounterProps> = ({ awards = [] }) => {
  const safeAwards = Array.isArray(awards) ? awards : [];
  const publishedAwards = safeAwards.filter(a => !a.deleted && a.status === 'published');
  
  const totalCount = publishedAwards.length;
  const internationalCount = publishedAwards.filter(a => a.level === 'international').length;
  const nationalCount = publishedAwards.filter(a => a.level === 'national').length;
  const regionalCount = publishedAwards.filter(a => a.level === 'regional' || a.level === 'provincial').length;
  const districtSchoolCount = publishedAwards.filter(a => a.level === 'district' || a.level === 'school').length;

  const stats = [
    {
      id: 'stat-total',
      label: 'รางวัลทั้งหมดที่บันทึก',
      value: totalCount,
      unit: 'รางวัล',
      icon: <Trophy className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50/80',
      border: 'border-blue-100'
    },
    {
      id: 'stat-intl',
      label: 'ระดับนานาชาติ',
      value: internationalCount,
      unit: 'รางวัล',
      icon: <Globe2 className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-100'
    },
    {
      id: 'stat-national',
      label: 'ระดับชาติ',
      value: nationalCount,
      unit: 'รางวัล',
      icon: <Flag className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-50/80',
      border: 'border-rose-100'
    },
    {
      id: 'stat-reg-prov',
      label: 'ระดับภาคและจังหวัด',
      value: regionalCount,
      unit: 'รางวัล',
      icon: <AwardIcon className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-50/80',
      border: 'border-purple-100'
    },
    {
      id: 'stat-district',
      label: 'ระดับเขตและสถานศึกษา',
      value: districtSchoolCount,
      unit: 'รางวัล',
      icon: <MapPin className="w-6 h-6 text-teal-600" />,
      bg: 'bg-teal-50/80',
      border: 'border-teal-100'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((item) => (
          <div
            key={item.id}
            id={item.id}
            className={`bg-white rounded-2xl p-4 sm:p-5 border ${item.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${item.bg}`}>
                {item.icon}
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {item.value}
                </span>
                <span className="text-xs text-slate-500 font-medium">{item.unit}</span>
              </div>
              <p className="text-xs font-medium text-slate-600 mt-1 line-clamp-1">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
