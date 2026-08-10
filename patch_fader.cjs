const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('dj_fader_update')) {
    content = content.replace(/socket\.on\("dj_stop_live", \(\) => \{/, 
    "socket.on('dj_fader_update', (data) => { io.emit('dj_fader_update', data); });\n    socket.on(\"dj_stop_live\", () => {");
    fs.writeFileSync('server.ts', content);
}

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('dj_fader_update')) {
    appContent = appContent.replace(/socket\.on\('radio_state_update', handleRadioState\);/, 
    "socket.on('radio_state_update', handleRadioState);\n    socket.on('dj_fader_update', (data: { micActive: boolean }) => {\n       if (audioRef.current) {\n           audioRef.current.volume = data.micActive ? 0.2 : 0.8;\n       }\n    });");
    fs.writeFileSync('src/App.tsx', appContent);
}
