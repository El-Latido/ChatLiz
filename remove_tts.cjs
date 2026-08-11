const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(`         if (msg.text) hablarElizabeth(msg.text);`, `         // Hablar eliminado`);
app = app.replace(`          hablarElizabeth(msg.text);`, `          // Hablar eliminado`);

const funcRegex = /function hablarElizabeth\([^)]*\)\s*{[^}]*}/;
app = app.replace(funcRegex, '');

fs.writeFileSync('src/App.tsx', app);

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(`import * as googleTTS from 'google-tts-api';\n`, '');
server = server.replace(`song.announcementUrl = googleTTS.getAudioUrl((resJson.announcement || '').substring(0, 199) || "Tema pedido por " + currentUsername, { lang: 'es-US', slow: false, host: 'https://translate.google.com' });`, `song.announcementUrl = "";`);

fs.writeFileSync('server.ts', server);

let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace(/"google-tts-api":\s*"[^"]+",?\n/g, '');
fs.writeFileSync('package.json', pkg);

