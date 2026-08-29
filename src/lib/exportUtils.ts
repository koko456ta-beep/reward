import { Award, SystemSettings } from '../types';
import { DEPARTMENTS, AWARD_LEVELS } from '../data/mockData';

/**
 * Downloads an image directly to the client's device as a file.
 * Handles data URLs (base64) as well as cross-origin HTTP URLs via Fetch Blob or Canvas conversion.
 */
export async function downloadAwardImage(imageUrl: string, defaultFilename = 'certificate.jpg'): Promise<void> {
  if (!imageUrl) return;

  const sanitizedFilename = defaultFilename
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim() || 'certificate.jpg';

  const finalFilename = sanitizedFilename.endsWith('.jpg') || sanitizedFilename.endsWith('.png') || sanitizedFilename.endsWith('.jpeg')
    ? sanitizedFilename
    : `${sanitizedFilename}.jpg`;

  // 1. Data URL (e.g. uploaded base64 image)
  if (imageUrl.startsWith('data:image/')) {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // 2. Try Fetch Blob with CORS
  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2500);
      return;
    }
  } catch (err) {
    console.warn('Direct fetch failed, falling back to Canvas draw', err);
  }

  // 3. Fallback: Draw into HTML5 Canvas to create local blob
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 1200;
        canvas.height = img.naturalHeight || img.height || 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const objectUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = objectUrl;
              a.download = finalFilename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(objectUrl), 2500);
            } else {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
              const a = document.createElement('a');
              a.href = dataUrl;
              a.download = finalFilename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          }, 'image/jpeg', 0.95);
        }
      } catch (canvasErr) {
        console.warn('Canvas conversion failed, direct trigger', canvasErr);
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = finalFilename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    img.onerror = () => {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = finalFilename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = imageUrl;
  } catch {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = finalFilename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

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
