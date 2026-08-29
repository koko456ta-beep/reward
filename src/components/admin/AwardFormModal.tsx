import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  HardDrive, 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
  Calendar, 
  Building2, 
  User, 
  Tag, 
  Star, 
  Link2,
  RefreshCw
} from 'lucide-react';
import { Award, AppUser, DepartmentId, AwardLevel, AwardStatus, RecipientType } from '../../types';
import { DEPARTMENTS, AWARD_LEVELS, INITIAL_ACADEMIC_YEARS } from '../../data/mockData';
import { compressImage, formatBytes, CompressionResult } from '../../lib/imageCompressor';
import { uploadFileToGoogleDrive, extractDriveFileId, generateDriveUrls, getRecommendedDriveFolder } from '../../lib/googleDrive';

interface AwardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (awardData: Partial<Award>) => void;
  initialAward?: Award | null;
  currentUser: AppUser;
}

export const AwardFormModal: React.FC<AwardFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialAward,
  currentUser
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const defaultDept = isSuperAdmin ? 'academic' : (currentUser.department as DepartmentId);

  // Form State
  const [awardName, setAwardName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientType, setRecipientType] = useState<RecipientType>('student');
  const [department, setDepartment] = useState<DepartmentId>(defaultDept);
  const [level, setLevel] = useState<AwardLevel>('national');
  const [academicYear, setAcademicYear] = useState('2569');
  const [awardDate, setAwardDate] = useState(new Date().toISOString().slice(0, 10));
  const [organizer, setOrganizer] = useState('');
  const [description, setDescription] = useState('');
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [featured, setFeatured] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [status, setStatus] = useState<AwardStatus>('published');

  // File Upload & Compression State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadedDriveId, setUploadedDriveId] = useState<string>('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing award if editing
  useEffect(() => {
    if (initialAward) {
      setAwardName(initialAward.awardName || '');
      setRecipientName(initialAward.recipientName || '');
      setRecipientType(initialAward.recipientType || 'student');
      setDepartment(initialAward.department || defaultDept);
      setLevel(initialAward.level || 'national');
      setAcademicYear(initialAward.academicYear || '2569');
      setAwardDate(initialAward.awardDate || new Date().toISOString().slice(0, 10));
      setOrganizer(initialAward.organizer || '');
      setDescription(initialAward.description || '');
      setDriveUrlInput(initialAward.certificateUrl || '');
      setTagsInput(initialAward.tags?.join(', ') || '');
      setFeatured(!!initialAward.featured);
      setAllowDownload(initialAward.allowDownload !== false);
      setStatus(initialAward.status || 'published');
      setPreviewImageUrl(initialAward.imageUrl || '');
      setUploadedDriveId(initialAward.certificateFileId || '');
    } else {
      // Reset form
      setAwardName('');
      setRecipientName('');
      setRecipientType('student');
      setDepartment(defaultDept);
      setLevel('national');
      setAcademicYear('2569');
      setAwardDate(new Date().toISOString().slice(0, 10));
      setOrganizer('');
      setDescription('');
      setDriveUrlInput('');
      setTagsInput('');
      setFeatured(false);
      setAllowDownload(true);
      setStatus('published');
      setSelectedFile(null);
      setCompressionResult(null);
      setUploadProgress(null);
      setPreviewImageUrl('');
      setUploadedDriveId('');
    }
  }, [initialAward, defaultDept, isOpen]);

  if (!isOpen) return null;

  // Handle image compression when a file is selected
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsCompressing(true);
    setErrorMessage('');

    try {
      const result = await compressImage(file, 1920, 1920, 0.85);
      setCompressionResult(result);
      setPreviewImageUrl(result.dataUrl);

      // Auto start simulated/real upload to Google Drive
      const uploadRes = await uploadFileToGoogleDrive(
        result.file,
        file.name,
        department,
        'certificate',
        (pct, text) => {
          setUploadProgress(pct);
          setUploadStatusText(text);
        }
      );

      setUploadedDriveId(uploadRes.fileId);
      setDriveUrlInput(uploadRes.viewUrl);
    } catch (err) {
      console.error(err);
      setErrorMessage('การบีบอัดรูปภาพล้มเหลว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!awardName.trim()) {
      setErrorMessage('กรุณาระบุชื่อผลงานหรือรางวัล');
      return;
    }
    if (!recipientName.trim()) {
      setErrorMessage('กรุณาระบุชื่อผู้ได้รับรางวัล');
      return;
    }

    const driveId = uploadedDriveId || extractDriveFileId(driveUrlInput) || '1dr_' + Date.now();
    const finalDriveUrls = generateDriveUrls(driveId);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const awardPayload: Partial<Award> = {
      awardName: awardName.trim(),
      recipientName: recipientName.trim(),
      recipientType,
      department,
      level,
      academicYear,
      awardDate,
      organizer: organizer.trim(),
      description: description.trim(),
      certificateFileId: driveId,
      certificateUrl: driveUrlInput || finalDriveUrls.viewUrl,
      imageUrl: previewImageUrl || finalDriveUrls.thumbnailUrl,
      imageFileId: driveId,
      status,
      featured,
      allowDownload,
      tags,
      driveFolder: getRecommendedDriveFolder(department, 'certificate'),
      updatedAt: new Date().toISOString()
    };

    onSubmit(awardPayload);
    onClose();
  };

  const recommendedFolder = getRecommendedDriveFolder(department, 'certificate');

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {initialAward ? 'แก้ไขข้อมูลผลงาน/รางวัล' : 'บันทึกข้อมูลผลงานและรางวัลใหม่'}
              </h2>
              <p className="text-xs text-slate-300">
                ระบบแยกสิทธิ์ตาม 5 ฝ่ายหลัก และเชื่อมต่อ Google Drive อัตโนมัติ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SECTION 1: Core Award Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. ข้อมูลพื้นฐานรางวัล (General Information)
            </h3>

            {/* Award Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผลงาน / รางวัลที่ได้รับ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น รางวัลเหรียญทอง การแข่งขันคณิตศาสตร์โอลิมปิกระดับนานาชาติ"
                value={awardName}
                onChange={(e) => setAwardName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            {/* Recipient & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้ได้รับรางวัล / รายนามทีม <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายธนกฤต เมธาวีระกุล หรือ ทีม RattaBotics"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเภทผู้รับ
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="student">นักเรียน</option>
                  <option value="teacher">ครูและบุคลากร</option>
                  <option value="team">ทีม / กลุ่มตัวแทน</option>
                  <option value="school">สถานศึกษา / โรงเรียน</option>
                </select>
              </div>
            </div>

            {/* Department, Level, Year, Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ฝ่ายที่รับผิดชอบ <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  disabled={!isSuperAdmin}
                  onChange={(e) => setDepartment(e.target.value as any)}
                  className={`w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none ${
                    !isSuperAdmin ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  }`}
                >
                  {Object.values(DEPARTMENTS).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {!isSuperAdmin && (
                  <p className="text-[10px] text-slate-400 mt-0.5">ถูกกำหนดตามสิทธิ์ฝ่ายของคุณ</p>
                )}
              </div>

              {/* Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ระดับรางวัล <span className="text-red-500">*</span>
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  {Object.values(AWARD_LEVELS).map(lvl => (
                    <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ปีการศึกษา <span className="text-red-500">*</span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  {INITIAL_ACADEMIC_YEARS.map(yr => (
                    <option key={yr.id} value={yr.year}>ปีการศึกษา {yr.year}</option>
                  ))}
                </select>
              </div>

              {/* Award Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่ได้รับรางวัล <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={awardDate}
                  onChange={(e) => setAwardDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Organizer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หน่วยงานผู้จัด / องค์กรที่มอบรางวัล
              </label>
              <input
                type="text"
                placeholder="เช่น กระทรวงศึกษาธิการ, คุรุสภา, สมาคมวิทยาศาสตร์ฯ"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดและเนื้อหาผลงานโดยย่อ
              </label>
              <textarea
                rows={3}
                placeholder="ระบุรายละเอียดความเป็นมา เกณฑ์การตัดสิน ผลงานที่ส่งเข้าประกวด..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: Certificate & Google Drive Upload */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-blue-600" />
                2. จัดเก็บเกียรติบัตรและไฟล์ใน Google Drive
              </h3>
              <span className="text-[11px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                Folder: {recommendedFolder}
              </span>
            </div>

            {/* Client-Side Image Compressor & Upload Zone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-6 bg-slate-50/60 hover:bg-slate-50 transition-colors text-center relative group">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="font-bold text-slate-800 text-sm">
                  คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์เกียรติบัตรมาวางที่นี่
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  รองรับ JPG, PNG, WEBP, PDF (มีระบบบีบอัดภาพอัตโนมัติคงความคมชัดของตัวหนังสือ)
                </p>
              </div>
            </div>

            {/* Compression Feedback Stats */}
            {isCompressing && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs text-blue-800">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>กำลังบีบอัดรูปภาพให้อยู่ในขนาดที่เหมาะสมสำหรับ Google Drive...</span>
              </div>
            )}

            {compressionResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    บีบอัดรูปภาพสำเร็จ: {formatBytes(compressionResult.originalSize)} ➔ {formatBytes(compressionResult.compressedSize)} (ลดขนาดได้ {compressionResult.reductionPercentage}%)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  {compressionResult.width}x{compressionResult.height}px
                </span>
              </div>
            )}

            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900 text-white">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{uploadStatusText}</span>
                  <span className="font-mono text-amber-300">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Manual Google Drive Link Alternative */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หรือ วางลิงก์ Google Drive โดยตรง (Share Link หรือ File ID)
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={driveUrlInput}
                  onChange={(e) => setDriveUrlInput(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Additional Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. การตั้งค่าการแสดงผลและป้ายกำกับ (Display & Tags)
            </h3>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ป้ายกำกับค้นหา (Tags คั่นด้วยเครื่องหมายจุลภาค ,)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="เช่น โอลิมปิกวิชาการ, เหรียญทอง, นานาชาติ, คอมพิวเตอร์"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">ผลงานเด่น (Featured)</p>
                  <p className="text-[10px] text-slate-500">แสดงในหอเกียรติยศหน้าแรก</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">อนุญาตให้ดาวน์โหลด</p>
                  <p className="text-[10px] text-slate-500">เปิดให้บุคคลทั่วไปดาวน์โหลดไฟล์</p>
                </div>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สถานะการเผยแพร่
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="published">เผยแพร่ทันที (Published)</option>
                  <option value="pending">รอการตรวจสอบ (Pending)</option>
                  <option value="draft">ฉบับร่าง (Draft)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
            >
              {initialAward ? 'บันทึกการแก้ไข' : 'บันทึกผลงานเข้าระบบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
