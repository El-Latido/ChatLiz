const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('import ytSearch')) {
    content = content.replace("import dotenv from \"dotenv\";", "import dotenv from \"dotenv\";\nimport ytSearch from 'yt-search';");
}

fs.writeFileSync('server.ts', content);
