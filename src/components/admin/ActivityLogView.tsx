import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  CheckCircle2, 
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';
import { ActivityLog, AppUser, DepartmentId } from '../../types';
import { DEPARTMENTS } from '../../data/mockData';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  currentUser: AppUser;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs, currentUser }) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentId | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    // RBAC: Non-superadmin sees only their department + their actions
    if (!isSuperAdmin && log.department !== 'all' && log.department !== currentUser.department) {
      return false;
    }

    if (departmentFilter !== 'all' && log.department !== departmentFilter) {
      return false;
    }

    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.userName?.toLowerCase().includes(q) ||
        log.recordTitle?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'create':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">เพิ่มข้อมูล</span>;
      case 'update':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">แก้ไขข้อมูล</span>;
      case 'delete':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">ลบข้อมูล</span>;
      case 'approve':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">อนุมัติ</span>;
      case 'featured_toggle':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">ปักหมุดผลงาน</span>;
      case 'settings_update':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">ตั้งค่าระบบ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            ประวัติการทำงาน (Audit & Activity Logs)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            บันทึกการกระทำและกิจกรรมทั้งหมดในระบบอย่างโปร่งใส ตรวจสอบย้อนหลังได้ 100%
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้กระทำ, รายการ, รายละเอียด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
          />
        </div>

        {isSuperAdmin && (
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="all">ทุกฝ่าย (ทั้งหมด)</option>
              {Object.values(DEPARTMENTS).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
          >
            <option value="all">ทุกประเภทกิจกรรม</option>
            <option value="create">เพิ่มข้อมูล (Create)</option>
            <option value="update">แก้ไขข้อมูล (Update)</option>
            <option value="delete">ลบข้อมูล (Delete)</option>
            <option value="approve">อนุมัติข้อมูล (Approve)</option>
            <option value="featured_toggle">ปักหมุดผลงานเด่น (Featured)</option>
            <option value="settings_update">ตั้งค่าระบบ (Settings)</option>
          </select>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-36">วัน-เวลา</th>
                <th className="py-3.5 px-4">ผู้ดำเนินการ</th>
                <th className="py-3.5 px-4">ฝ่าย</th>
                <th className="py-3.5 px-4">กิจกรรม</th>
                <th className="py-3.5 px-4">รายการผลงานที่เกี่ยวข้อง</th>
                <th className="py-3.5 px-4">รายละเอียดเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                    <p className="font-medium text-slate-600">ไม่พบประวัติการทำงานตามเงื่อนไขที่เลือก</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dept = log.department !== 'all' ? DEPARTMENTS[log.department] : null;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp.replace('T', ' ').slice(0, 16)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {log.department === 'all' ? 'ทุกฝ่าย' : dept?.shortName || log.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[220px] truncate">
                        {log.recordTitle || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs max-w-[320px]">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
