import React from 'react';
import { 
  Trophy, 
  Building2, 
  GraduationCap, 
  Sparkles, 
  Users, 
  Coins, 
  ShieldCheck, 
  HardDrive, 
  QrCode, 
  Printer, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { SystemSettings } from '../types';
import { DEPARTMENTS, INITIAL_SETTINGS } from '../data/mockData';
import schoolBannerBg from '../assets/images/school_banner_bg_1788001743945.jpg';

interface AboutViewProps {
  settings?: SystemSettings;
}

export const AboutView: React.FC<AboutViewProps> = ({ settings = INITIAL_SETTINGS }) => {
  const safeSettings = settings || INITIAL_SETTINGS;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Intro */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800">
        {/* Background Image with Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 transform scale-105"
          style={{ backgroundImage: `url(${schoolBannerBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 backdrop-blur-[1px]" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            {safeSettings.schoolLogoUrl ? (
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src={safeSettings.schoolLogoUrl}
                  alt={safeSettings.schoolName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>ระบบจัดเก็บผลงานและรางวัลของโรงเรียน</span>
              </div>
            )}
            {safeSettings.schoolLogoUrl && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>ระบบจัดเก็บผลงานและรางวัลของโรงเรียน</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug">
            {safeSettings.schoolName}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            {safeSettings.schoolMotto}
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ความปลอดภัยตามมาตรฐาน RBAC 5 ฝ่าย</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>จัดเก็บบนคลาวด์ Firebase Firestore Real-time</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>ระบบสร้าง QR Code และพิมพ์รายงานมาตรฐาน</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Departments Structure */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            โครงสร้างการบริหารและจัดเก็บผลงาน 5 ฝ่าย
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            แต่ละฝ่ายมีผู้ดูแลระบบเฉพาะในการบันทึกและตรวจสอบผลงานของตนเอง
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.values(DEPARTMENTS).map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-sm"
                    style={{ backgroundColor: dept.color }}
                  >
                    {dept.shortName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{dept.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">ID: {dept.id}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ฐานข้อมูล: Firebase Firestore / awards ({dept.shortName})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & School Information */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          ข้อมูลการติดต่อสถานศึกษา
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-700">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">ที่อยู่สถานศึกษา</p>
              <p className="text-slate-600 text-xs mt-0.5">{safeSettings.schoolAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">หมายเลขโทรศัพท์</p>
              <p className="text-slate-600 text-xs mt-0.5">{safeSettings.schoolPhone}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-purple-600 shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">อีเมลติดต่อ</p>
              <p className="text-slate-600 text-xs mt-0.5">{safeSettings.schoolEmail}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">เว็บไซต์ทางการ</p>
              <p className="text-slate-600 text-xs mt-0.5">{safeSettings.schoolWebsite}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
