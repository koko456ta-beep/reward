import React, { useState, useRef } from 'react';
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
  Building2,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  Search,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AppUser, DepartmentId, UserRole } from '../../types';
import { DEPARTMENTS } from '../../data/mockData';

interface UserManagementProps {
  users: AppUser[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser?: (userId: string) => void;
}

const PRESET_AVATARS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80', label: 'ผู้อำนวยการหญิง' },
  { id: '2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80', label: 'ครูชาย 1' },
  { id: '3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80', label: 'ครูหญิง 1' },
  { id: '4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80', label: 'ครูชาย 2' },
  { id: '5', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80', label: 'ครูหญิง 2' },
  { id: '6', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80', label: 'ครูหญิง 3' },
  { id: '7', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80', label: 'ครูชาย 3' },
  { id: '8', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=160&auto=format&fit=crop&q=80', label: 'เจ้าหน้าที่' },
];

export const UserManagement: React.FC<UserManagementProps> = ({
  users = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [targetAvatarUser, setTargetAvatarUser] = useState<AppUser | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');

  // Form fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('academic_admin');
  const [department, setDepartment] = useState<DepartmentId | 'all'>('academic');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Password visibility map in table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setDisplayName('');
    setEmail('');
    setPassword('admin1234');
    setShowPassword(true);
    setRole('academic_admin');
    setDepartment('academic');
    setPosition('เจ้าหน้าที่ประจำฝ่าย');
    setStatus('active');
    setAvatarUrl(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].url);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setEditingUser(user);
    setUsername(user.username);
    setDisplayName(user.displayName);
    setEmail(user.email);
    setPassword(user.password || 'admin1234');
    setShowPassword(false);
    setRole(user.role);
    setDepartment(user.department);
    setPosition(user.position || '');
    setStatus(user.status);
    setAvatarUrl(user.avatarUrl || PRESET_AVATARS[0].url);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenAvatarModal = (user: AppUser) => {
    setTargetAvatarUser(user);
    setAvatarUrl(user.avatarUrl || PRESET_AVATARS[0].url);
    setAvatarModalOpen(true);
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

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let newPass = '';
    for (let i = 0; i < 8; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPass);
    setShowPassword(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isQuick: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setAvatarUrl(base64);
        if (isQuick && targetAvatarUser) {
          onUpdateUser({
            ...targetAvatarUser,
            avatarUrl: base64
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim()) {
      setFormError('กรุณาระบุชื่อผู้ใช้งาน (Username)');
      return;
    }
    if (!displayName.trim()) {
      setFormError('กรุณาระบุชื่อ-นามสกุล');
      return;
    }
    if (!email.trim()) {
      setFormError('กรุณาระบุอีเมล');
      return;
    }
    if (!password.trim()) {
      setFormError('กรุณาระบุรหัสผ่าน');
      return;
    }

    // Check username uniqueness if adding or changed
    const duplicateUser = users.find(u => 
      u.username.toLowerCase() === username.trim().toLowerCase() && 
      (!editingUser || u.uid !== editingUser.uid)
    );
    if (duplicateUser) {
      setFormError(`ชื่อผู้ใช้งาน "${username}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
      return;
    }

    if (editingUser) {
      const updated: AppUser = {
        ...editingUser,
        username: username.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        department,
        position: position.trim(),
        status,
        avatarUrl: avatarUrl.trim() || editingUser.avatarUrl
      };
      onUpdateUser(updated);
    } else {
      const newUser: AppUser = {
        uid: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        username: username.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        department,
        position: position.trim() || 'เจ้าหน้าที่ประจำฝ่าย',
        status,
        createdAt: new Date().toISOString(),
        avatarUrl: avatarUrl.trim() || PRESET_AVATARS[0].url
      };
      onAddUser(newUser);
    }

    setModalOpen(false);
  };

  const handleSaveQuickAvatar = () => {
    if (targetAvatarUser) {
      onUpdateUser({
        ...targetAvatarUser,
        avatarUrl: avatarUrl.trim() || targetAvatarUser.avatarUrl
      });
      setAvatarModalOpen(false);
      setTargetAvatarUser(null);
    }
  };

  const handleToggleStatus = (user: AppUser) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    onUpdateUser({
      ...user,
      status: nextStatus
    });
  };

  const togglePasswordVisibility = (uid: string) => {
    setVisiblePasswords(prev => ({ ...prev, [uid]: !prev[uid] }));
  };

  const handleCopyPassword = (uid: string, pass?: string) => {
    const textToCopy = pass || 'admin1234';
    navigator.clipboard.writeText(textToCopy);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.displayName?.toLowerCase().includes(q);
      const matchUser = u.username?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPos = u.position?.toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchEmail && !matchPos) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการผู้ใช้งานระบบ (User Management)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เพิ่ม แก้ไข ชื่อผู้ใช้งาน อีเมล รหัสผ่าน และเปลี่ยนรูปโปรไฟล์ของผู้ดูแลระบบ 5 ฝ่าย
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">ผู้ใช้งานทั้งหมด</p>
            <p className="text-lg font-bold text-slate-900">{users.length} คน</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">ใช้งานปกติ</p>
            <p className="text-lg font-bold text-emerald-600">
              {users.filter(u => u.status === 'active').length} คน
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Super Admin</p>
            <p className="text-lg font-bold text-indigo-600">
              {users.filter(u => u.role === 'super_admin').length} คน
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Admin ฝ่ายต่างๆ</p>
            <p className="text-lg font-bold text-amber-600">
              {users.filter(u => u.role !== 'super_admin').length} คน
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, Username, อีเมล หรือตำแหน่ง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">กรองตามสิทธิ์:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
          >
            <option value="all">ทุกสิทธิ์การใช้งาน ({users.length})</option>
            <option value="super_admin">Super Admin</option>
            <option value="academic_admin">ฝ่ายวิชาการ</option>
            <option value="affairs_admin">ฝ่ายกิจการนักเรียน</option>
            <option value="general_admin">ฝ่ายทั่วไป</option>
            <option value="personnel_admin">ฝ่ายบุคคล</option>
            <option value="budget_admin">ฝ่ายงบประมาณ</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">โปรไฟล์ / ชื่อผู้ใช้งาน</th>
                <th className="py-3.5 px-4">Username & อีเมล</th>
                <th className="py-3.5 px-4">รหัสผ่าน (Password)</th>
                <th className="py-3.5 px-4">สิทธิ์ / ฝ่าย</th>
                <th className="py-3.5 px-4">ตำแหน่ง</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขค้นหา</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => {
                  const dept = usr.department !== 'all' ? DEPARTMENTS[usr.department] : null;
                  const isSuper = usr.role === 'super_admin';
                  const isPasswordVisible = !!visiblePasswords[usr.uid];
                  const userPassword = usr.password || 'admin1234';

                  return (
                    <tr key={usr.uid} className="hover:bg-slate-50/80 transition-colors">
                      {/* Avatar & Display Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative group cursor-pointer" onClick={() => handleOpenAvatarModal(usr)}>
                            <img
                              src={usr.avatarUrl || PRESET_AVATARS[0].url}
                              alt={usr.displayName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-blue-500 transition-all shadow-xs"
                            />
                            <div 
                              className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
                            >
                              <Camera className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{usr.displayName}</span>
                            </div>
                            <button
                              onClick={() => handleOpenAvatarModal(usr)}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5 mt-0.5"
                            >
                              <Camera className="w-3 h-3" />
                              <span>เปลี่ยนรูปโปรไฟล์</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Username & Email */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-mono text-xs text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded inline-block">
                          @{usr.username}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{usr.email}</span>
                        </div>
                      </td>

                      {/* Password Field */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl w-fit">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-xs font-semibold text-slate-800 tracking-wider">
                            {isPasswordVisible ? userPassword : '••••••••'}
                          </span>
                          
                          <button
                            onClick={() => togglePasswordVisibility(usr.uid)}
                            title={isPasswordVisible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleCopyPassword(usr.uid, userPassword)}
                            title="คัดลอกรหัสผ่าน"
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {copiedUid === usr.uid ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          isSuper ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : dept?.bgColor || 'bg-slate-100'
                        }`}>
                          {isSuper ? '👑 Super Admin' : dept?.name}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="text-xs">{usr.position || '-'}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(usr)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
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

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(usr)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>

                          {onDeleteUser && usr.role !== 'super_admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน "${usr.displayName}"?`)) {
                                  onDeleteUser(usr.uid);
                                }
                              }}
                              className="p-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="ลบผู้ใช้งาน"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT USER COMPREHENSIVE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {editingUser ? 'แก้ไขข้อมูลผู้ใช้งานและรหัสผ่าน' : 'เพิ่มผู้ใช้งานระบบใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="p-6 space-y-5">
              {/* SECTION: Profile Photo Picker */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>รูปโปรไฟล์ผู้ใช้งาน (Profile Picture)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">อัปโหลดไฟล์ หรือเลือกรูปที่มีให้</span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Live Avatar Preview */}
                  <div className="relative shrink-0">
                    <img
                      src={avatarUrl || PRESET_AVATARS[0].url}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500 shadow-md"
                    />
                  </div>

                  {/* Upload button & Custom URL */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, false)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>อัปโหลดรูปจากเครื่อง</span>
                      </button>
                    </div>

                    <input
                      type="url"
                      placeholder="หรือระบุ URL รูปภาพ (https://...)"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 mb-1.5">เลือกรูปโปรไฟล์ด่วน (Presets):</p>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_AVATARS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAvatarUrl(p.url)}
                        title={p.label}
                        className={`relative rounded-full overflow-hidden transition-all aspect-square border-2 ${
                          avatarUrl === p.url ? 'border-blue-600 scale-105 ring-2 ring-blue-200' : 'border-transparent hover:opacity-80'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION: Account Credentials */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>ข้อมูลบัญชีและรหัสผ่านเข้าสู่ระบบ</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล ผู้ใช้งาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น อ.พรทิพย์ รัตนวิชัย หรือ ดร.สมชาย"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อผู้ใช้งาน (Username) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น academic_admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      อีเมล (Email) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="เช่น academic@school.ac.th"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>รหัสผ่านเข้าสู่ระบบ (Password)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>สุ่มรหัสผ่านอัตโนมัติ</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="กำหนดรหัสผ่าน เช่น admin1234"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-semibold focus:bg-white focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    แอดมินสามารถกำหนดรหัสผ่านใหม่ หรือคัดลอกส่งให้ผู้ใช้งานได้ทันที
                  </p>
                </div>
              </div>

              {/* SECTION: Role & Permissions */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>สิทธิ์การใช้งานและตำแหน่ง</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ระดับสิทธิ์ (Role & Department)
                    </label>
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold focus:bg-white focus:border-blue-500"
                    >
                      <option value="super_admin">👑 Super Admin (ผู้อำนวยการ)</option>
                      <option value="academic_admin">📘 Admin ฝ่ายวิชาการ</option>
                      <option value="affairs_admin">✨ Admin ฝ่ายกิจการนักเรียน</option>
                      <option value="general_admin">🏫 Admin ฝ่ายทั่วไปโรงเรียน</option>
                      <option value="personnel_admin">👥 Admin ฝ่ายบุคคล</option>
                      <option value="budget_admin">💰 Admin ฝ่ายงบประมาณ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      สถานะบัญชี
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold focus:bg-white focus:border-blue-500"
                    >
                      <option value="active">✅ เปิดใช้งานปกติ (Active)</option>
                      <option value="inactive">⛔ ระงับการใช้งานชั่วคราว (Inactive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่งทางราชการ / กลุ่มสาระฯ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ครูชำนาญการพิเศษ, หัวหน้ากลุ่มงานวิชาการ"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingUser ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้งานใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK AVATAR PICKER MODAL */}
      {avatarModalOpen && targetAvatarUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">เปลี่ยนรูปโปรไฟล์</h3>
                <p className="text-xs text-slate-500">{targetAvatarUser.displayName}</p>
              </div>
              <button
                onClick={() => setAvatarModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <img
                src={avatarUrl || targetAvatarUser.avatarUrl || PRESET_AVATARS[0].url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-500 shadow-md mb-3"
              />

              <input
                type="file"
                ref={quickFileInputRef}
                accept="image/*"
                onChange={(e) => handleImageFileUpload(e, true)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => quickFileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>เลือกรูปภาพจากเครื่อง</span>
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">หรือเลือกรูปโปรไฟล์สำเร็จรูป:</p>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAvatarUrl(p.url)}
                    className={`rounded-2xl overflow-hidden border-2 transition-all p-1 ${
                      avatarUrl === p.url ? 'border-blue-600 bg-blue-50 scale-105' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-14 object-cover rounded-xl" />
                    <p className="text-[10px] text-slate-600 mt-1 truncate">{p.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveQuickAvatar}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                บันทึกรูปโปรไฟล์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
