import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  Building2, 
  HardDrive, 
  Palette, 
  ShieldCheck, 
  AlertTriangle,
  FileJson,
  FolderTree,
  FolderPlus,
  ExternalLink
} from 'lucide-react';
import { SystemSettings, Award } from '../../types';
import { exportFullBackupJSON } from '../../lib/exportUtils';
import { resetToFactoryDefault } from '../../lib/storage';
import { INITIAL_SETTINGS, DEPARTMENTS } from '../../data/mockData';
import { 
  get5DepartmentsFolderStructure, 
  createReal5DepartmentFoldersOnDrive,
  ProvisionedDriveStructure
} from '../../lib/googleDrive';

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
  const [provisioningDrive, setProvisioningDrive] = useState(false);
  const [driveProgressText, setDriveProgressText] = useState('');
  const [driveProvisionResult, setDriveProvisionResult] = useState<ProvisionedDriveStructure | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
    try {
      const cached = localStorage.getItem('school_awards_drive_structure');
      if (cached) {
        setDriveProvisionResult(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
            ปรับแต่งข้อมูลเอกลักษณ์สถานศึกษา การเชื่อมต่อ Google Drive และนโยบายความปลอดภัย
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
        {/* SECTION 1: School Identity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>1. ข้อมูลอัตลักษณ์สถานศึกษา (School Branding)</span>
          </h3>

          <div className="space-y-3.5">
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

        {/* SECTION 2: Google Drive & System Policies */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span>2. การจัดเก็บ Google Drive และนโยบายระบบ</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อโฟลเดอร์หลักบน Google Drive (Root Folder Name)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.driveRootFolderName}
                  onChange={(e) => setFormData({ ...formData, driveRootFolderName: e.target.value })}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  placeholder="เช่น ผลงานโรงเรียน"
                />
                <button
                  type="button"
                  onClick={async () => {
                    setProvisioningDrive(true);
                    setDriveError(null);
                    setDriveProgressText('กำลังเริ่มต้นเชื่อมต่อ Google Drive...');
                    try {
                      const rootName = formData.driveRootFolderName.trim() || 'ผลงานโรงเรียน';
                      const result = await createReal5DepartmentFoldersOnDrive(
                        rootName,
                        (step, total, msg) => {
                          setDriveProgressText(`[${step}/${total}] ${msg}`);
                        }
                      );
                      setDriveProvisionResult(result);
                      setFormData(prev => ({
                        ...prev,
                        driveFolderId: result.rootFolderId,
                        driveRootFolderName: result.rootFolderName
                      }));
                      // Save updated settings with real Google Drive ID
                      onSaveSettings({
                        ...formData,
                        driveFolderId: result.rootFolderId,
                        driveRootFolderName: result.rootFolderName
                      });
                      setDriveProgressText('✓ สร้างโฟลเดอร์ 5 ฝ่ายบน Google Drive เรียบร้อยแล้ว!');
                    } catch (err: any) {
                      console.error('Drive creation error:', err);
                      setDriveError(err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Drive');
                    } finally {
                      setProvisioningDrive(false);
                    }
                  }}
                  disabled={provisioningDrive}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 shrink-0"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{provisioningDrive ? 'กำลังสร้างโฟลเดอร์...' : 'สร้างโฟลเดอร์บน Google Drive จริง'}</span>
                </button>
              </div>

              {provisioningDrive && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2 text-xs text-blue-800 font-medium animate-pulse">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>{driveProgressText || 'กำลังดำเนินการสร้างโฟลเดอร์...'}</span>
                </div>
              )}

              {driveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">ไม่สามารถสร้างโฟลเดอร์บน Google Drive ได้</p>
                    <p>{driveError}</p>
                    <p className="text-[11px] text-rose-600">คำแนะนำ: กดปุ่มอีกครั้งและเลือกบัญชี Google ของท่านในหน้าต่างยืนยันสิทธิ์</p>
                  </div>
                </div>
              )}

              {driveProvisionResult && !provisioningDrive && !driveError && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-900 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>สร้างโฟลเดอร์บน Google Drive ของท่านเรียบร้อยแล้ว</span>
                    </span>
                    {driveProvisionResult.rootFolderUrl && (
                      <a
                        href={driveProvisionResult.rootFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <span>เปิดโฟลเดอร์บน Google Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Folder ID: <code className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded">{driveProvisionResult.rootFolderId}</code>
                  </p>
                </div>
              )}
            </div>

            {/* Visual 5 Departments Folder Blueprint */}
            <div className="p-4 bg-slate-900 rounded-2xl text-slate-300 font-mono text-xs space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4" />
                  <span>📁 {formData.driveRootFolderName || 'ผลงานโรงเรียน'} (Google Drive Root)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-normal">● พร้อมใช้งานสำหรับ 5 ฝ่าย</span>
              </div>
              <div className="space-y-1 pl-2 text-[11px]">
                {get5DepartmentsFolderStructure(formData.driveRootFolderName || 'ผลงานโรงเรียน').map((f) => (
                  <div key={f.departmentId} className="space-y-0.5">
                    <p className="text-slate-200 font-semibold">
                      ├── 📂 {f.departmentShort} ({f.departmentName})
                    </p>
                    <p className="pl-6 text-slate-400">├── 📄 เกียรติบัตร (Certificates)</p>
                    <p className="pl-6 text-slate-400">└── 🖼️ ภาพกิจกรรมและเอกสาร (Activities)</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.requireSuperAdminApproval}
                  onChange={(e) => setFormData({ ...formData, requireSuperAdminApproval: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    กำหนดให้ผลงานใหม่ต้องผ่านการอนุมัติจาก Super Admin ก่อนเผยแพร่
                  </p>
                  <p className="text-[10px] text-slate-500">
                    หากเปิดใช้งาน เมื่อ Admin ฝ่ายบันทึกผลงาน จะอยู่ในสถานะ "รอการตรวจสอบ"
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.defaultAllowDownload}
                  onChange={(e) => setFormData({ ...formData, defaultAllowDownload: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    อนุญาตให้บุคคลทั่วไปดาวน์โหลดไฟล์เกียรติบัตรต้นฉบับได้โดยค่าเริ่มต้น
                  </p>
                  <p className="text-[10px] text-slate-500">
                    ผู้ใช้สามารถกดเปิดไฟล์ใน Google Drive และดาวน์โหลดได้
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
