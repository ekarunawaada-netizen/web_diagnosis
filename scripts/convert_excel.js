const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = 'Daftar_Penyakit(AutoRecovered).xlsx';
const OUTPUT_FILE = path.join(__dirname, '../src/data/diseases.json');

try {
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet);

  const cleanData = rawData.map(row => {
    // Standardize column names (remove extra spaces)
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      const cleanKey = key.trim();
      normalizedRow[cleanKey] = row[key];
    });

    // Normalize symptoms into an array
    const gejalaRaw = normalizedRow['Gejala'] || '';
    const gejalaArray = gejalaRaw.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);

    return {
      name: normalizedRow['Nama Penyakit'],
      cause: normalizedRow['Penyebab'],
      symptoms: gejalaArray,
      prevention: normalizedRow['Pencegahan'],
      treatment: normalizedRow['Penanganan'] || normalizedRow['Penanganan '] // Handle the trailing space
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanData, null, 2));
  console.log(`Successfully converted ${cleanData.length} diseases to JSON.`);
} catch (error) {
  console.error('Error converting excel:', error);
  process.exit(1);
}
