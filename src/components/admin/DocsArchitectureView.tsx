import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  HardDrive, 
  Sparkles, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Lock, 
  FolderTree, 
  Zap,
  Building2
} from 'lucide-react';
import { DEPARTMENTS } from '../../data/mockData';

export const DocsArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>เอกสารสถาปัตยกรรมและคู่มือระบบ</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          คู่มือการทำงานและโครงสร้างระบบจัดเก็บผลงาน 5 ฝ่าย
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          วิเคราะห์สถาปัตยกรรม (Architecture Analysis), แผนผังความปลอดภัย, และการเชื่อมต่อ Google Drive
        </p>
      </div>

      {/* SECTION 1: Architecture Highlights */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>1. แผนผังสถาปัตยกรรมระบบ (System Architecture)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Frontend Layer</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              React 18 + Vite + Tailwind CSS พร้อมระบบ Lightbox ดูภาพขยาย, ค้นหาแบบ Real-time และ Responsive เต็มรูปแบบบนมือถือ แท็บเล็ต และคอมพิวเตอร์
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>Storage Layer</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Google Drive Integration:</strong> ลดค่าใช้จ่าย Firebase Storage โดยจัดเก็บไฟล์เกียรติบัตรต้นฉบับและภาพผลงานบน Google Drive พร้อมระบบแยกโฟลเดอร์ตาม 5 ฝ่าย
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-900">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Security & RBAC</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              ระบบตรวจสอบสิทธิ์แบบแยก 5 ฝ่าย (Department-based RBAC) และ Super Admin พร้อมบันทึกประวัติการทำงาน Audit Log ทุกขั้นตอน
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: 5 Departments Role Matrix */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span>2. เมทริกซ์สิทธิ์การใช้งาน 5 ฝ่าย (RBAC Permission Matrix)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">บทบาท (Role)</th>
                <th className="py-2.5 px-3">ขอบเขตข้อมูลที่จัดการได้</th>
                <th className="py-2.5 px-3">อนุมัติ/ปักหมุด</th>
                <th className="py-2.5 px-3">จัดการผู้ใช้/ระบบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-indigo-50/30">
                <td className="py-2.5 px-3 font-bold text-indigo-900">👑 Super Admin</td>
                <td className="py-2.5 px-3 text-slate-700">ทุกฝ่าย (วิชาการ, กิจการ, ทั่วไป, บุคคล, งบประมาณ)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-semibold">✓ อนุมัติได้ทุกรายการ</td>
                <td className="py-2.5 px-3 text-emerald-600 font-semibold">✓ จัดการได้ทั้งหมด</td>
              </tr>
              {Object.values(DEPARTMENTS).map((d) => (
                <tr key={d.id}>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ backgroundColor: d.color }} />
                    Admin {d.shortName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">เฉพาะข้อมูลของฝ่าย {d.name} เท่านั้น</td>
                  <td className="py-2.5 px-3 text-slate-500">บันทึก/ส่งตรวจสอบ</td>
                  <td className="py-2.5 px-3 text-slate-400">✗ ไม่มีสิทธิ์</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Google Drive Folder Structure */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-amber-600" />
          <span>3. โครงสร้างโฟลเดอร์ Google Drive (Folder Structure Standard)</span>
        </h3>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-1.5 overflow-x-auto">
          <p className="text-amber-400">📁 ผลงานโรงเรียน/ (Root Folder)</p>
          <p className="pl-4">├── 📁 ฝ่ายวิชาการ/ (Academic)</p>
          <p className="pl-8 text-slate-400">├── 📁 เกียรติบัตร/</p>
          <p className="pl-8 text-slate-400">└── 📁 ภาพถ่ายผลงาน/</p>
          <p className="pl-4">├── 📁 ฝ่ายกิจการนักเรียน/ (Affairs)</p>
          <p className="pl-8 text-slate-400">├── 📁 เกียรติบัตร/</p>
          <p className="pl-8 text-slate-400">└── 📁 ภาพถ่ายผลงาน/</p>
          <p className="pl-4">├── 📁 ฝ่ายทั่วไปโรงเรียน/ (General)</p>
          <p className="pl-4">├── 📁 ฝ่ายบุคคล/ (Personnel)</p>
          <p className="pl-4">└── 📁 ฝ่ายงบประมาณ/ (Budget)</p>
        </div>
      </div>

      {/* SECTION 4: Client Compression Engine */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-rose-600" />
          <span>4. กลไกบีบอัดรูปภาพอัจฉริยะ (Client-Side Compression Engine)</span>
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          ระบบประมวลผลการบีบอัดภาพเกียรติบัตรบนเบราว์เซอร์ของผู้ใช้โดยตรงก่อนส่งขึ้นคลาวด์ ผ่าน HTML5 Canvas Resolution Scaling (Max 1920px, Quality 0.85) ช่วยลดขนาดไฟล์ภาพจาก 5-8MB ลงเหลือเฉลี่ยเพียง 400-800KB โดยที่ตัวหนังสือและตราโรงเรียนบนเกียรติบัตรยังคงคมชัด 100% ทำให้เปิดดูได้เร็วแม้บนเครือข่ายมือถือ
        </p>
      </div>
    </div>
  );
};
