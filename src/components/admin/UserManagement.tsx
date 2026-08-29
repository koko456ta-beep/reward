import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Edit2, 
  Key, 
  CheckCircle, 
  XCircle, 
  X, 
  AlertCircle,
  Mail,
  User,
  Building2
} from 'lucide-react';
import { AppUser, DepartmentId, UserRole } from '../../types';
import { DEPARTMENTS } from '../../data/mockData';

interface UserManagementProps {
  users: AppUser[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onAddUser,
  onUpdateUser
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('academic_admin');
  const [department, setDepartment] = useState<DepartmentId | 'all'>('academic');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setDisplayName('');
    setEmail('');
    setRole('academic_admin');
    setDepartment('academic');
    setPosition('เจ้าหน้าที่ประจำฝ่าย');
    setStatus('active');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setEditingUser(user);
    setUsername(user.username);
    setDisplayName(user.displayName);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department);
    setPosition(user.position || '');
    setStatus(user.status);
    setFormError('');
    setModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'super_admin') {
      setDepartment('all');
    } else {
      const matchDept = newRole.replace('_admin', '') as DepartmentId;
      setDepartment(matchDept);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !displayName.trim() || !email.trim()) {
      setFormError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (editingUser) {
      const updated: AppUser = {
        ...editingUser,
        username: username.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        role,
        department,
        position: position.trim(),
        status
      };
      onUpdateUser(updated);
    } else {
      const newUser: AppUser = {
        uid: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        username: username.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        role,
        department,
        position: position.trim(),
        status,
        createdAt: new Date().toISOString(),
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + users.length}?w=120&auto=format&fit=crop&q=80`
      };
      onAddUser(newUser);
    }

    setModalOpen(false);
  };

  const handleToggleStatus = (user: AppUser) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    onUpdateUser({
      ...user,
      status: nextStatus
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการผู้ใช้งานระบบ (User Management)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            กำหนดสิทธิ์การเข้าถึงและการดูแลข้อมูลตามฝ่าย 5 ฝ่ายหลักของสถานศึกษา
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">ผู้ใช้งาน</th>
                <th className="py-3.5 px-4">ชื่อผู้ใช้ / อีเมล</th>
                <th className="py-3.5 px-4">สิทธิ์ / ฝ่ายที่รับผิดชอบ</th>
                <th className="py-3.5 px-4">ตำแหน่ง</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4">เข้าสู่ระบบล่าสุด</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((usr) => {
                const dept = usr.department !== 'all' ? DEPARTMENTS[usr.department] : null;
                const isSuper = usr.role === 'super_admin';

                return (
                  <tr key={usr.uid} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={usr.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={usr.displayName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div className="font-semibold text-slate-900">
                          {usr.displayName}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-mono text-xs text-slate-900 font-medium">{usr.username}</p>
                      <p className="text-[11px] text-slate-400">{usr.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isSuper ? 'bg-indigo-100 text-indigo-800' : dept?.bgColor || 'bg-slate-100'
                      }`}>
                        {isSuper ? '👑 Super Admin' : dept?.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {usr.position || '-'}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(usr)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          usr.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {usr.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-600" />
                        )}
                        <span>{usr.status === 'active' ? 'ใช้งานปกติ' : 'ระงับการใช้งาน'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {usr.lastLogin ? usr.lastLogin.replace('T', ' ').slice(0, 16) : 'ไม่เคยเข้าสู่ระบบ'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(usr)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        แก้ไขสิทธิ์
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'แก้ไขข้อมูลและสิทธิ์ผู้ใช้งาน' : 'เพิ่มผู้ใช้งานระบบใหม่'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล และตำแหน่ง
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อ.พรทิพย์ รัตนวิชัย"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="academic_admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมล (Email)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="academic@school.ac.th"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ระดับสิทธิ์การใช้งาน (Role & RBAC)
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                >
                  <option value="super_admin">👑 Super Admin (ผู้อำนวยการ/ดูแลสูงสุดทุกฝ่าย)</option>
                  <option value="academic_admin">📘 Admin ฝ่ายวิชาการ</option>
                  <option value="affairs_admin">✨ Admin ฝ่ายกิจการนักเรียน</option>
                  <option value="general_admin">🏫 Admin ฝ่ายทั่วไปโรงเรียน</option>
                  <option value="personnel_admin">👥 Admin ฝ่ายบุคคล</option>
                  <option value="budget_admin">💰 Admin ฝ่ายงบประมาณ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ตำแหน่งทางราชการ / กลุ่มสาระฯ
                </label>
                <input
                  type="text"
                  placeholder="เช่น หัวหน้ากลุ่มงานวิชาการ"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  {editingUser ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้งาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
