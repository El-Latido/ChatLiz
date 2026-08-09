const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('googleTTS')) {
   // Already imported? Wait, it's used but not imported?
}
if (!content.includes('google-tts-api')) {
    content = content.replace("import dotenv from \"dotenv\";", "import dotenv from \"dotenv\";\nimport * as googleTTS from 'google-tts-api';");
}
fs.writeFileSync('server.ts', content);
