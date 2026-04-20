const https = require('https');

function testUrl(url) {
  https.get(url, (res) => {
    console.log(url, '->', res.statusCode);
  }).on('error', (e) => {
    console.error(url, '-> error:', e.message);
  });
}

testUrl('https://db.hztapp.com/spakar/ap/symptoms');
testUrl('https://db.hztapp.com/spakar/api/symptoms');
testUrl('https://db.hztapp.com/api/symptoms');
testUrl('https://db.hztapp.com/spakar/ap/api/symptoms');
testUrl('https://db.hztapp.com/spakar/symptoms');
testUrl('https://db.hztapp.com/spakar/ap');
