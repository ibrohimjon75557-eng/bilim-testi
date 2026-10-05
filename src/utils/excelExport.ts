import * as XLSX from 'xlsx';
import { Attempt } from '../types';

export function formatSecondsUz(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins} daq ${secs} son`;
}

export function exportResultsToExcel(attempts: Attempt[], filenamePrefix = 'BilimTest_Natijalar') {
  const rows = attempts.map((att, idx) => {
    const fullName = (att.student_name || 'Noma’lum O‘quvchi').split(' ');
    const firstName = fullName[0] || '';
    const lastName = fullName.slice(1).join(' ') || '';

    return {
      '№': idx + 1,
      Ism: firstName,
      Familiya: lastName,
      Telefon: att.student_phone || '-',
      Guruh: att.group_name || '-',
      Test: att.test_title || '-',
      Ball: att.score,
      'Max ball': att.max_score,
      Foiz: `${att.percentage}%`,
      Natija: att.passed ? "O'TDI" : "O'TMADI",
      'Boshlangan vaqt': att.started_at
        ? new Date(att.started_at).toLocaleString('uz-UZ')
        : '-',
      'Tugagan vaqt': att.finished_at
        ? new Date(att.finished_at).toLocaleString('uz-UZ')
        : '-',
      'Sarflangan vaqt': formatSecondsUz(att.time_spent || 0),
      'Oynadan chiqishlar': att.tab_switch_count || 0,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    { wch: 32 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Natijalar');

  const datePart = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}_${datePart}.xlsx`);
}
