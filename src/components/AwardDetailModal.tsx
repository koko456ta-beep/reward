import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  Share2, 
  QrCode, 
  Printer, 
  Check, 
  Calendar, 
  Building2, 
  User, 
  Globe2, 
  Star, 
  Tag, 
  ShieldCheck,
  Eye,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { Award, SystemSettings, DepartmentId } from '../types';
import { DEPARTMENTS, AWARD_LEVELS, INITIAL_SETTINGS } from '../data/mockData';

interface AwardDetailModalProps {
  award: Award | null;
  onClose: () => void;
  settings?: SystemSettings;
  onSelectDepartment?: (dept: DepartmentId | 'all') => void;
}

export const AwardDetailModal: React.FC<AwardDetailModalProps> = ({ 
  award, 
  onClose, 
  settings = INITIAL_SETTINGS,
  onSelectDepartment 
}) => {
  const safeSettings = settings || INITIAL_SETTINGS;
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'certificate' | 'details' | 'qr'>('certificate');

  // Trigger celebratory confetti on high-level achievements
  useEffect(() => {
    if (award && (award.level === 'international' || award.level === 'national' || award.featured)) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [award]);

  // Generate QR Code for this award
  useEffect(() => {
    if (award) {
      const shareUrl = window.location.origin + '?awardId=' + award.id;
      QRCode.toDataURL(shareUrl, { width: 300, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [award]);

  // Reset zoom when modal opens or award changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setActiveTab('certificate');
  }, [award]);

  if (!award) return null;

  const dept = DEPARTMENTS[award.department];
  const levelInfo = AWARD_LEVELS[award.level];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleCopyLink = () => {
    const url = window.location.origin + '?awardId=' + award.id;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.origin + '?awardId=' + award.id);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareLine = () => {
    const text = encodeURIComponent(`${award.awardName} - ${award.recipientName}`);
    const url = encodeURIComponent(window.location.origin + '?awardId=' + award.id);
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const certificateImg = award.imageUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=90';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${levelInfo?.badgeBg || 'bg-slate-700'}`}>
              {levelInfo?.name || award.level}
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">|</span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              {dept?.name}
            </span>
            <span className="text-xs text-amber-400 font-semibold truncate hidden md:inline">
              ปีการศึกษา {award.academicYear}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Share Pill */}
            <button
              onClick={handleCopyLink}
              title="คัดลอกลิงก์ผลงาน"
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'คัดลอกแล้ว!' : 'แชร์'}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              title="พิมพ์เอกสาร"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              id="award-modal-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-slate-100 bg-slate-50 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'certificate' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📜 เกียรติบัตร / รูปภาพต้นฉบับ
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'details' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 รายละเอียดและข้อมูลผู้รับ
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'qr' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📱 QR Code สำหรับสแกน
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CERTIFICATE VIEWER */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              {/* Zoom & View Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 border border-slate-200">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleZoomIn}
                    title="ซูมเข้า (Zoom In)"
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 shadow-2xs text-xs flex items-center gap-1 font-medium px-2.5"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>ซูมเข้า</span>
                  </button>
                  <button
                    onClick={handleZoomOut}
                    title="ซูมออก (Zoom Out)"
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 shadow-2xs text-xs flex items-center gap-1 font-medium px-2.5"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                    <span>ซูมออก</span>
                  </button>
                  <button
                    onClick={handleRotate}
                    title="หมุน 90 องศา (Rotate)"
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 shadow-2xs text-xs flex items-center gap-1 font-medium px-2.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>หมุน</span>
                  </button>
                  <button
                    onClick={handleResetZoom}
                    title="รีเซ็ตขนาดเดิม"
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 shadow-2xs text-xs flex items-center gap-1 font-medium px-2.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ขนาดปกติ ({Math.round(zoomLevel * 100)}%)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={award.certificateUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดใน Google Drive</span>
                  </a>
                </div>
              </div>

              {/* Zoomable Image Container */}
              <div className="relative min-h-[350px] max-h-[550px] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-slate-800 shadow-inner">
                <div 
                  className="transition-transform duration-200 origin-center max-w-full"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                  }}
                >
                  <img
                    src={certificateImg}
                    alt={award.awardName}
                    className="max-h-[500px] w-auto object-contain rounded-lg shadow-2xl"
                  />
                </div>
              </div>

              {/* Title & summary beneath viewer */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {award.awardName}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-blue-700 mt-1">
                  ผู้ได้รับรางวัล: {award.recipientName}
                </p>
                {award.description && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {award.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED METADATA */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {award.awardName}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${levelInfo?.badgeBg}`}>
                    {levelInfo?.name}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    ฝ่าย: {dept?.name}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                    ปีการศึกษา {award.academicYear}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ข้อมูลผู้รับและหน่วยงาน
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">ชื่อผู้ได้รับรางวัล / ทีม</p>
                        <p className="font-semibold text-slate-900">{award.recipientName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">หน่วยงานผู้จัด / องค์กรที่มอบ</p>
                        <p className="font-semibold text-slate-900">{award.organizer || 'ไม่ระบุ'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">วันที่ได้รับรางวัล</p>
                        <p className="font-semibold text-slate-900">{award.awardDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ข้อมูลระบบและการจัดเก็บ Google Drive
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Google Drive Folder</p>
                      <p className="font-mono text-xs text-slate-700 bg-white p-1.5 rounded border border-slate-200">
                        {award.driveFolder || `ผลงานโรงเรียน/${dept?.shortName}/เกียรติบัตร`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ผู้บันทึกข้อมูล</p>
                      <p className="font-medium text-slate-800 text-xs">{award.createdByName || 'Admin'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">วันที่บันทึกเข้าระบบ</p>
                      <p className="font-medium text-slate-800 text-xs">{award.createdAt?.slice(0, 10) || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  รายละเอียดผลงานและความเป็นมา
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {award.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                </p>
              </div>

              {/* Tags */}
              {award.tags && award.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 mr-1">ป้ายกำกับ:</span>
                  {award.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700 border border-slate-200">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QR CODE & SHARE */}
          {activeTab === 'qr' && (
            <div className="max-w-md mx-auto text-center space-y-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  สแกน QR Code เพื่อเปิดดูเกียรติบัตรบนมือถือ
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  สามารถนำ QR Code นี้ไปพิมพ์ลงบนโปสเตอร์ บอร์ดนิทรรศการ หรือเอกสารประชาสัมพันธ์
                </p>
              </div>

              {qrCodeDataUrl && (
                <div className="p-4 bg-white rounded-3xl border-2 border-dashed border-slate-300 inline-block shadow-md">
                  <img src={qrCodeDataUrl} alt="Award QR Code" className="w-56 h-56 mx-auto" />
                  <p className="text-[11px] font-mono text-slate-400 mt-2">
                    ID: {award.id}
                  </p>
                </div>
              )}

              {/* Share Channels */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-600 mb-2">แชร์ไปยังโซเชียลมีเดีย</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span>{copiedLink ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}</span>
                  </button>
                  <button
                    onClick={handleShareLine}
                    className="px-4 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs"
                  >
                    <span>แชร์ผ่าน LINE</span>
                  </button>
                  <button
                    onClick={handleShareFacebook}
                    className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs"
                  >
                    <span>แชร์ Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {safeSettings?.schoolName || 'โรงเรียน'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
