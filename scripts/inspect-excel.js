const XLSX = require('xlsx');
const path = '/Users/keertanbhatt/Downloads/VOUCHER FILE 2026-27.xlsx';
const wb = XLSX.readFile(path);

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  let maxCols = 0;
  for (const row of data) {
    if (row.length > maxCols) maxCols = row.length;
  }
  console.log('\n=== SHEET:', name, '===');
  console.log('Rows:', data.length, 'Max cols:', maxCols, 'Range:', ws['!ref']);
  for (let i = 0; i < Math.min(25, data.length); i++) {
    console.log(i, JSON.stringify(data[i]));
  }
  if (data.length > 25) {
    console.log('... rows 25-40 ...');
    for (let i = 25; i < Math.min(40, data.length); i++) {
      console.log(i, JSON.stringify(data[i]));
    }
  }
}
