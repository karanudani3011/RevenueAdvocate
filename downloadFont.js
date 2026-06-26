import fs from 'fs';
import https from 'https';

const url = 'https://fonts.gstatic.com/s/notosansgujarati/v27/wlpWgx_HC1ti5ViekvcxnhMlCVo3f5pv17ivlzsUB14gg1TMR2Gw4VceEl7MA_ypFwPM.ttf';

https.get(url, (res) => {
    if (res.statusCode !== 200) {
        console.error('Failed to download, status:', res.statusCode);
        return;
    }
    let data = [];
    res.on('data', chunk => data.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(data);
        const base64 = buffer.toString('base64');
        const fileContent = `export const NotoSansGujaratiBase64 = "${base64}";\n`;
        fs.mkdirSync('./src/utils', { recursive: true });
        fs.writeFileSync('./src/utils/gujaratiFont.js', fileContent);
        console.log('Font created successfully.');
    });
}).on('error', console.error);
