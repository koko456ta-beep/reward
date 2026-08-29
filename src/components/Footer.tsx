import React from 'react';
import { Trophy, Shield, Heart, HardDrive, ExternalLink } from 'lucide-react';
import { SystemSettings, DepartmentId } from '../types';
import { DEPARTMENTS, INITIAL_SETTINGS } from '../data/mockData';

interface FooterProps {
  settings?: SystemSettings;
  onSelectDepartment?: (dept: DepartmentId | 'all') => void;
  onOpenLogin?: () => void;
  onGoToAbout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings = INITIAL_SETTINGS,
  onSelectDepartment,
  onOpenLogin,
  onGoToAbout
}) => {
  const safeSettings = settings || INITIAL_SETTINGS;
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: School Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <span>{safeSettings.schoolName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              ระบบจัดเก็บและเผยแพร่ผลงาน/รางวัลของโรงเรียน แยกตาม 5 ฝ่ายหลักอย่างเป็นระบบ ปลอดภัย และเชื่อมต่อคลาวด์ Google Drive
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              {safeSettings.schoolAddress}
            </div>
          </div>

          {/* Col 2: 5 Departments Links */}
          <div className="space-y-2.5">
            <p className="text-white font-semibold text-xs uppercase tracking-wider">
              ผลงานแยกตาม 5 ฝ่าย
            </p>
            <ul className="space-y-1.5">
              {Object.values(DEPARTMENTS).map((dept) => (
                <li key={dept.id}>
                  <button
                    onClick={() => onSelectDepartment && onSelectDepartment(dept.id)}
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span>{dept.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: System Features */}
          <div className="space-y-2.5">
            <p className="text-white font-semibold text-xs uppercase tracking-wider">
              บริการและระบบ
            </p>
            <ul className="space-y-1.5">
              <li>
                <button onClick={onGoToAbout} className="hover:text-white transition-colors">
                  เกี่ยวกับระบบและโครงสร้างฝ่าย
                </button>
              </li>
              <li>
                <button onClick={onOpenLogin} className="hover:text-white transition-colors">
                  เข้าสู่ระบบเจ้าหน้าที่ (Admin Login)
                </button>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Drive Storage Integration</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>RBAC Role-Based Access Control</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacts & Official Links */}
          <div className="space-y-2.5">
            <p className="text-white font-semibold text-xs uppercase tracking-wider">
              ติดต่อและสอบถาม
            </p>
            <p className="text-xs">
              โทรศัพท์: {safeSettings.schoolPhone}
            </p>
            <p className="text-xs">
              อีเมล: {safeSettings.schoolEmail}
            </p>
            <p className="text-xs truncate">
              เว็บไซต์: <a href={safeSettings.schoolWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{safeSettings.schoolWebsite}</a>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {safeSettings.schoolName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>ระบบจัดเก็บผลงานและรางวัลของโรงเรียน v2.5</span>
            <span>•</span>
            <span>Google Drive & Firebase Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
