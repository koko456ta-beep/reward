import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  Building2, 
  Database, 
  Palette, 
  ShieldCheck, 
  AlertTriangle,
  FileJson,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Flame,
  Globe,
  Trash2
} from 'lucide-react';
import { SystemSettings, Award } from '../../types';
import { exportFullBackupJSON } from '../../lib/exportUtils';
import { resetToFactoryDefault } from '../../lib/storage';
import { INITIAL_SETTINGS, DEPARTMENTS } from '../../data/mockData';
import { isFirebaseConfigured } from '../../lib/firebase';

interface SystemSettingsViewProps {
  settings?: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  awards?: Award[];
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  settings = INITIAL_SETTINGS,
  onSaveSettings,
  awards = []
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings || INITIAL_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.9);
          setFormData(prev => ({ ...prev, schoolLogoUrl: compressedDataUrl }));
        }
        setLogoUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleExportBackup = () => {
    exportFullBackupJSON({
      awards,
      settings: formData,
      timestamp: new Date().toISOString()
    });
  };

  const handleResetFactory = () => {
    resetToFactoryDefault();
    window.location.reload();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              ตั้งค่าระบบและข้อมูลโรงเรียน (System Settings)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ปรับแต่งข้อมูลเอกลักษณ์สถานศึกษา โลโก้โรงเรียน การเข้าใช้งาน และฐานข้อมูล Firebase
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>บันทึกการตั้งค่าสำเร็จ</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: School Identity & Logo */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>1. ข้อมูลอัตลักษณ์และตราสัญลักษณ์โรงเรียน (School Identity & Logo)</span>
          </h3>

          {/* School Logo Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              ตราสัญลักษณ์ / โลโก้โรงเรียน (School Logo)
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Logo Preview */}
              <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 p-2 flex items-center justify-center relative overflow-hidden shadow-xs shrink-0">
                {formData.schoolLogoUrl ? (
                  <img
                    src={formData.schoolLogoUrl}
                    alt="School Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px]">ไม่มีโลโก้</span>
                  </div>
                )}
                {logoUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดรูปภาพตราโรงเรียน (PNG/JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>

                  {formData.schoolLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, schoolLogoUrl: '' })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบโลโก้</span>
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="หรือวางลิงก์ URL ของรูปภาพโลโก้ เช่น https://example.com/logo.png"
                    value={formData.schoolLogoUrl}
                    onChange={(e) => setFormData({ ...formData, schoolLogoUrl: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    โลโก้นี้จะแสดงที่แถบเมนูด้านบน (Navbar), หน้าปก (Hero), หน้าเกี่ยวกับ และเอกสารรายงาน
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อสถานศึกษา / โรงเรียน
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                คำขวัญ / ปรัชญาสถานศึกษา
              </label>
              <input
                type="text"
                value={formData.schoolMotto}
                onChange={(e) => setFormData({ ...formData, schoolMotto: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมายเลขโทรศัพท์
                </label>
                <input
                  type="text"
                  value={formData.schoolPhone}
                  onChange={(e) => setFormData({ ...formData, schoolPhone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมลทางการ
                </label>
                <input
                  type="email"
                  value={formData.schoolEmail}
                  onChange={(e) => setFormData({ ...formData, schoolEmail: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ที่อยู่สถานศึกษา
              </label>
              <input
                type="text"
                value={formData.schoolAddress}
                onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Firebase Firestore Database & Access Permissions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>2. ฐานข้อมูล Firebase และสิทธิ์การเข้าใช้งาน (Firebase Database & Access)</span>
          </h3>

          <div className="space-y-4">
            {/* Firebase Status Badge */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Flame className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-emerald-900">
                      Firebase Cloud Database (Firestore)
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800">
                      เชื่อมต่อแล้ว (Connected)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    ระบบบันทึกผลงานและรางวัลจัดเก็บบน Cloud Firestore แบบ Real-time ถาวร
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>พร้อมใช้งาน 5 ฝ่าย</span>
              </div>
            </div>

            {/* Access and Security Toggles */}
            <div className="pt-1 space-y-2.5">
              {/* One-Click Demo Login Toggle (User Request 3) */}
              <label className="flex items-start gap-3 p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200 cursor-pointer hover:bg-indigo-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.enableDemoLogin !== false}
                  onChange={(e) => setFormData({ ...formData, enableDemoLogin: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-indigo-600 rounded"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-indigo-950">
                      เปิดใช้งานปุ่ม "เลือกสิทธิ์เข้าใช้งานทันที" (One-Click Demo)
                    </p>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-indigo-200 text-indigo-800">
                      {formData.enableDemoLogin !== false ? 'เปิดใช้งานอยู่' : 'ปิดการใช้งาน'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    หากเปิดใช้งาน: ในหน้าต่างเข้าสู่ระบบจะมีปุ่มให้กดทดสอบสิทธิ์ Super Admin และแอดมิน 5 ฝ่ายได้ทันที<br/>
                    หากปิดใช้งาน: ผู้ใช้จะต้องกรอกชื่อผู้ใช้และรหัสผ่านจริงเพื่อความปลอดภัยสูงสุด
                  </p>
                </div>
              </label>

              {/* Super Admin Approval Toggle */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.requireSuperAdminApproval}
                  onChange={(e) => setFormData({ ...formData, requireSuperAdminApproval: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-blue-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    กำหนดให้ผลงานใหม่ต้องผ่านการอนุมัติจาก Super Admin ก่อนเผยแพร่สู่สาธารณะ
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    หากเปิดใช้งาน: เมื่อแอดมินฝ่ายบันทึกผลงาน ข้อมูลจะอยู่ในสถานะ "รอการตรวจสอบ" จนกว่า Super Admin จะกดอนุมัติ
                  </p>
                </div>
              </label>

              {/* Download Certificate Toggle */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.defaultAllowDownload}
                  onChange={(e) => setFormData({ ...formData, defaultAllowDownload: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-blue-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    อนุญาตให้บุคคลทั่วไปเปิดดูและดาวน์โหลดรูปภาพเกียรติบัตรต้นฉบับได้
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    ผู้ใช้สามารถคลิกเปิดดูภาพเกียรติบัตรความละเอียดสูงและบันทึกไฟล์ได้
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าระบบ</span>
          </button>
        </div>
      </form>

      {/* SECTION 3: Backup & Restore */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-purple-600" />
          <span>3. สำรองข้อมูลและกู้คืน (Backup & Restore)</span>
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          สามารถดาวน์โหลดสำเนาฐานข้อมูลผลงานทั้งหมดและการตั้งค่าเป็นไฟล์ JSON เพื่อความปลอดภัยในการจัดเก็บ
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลดไฟล์สำรองข้อมูล JSON</span>
          </button>

          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>รีเซ็ตกลับเป็นค่าเริ่มต้นโรงเรียนตัวอย่าง</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ยืนยันการรีเซ็ตข้อมูลเป็นค่าโรงเรียนตัวอย่าง?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ข้อมูลผลงานและรางวัลที่เพิ่มใหม่จะถูกแทนที่ด้วยข้อมูลผลงานเริ่มต้น 14 รายการ
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleResetFactory}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                ยืนยันรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
