import { Award, SystemSettings } from '../types';
import { DEPARTMENTS, AWARD_LEVELS } from '../data/mockData';

/**
 * Generates an elegant fallback digital certificate canvas and downloads it.
 */
function generateAndDownloadCertificateCanvas(awardData: Partial<Award> | undefined, filename: string) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1131; // Standard A4 landscape ratio
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background - Elegant Cream Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1131);
    bgGrad.addColorStop(0, '#fbfcfe');
    bgGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1600, 1131);

    // Decorative Borders
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 1540, 1071);

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, 1504, 1035);

    // Header Golden Emblem
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 36px "Prompt", "Sarabun", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('โรงเรียนศึกษาพิเศษชัยนาท', 800, 160);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 54px "Prompt", "Sarabun", sans-serif';
    ctx.fillText('เกียรติบัตรเชิดชูเกียรติ', 800, 250);

    ctx.fillStyle = '#64748b';
    ctx.font = '28px "Prompt", "Sarabun", sans-serif';
    ctx.fillText('ขอมอบเกียรติบัตรฉบับนี้ไว้เพื่อแสดงว่า', 800, 340);

    // Recipient Name
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 64px "Prompt", "Sarabun", sans-serif';
    ctx.fillText(awardData?.recipientName || 'ผู้ได้รับรางวัล', 800, 460);

    // Description & Award Name
    ctx.fillStyle = '#334155';
    ctx.font = '32px "Prompt", "Sarabun", sans-serif';
    ctx.fillText('ได้รับรางวัลเชิดชูเกียรติ', 800, 560);

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 44px "Prompt", "Sarabun", sans-serif';
    ctx.fillText(`"${awardData?.awardName || 'ผลงานยอดเยี่ยม'}"`, 800, 650);

    if (awardData?.organizer) {
      ctx.fillStyle = '#475569';
      ctx.font = '26px "Prompt", "Sarabun", sans-serif';
      ctx.fillText(`จัดโดย: ${awardData.organizer}`, 800, 730);
    }

    // Level & Academic Year
    ctx.fillStyle = '#0f172a';
    ctx.font = '26px "Prompt", "Sarabun", sans-serif';
    ctx.fillText(`ระดับการแข่งขัน: ${awardData?.level || 'ระดับชาติ'} | ปีการศึกษา ${awardData?.academicYear || '2569'}`, 800, 800);

    // Footer lines
    ctx.fillStyle = '#64748b';
    ctx.font = '22px "Prompt", "Sarabun", sans-serif';
    ctx.fillText(`ให้ไว้ ณ วันที่ ${awardData?.awardDate || new Date().toLocaleDateString('th-TH')}`, 800, 930);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 24px "Prompt", "Sarabun", sans-serif';
    ctx.fillText('ขอให้มีความสุข ความเจริญ และรักษาเกียรติประวัตินี้สืบไป', 800, 990);

    canvas.toBlob((blob) => {
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 2500);
      }
    }, 'image/jpeg', 0.95);
  } catch (err) {
    console.error('Certificate canvas generator error', err);
  }
}

/**
 * Downloads an image directly to the client's device as a file.
 * Handles data URLs (base64) as well as cross-origin HTTP URLs via Fetch Blob or Canvas conversion.
 */
export async function downloadAwardImage(
  imageUrl: string, 
  defaultFilename = 'certificate.jpg',
  awardMetadata?: Partial<Award>
): Promise<void> {
  const sanitizedFilename = (defaultFilename || 'certificate.jpg')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim() || 'certificate.jpg';

  const finalFilename = sanitizedFilename.endsWith('.jpg') || sanitizedFilename.endsWith('.png') || sanitizedFilename.endsWith('.jpeg')
    ? sanitizedFilename
    : `${sanitizedFilename}.jpg`;

  if (!imageUrl) {
    generateAndDownloadCertificateCanvas(awardMetadata, finalFilename);
    return;
  }

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
    let triggered = false;

    img.onload = () => {
      if (triggered) return;
      triggered = true;
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
              generateAndDownloadCertificateCanvas(awardMetadata, finalFilename);
            }
          }, 'image/jpeg', 0.95);
        } else {
          generateAndDownloadCertificateCanvas(awardMetadata, finalFilename);
        }
      } catch {
        generateAndDownloadCertificateCanvas(awardMetadata, finalFilename);
      }
    };

    img.onerror = () => {
      if (triggered) return;
      triggered = true;
      generateAndDownloadCertificateCanvas(awardMetadata, finalFilename);
    };

    img.src = imageUrl;

    // Timeout safety
    setTimeout(() => {
      if (!triggered) {
        triggered = true;
        generateAndDownloadCertificateCanvas(awardMetadata, finalFilename);
      }
    }, 2000);
  } catch {
    generateAndDownloadCertificateCanvas(awardMetadata, finalFilename);
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
