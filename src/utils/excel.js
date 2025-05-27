import * as XLSX from 'xlsx';

export function exportAllToExcel(subscriptions, purchases) {
  const subSheet = XLSX.utils.json_to_sheet(subscriptions);
  const purSheet = XLSX.utils.json_to_sheet(purchases);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, subSheet, '订阅');
  XLSX.utils.book_append_sheet(wb, purSheet, '好物');
  XLSX.writeFile(wb, '地球Online装备库.xlsx');
}

export function importAllFromExcel(file, onData) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const subscriptions = XLSX.utils.sheet_to_json(workbook.Sheets['订阅'] || {});
    const purchases = XLSX.utils.sheet_to_json(workbook.Sheets['好物'] || {});
    onData({ subscriptions, purchases });
  };
  reader.readAsArrayBuffer(file);
}

