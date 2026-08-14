const fs = require('fs');
let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

file = file.replace(
  /\{currentSong\.artists\?\.map\(\(a:any\) => a\.name\)\.join\(\", \"\)\}/g,
  "{Array.isArray(currentSong?.artists) ? currentSong.artists.map((a:any) => a.name).join(', ') : ''}"
);

file = file.replace(
  /\{s\?\.artists \? s\?\.artists\.map\(\(a:any\) => a\.name\)\.join\(\", \"\) : \(s\?\.requester \? \`Añadida por: \$\{s\?\.requester\}\` : \'\'\)\}/g,
  "{Array.isArray(s?.artists) ? s.artists.map((a:any) => a.name).join(', ') : (s?.requester ? `Añadida por: ${s?.requester}` : '')}"
);

fs.writeFileSync('src/components/InlineRadio.tsx', file);
