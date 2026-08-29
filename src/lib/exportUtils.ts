import { Award, SystemSettings } from '../types';
import { DEPARTMENTS, AWARD_LEVELS } from '../data/mockData';

/**
 * Exports awards list to CSV with UTF-8 BOM so Excel on Windows/Mac renders Thai characters cleanly.
 */
export function exportAwardsToCSV(awards: Award[], filename = 'school_awards_report.csv') {
  const headers = [
    'ลำดับ',
    'ชื่อรางวัล',
    'ผู้รับรางวัล',
    'ประเภทผู้รับ',
    'ฝ่าย',
    'ระดับรางวัล',
    'ปีการศึกษา',
    'วันที่ได้รับรางวัล',
    'หน่วยงานผู้จัด',
    'สถานะ',
    'URL เกียรติบัตร',
    'Google Drive File ID',
    'คำอธิบาย',
    'ผู้บันทึก',
    'วันที่บันทึก'
  ];

  const rows = awards.map((award, index) => {
    const deptName = DEPARTMENTS[award.department]?.name || award.department;
    const levelName = AWARD_LEVELS[award.level]?.name || award.level;
    
    return [
      (index + 1).toString(),
      `"${(award.awardName || '').replace(/"/g, '""')}"`,
      `"${(award.recipientName || '').replace(/"/g, '""')}"`,
      award.recipientType || 'นักเรียน',
      deptName,
      levelName,
      award.academicYear || '',
      award.awardDate || '',
      `"${(award.organizer || '').replace(/"/g, '""')}"`,
      award.status || 'published',
      `"${award.certificateUrl || ''}"`,
      award.certificateFileId || '',
      `"${(award.description || '').replace(/"/g, '""')}"`,
      `"${(award.createdByName || '').replace(/"/g, '""')}"`,
      award.createdAt || ''
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Backup full database to a JSON file
 */
export function exportFullBackupJSON(data: {
  awards: Award[];
  settings: SystemSettings;
  timestamp: string;
}) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `school_awards_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger browser print dialog
 */
export function triggerPrint() {
  window.print();
}
