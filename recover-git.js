const { exec } = require('child_process');
const fs = require('fs');

exec('git log -p -1 -- src/app/diagnosis/result/page.tsx', (error, stdout, stderr) => {
    fs.writeFileSync('gitlog.txt', stdout || stderr || error.message);
});
