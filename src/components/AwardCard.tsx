import React, { useState, useEffect } from 'react';
import { Award } from '../types';
import { DEPARTMENTS, AWARD_LEVELS } from '../data/mockData';
import { 
  Calendar, 
  User, 
  Eye, 
  Star, 
  Globe2, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Users, 
  Coins, 
  Download, 
  Loader2,
  Heart,
  Share2,
  Check,
  ExternalLink
} from 'lucide-react';
import { downloadAwardImage } from '../lib/exportUtils';
import { toggleLikeAward } from '../lib/storage';

interface AwardCardProps {
  award: Award;
  onSelectAward: (award: Award) => void;
  onLikeAward?: (awardId: string) => void;
}

export const AwardCard: React.FC<AwardCardProps> = ({ award, onSelectAward, onLikeAward }) => {
  const dept = DEPARTMENTS[award.department];
  const levelInfo = AWARD_LEVELS[award.level];
  const [downloading, setDownloading] = useState(false);
  
  // Like state with local persistence
  const [isLiked, setIsLiked] = useState(() => {
    return localStorage.getItem(`liked_award_${award.id}`) === 'true';
  });
  const [likesCount, setLikesCount] = useState(award.likesCount || 0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setLikesCount(award.likesCount || 0);
    setIsLiked(localStorage.getItem(`liked_award_${award.id}`) === 'true');
  }, [award.id, award.likesCount]);

  const handleDirectDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadUrl = award.certificateUrl || award.imageUrl || '';

    try {
      setDownloading(true);
      const safeName = (award.recipientName || 'ผลงาน').replace(/\s+/g, '_');
      const safeTitle = (award.awardName || 'เกียรติบัตร').replace(/\s+/g, '_').slice(0, 30);
      await downloadAwardImage(downloadUrl, `เกียรติบัตร_${safeName}_${safeTitle}.jpg`, award);
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 400);

    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(prev => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const updatedCount = await toggleLikeAward(award.id);
      setLikesCount(updatedCount);
      if (onLikeAward) {
        onLikeAward(award.id);
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.origin + '?awardId=' + award.id;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareLine = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.origin + '?awardId=' + award.id;
    const text = `${award.awardName} - ${award.recipientName}`;
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.origin + '?awardId=' + award.id;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent"></div>

        {/* Level Badge (Top Left) */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${levelInfo?.badgeBg || 'bg-slate-700 text-white'} flex items-center gap-1 shadow-xs`}>
            {award.level === 'international' && <Globe2 className="w-3 h-3 text-amber-300" />}
            {award.level === 'national' && <Star className="w-3 h-3 text-rose-200 fill-rose-200" />}
            {levelInfo?.name || award.level}
          </span>
        </div>

        {/* Top Right: Actions & Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {award.allowDownload !== false && (
            <button
              onClick={handleDirectDownload}
              disabled={downloading}
              title="ดาวน์โหลดเกียรติบัตร / รูปผลงาน"
              className="p-1.5 rounded-lg bg-black/60 hover:bg-blue-600 text-white backdrop-blur-xs transition-colors shadow-xs flex items-center justify-center cursor-pointer"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-200" /> : <Download className="w-3.5 h-3.5" />}
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

          <div className="mt-2.5 flex items-start gap-2 text-xs text-slate-700 font-medium">
            <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="line-clamp-1 leading-relaxed font-semibold">{award.recipientName}</span>
          </div>

          {award.organizer && (
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
              จัดโดย: {award.organizer}
            </p>
          )}

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 font-normal leading-relaxed">
            {award.description}
          </p>
        </div>

        {/* Social Engagement Bar (Like & Social Share buttons) */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2.5">
          {/* Row 1: Like Button + Facebook & LINE Share Buttons */}
          <div className="flex items-center justify-between gap-2">
            {/* Like Button */}
            <button
              onClick={handleToggleLike}
              title={isLiked ? 'ยกเลิกถูกใจ' : 'กดถูกใจผลงานนี้'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isLiked 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent'
              } ${isLikeAnimating ? 'scale-110' : 'scale-100'}`}
            >
              <Heart 
                className={`w-4 h-4 transition-transform ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
                } ${isLikeAnimating ? 'scale-125' : 'scale-100'}`} 
              />
              <span>{likesCount}</span>
            </button>

            {/* Social Share Group */}
            <div className="flex items-center gap-1.5">
              {/* Facebook Share Button */}
              <button
                onClick={handleShareFacebook}
                title="แชร์ไปยัง Facebook"
                className="px-2 py-1 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-all hover:scale-105 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="hidden xs:inline">Facebook</span>
              </button>

              {/* LINE Share Button */}
              <button
                onClick={handleShareLine}
                title="แชร์ไปยัง LINE"
                className="px-2 py-1 rounded-lg bg-[#06C755] hover:bg-[#05b34c] text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-all hover:scale-105 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.087.495.239l2.478 3.369V8.108c0-.345.282-.63.63-.63.345 0 .626.285.626.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <span className="hidden xs:inline">LINE</span>
              </button>

              {/* Copy Link button */}
              <button
                onClick={handleCopyLink}
                title="คัดลอกลิงก์ผลงาน"
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Row 2: Views Count & Details / Direct Download */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{award.viewsCount || 100} ครั้ง</span>
            </div>

            <div className="flex items-center gap-1.5">
              {award.allowDownload !== false && (
                <button
                  onClick={handleDirectDownload}
                  disabled={downloading}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 disabled:opacity-50 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="ดาวน์โหลดไฟล์ภาพเกียรติบัตรทันที"
                >
                  {downloading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  ) : (
                    <Download className="w-3 h-3 text-blue-600" />
                  )}
                  <span>ดาวน์โหลด</span>
                </button>
              )}

              <span className="text-[11px] font-bold text-blue-600 group-hover:text-blue-800 flex items-center gap-0.5">
                ดูรายละเอียด
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
