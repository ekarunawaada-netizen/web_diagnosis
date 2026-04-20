const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

// To act as a dummy database for diseases
const diseasesPath = path.join(__dirname, '../src/data/diseases.json');

const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
};

const server = http.createServer((req, res) => {
  setCORSHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse Body Utility
  const getBody = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => resolve(body ? JSON.parse(body) : {}));
    req.on('error', reject);
  });

  // ========== API ROUTES ==========

  // 1. Diagnosis Results API
  if (req.url === '/api/diagnosis' && req.method === 'POST') {
    getBody().then(data => {
      const { symptoms } = data; // Expected: array of user symptom objects

      fs.readFile(diseasesPath, 'utf8', (err, fileData) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to read disease database' }));
          return;
        }

        const diseasesData = JSON.parse(fileData);
        const userSymptomNames = symptoms.map(s => s.name.toLowerCase());

        const matches = diseasesData.map(disease => {
          let score = 0;
          let matchedCount = 0;
          disease.symptoms.forEach(s => {
            if (userSymptomNames.includes(s.toLowerCase())) {
              score += 1;
              matchedCount += 1;
            }
          });
          const probability = disease.symptoms.length > 0 ? Math.round((matchedCount / symptoms.length) * 100) : 0;
          return {
            ...disease,
            probability: Math.min(probability, 99),
            matchedCount
          };
        });

        const results = matches
          .filter(m => m.matchedCount > 0)
          .sort((a, b) => b.probability - a.probability || b.matchedCount - a.matchedCount)
          .slice(0, 3);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ results }));
      });
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid Request Data' }));
    });
    return;
  }

  // 2. Clinics Generation API (Replacing the frontend dummy generation)
  if (req.url.startsWith('/api/clinics') && req.method === 'GET') {
    // Parse query params manually since we don't have Express
    const urlParts = req.url.split('?');
    let lat = -6.2088;
    let lng = 106.8456;

    if (urlParts.length > 1) {
      const queryParams = new URLSearchParams(urlParts[1]);
      lat = parseFloat(queryParams.get('lat')) || lat;
      lng = parseFloat(queryParams.get('lng')) || lng;
    }

    // Dummy clinic names from backend
    const names = ['Klinik Sehat Utama', 'Klinik Medika Plus', 'Puskesmas Kasih', 'RS Bersalin Harapan', 'Klinik Cepat Tanggap'];

    const clinics = names.map((name, i) => {
      // Create slight variations based on user's coordinate
      const offsetLat = (Math.random() - 0.5) * 0.05;
      const offsetLng = (Math.random() - 0.5) * 0.05;
      const distance = (Math.random() * 5).toFixed(1);

      return {
        id: `API-CLINIC-${i + 1}`,
        name,
        type: 'clinics',
        location: [lat + offsetLat, lng + offsetLng],
        address: `Jl. Kesehatan API No. ${i + 1}`,
        distance: distance,
        phone: `089-523-888-644${i}`
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data: clinics }));
    return;
  }

  // 3. Simple Login API
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    getBody().then(data => {
      const { emailOrUsername, password } = data;

      // Basic mock authentication check
      if (emailOrUsername === 'user' && password === 'user123') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token.sig",
          user: { name: 'Pasien Test', email: 'test@example.com' }
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Username atau password salah dari Backend Native' }));
      }
    });
    return;
  }

  // Not Found Route
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Native Node.js Backend is running on http://localhost:${PORT}`);
});
