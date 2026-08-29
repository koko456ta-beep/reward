export type DepartmentId = 'academic' | 'affairs' | 'general' | 'personnel' | 'budget';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
}

export type AwardLevel = 'international' | 'national' | 'regional' | 'provincial' | 'district' | 'school';

export interface AwardLevelInfo {
  id: AwardLevel;
  name: string;
  nameEn: string;
  rank: number; // 1 = highest (international) to 6 = school
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconColor: string;
}

export type AwardStatus = 'draft' | 'pending' | 'published' | 'archived';

export type RecipientType = 'student' | 'teacher' | 'team' | 'school' | 'personnel';

export interface Award {
  id: string;
  awardName: string;
  recipientName: string;
  recipientType?: RecipientType;
  department: DepartmentId;
  level: AwardLevel;
  academicYear: string;
  awardDate: string; // YYYY-MM-DD
  description: string;
  organizer?: string; // หน่วยงานผู้จัด
  certificateFileId?: string;
  certificateUrl: string;
  imageUrl?: string;
  imageFileId?: string;
  status: AwardStatus;
  featured: boolean;
  allowDownload: boolean;
  tags?: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deleted?: boolean;
  driveFolder?: string;
  viewsCount?: number;
}

export type UserRole = 'super_admin' | 'academic_admin' | 'affairs_admin' | 'general_admin' | 'personnel_admin' | 'budget_admin';

export interface AppUser {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  department: DepartmentId | 'all';
  status: 'active' | 'inactive';
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  position?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  department: DepartmentId | 'all';
  action: 'create' | 'update' | 'delete' | 'restore' | 'approve' | 'archive' | 'featured_toggle' | 'export' | 'settings_update' | 'login';
  recordId?: string;
  recordTitle?: string;
  details: string;
  timestamp: string;
}

export interface AcademicYear {
  id: string;
  year: string; // e.g. "2569"
  label: string; // e.g. "ปีการศึกษา 2569"
  isCurrent: boolean;
  awardsCount?: number;
}

export interface SystemSettings {
  schoolName: string;
  schoolMotto: string;
  schoolLogoUrl: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite: string;
  primaryColor: string; // Hex e.g. #1e40af
  secondaryColor: string; // Hex e.g. #f59e0b
  accentColor: string;
  requireSuperAdminApproval: boolean;
  defaultAllowDownload: boolean;
  enableDemoLogin: boolean; // Toggle One-Click Demo login
  enableHallOfFame: boolean;
  enableActivityLogging: boolean;
  itemsPerPage: number;
}

export interface AwardFilterState {
  search: string;
  department: DepartmentId | 'all';
  level: AwardLevel | 'all';
  academicYear: string | 'all';
  featuredOnly: boolean;
  sortBy: 'newest' | 'oldest' | 'name';
}

export interface AwardFilterOptions {
  searchQuery: string;
  department: DepartmentId | 'all';
  level: AwardLevel | 'all';
  academicYear: string | 'all';
  recipientType: RecipientType | 'all';
  sortBy: 'latest' | 'oldest' | 'highest_level' | 'name_asc' | 'recipient_asc';
  onlyFeatured: boolean;
  status: AwardStatus | 'all';
}
