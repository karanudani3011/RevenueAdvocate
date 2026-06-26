import fs from 'fs';
import https from 'https';

const url = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansGujarati/NotoSansGujarati-Regular.ttf';

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
