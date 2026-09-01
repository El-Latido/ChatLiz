const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { AiSelectorModal }')) {
    code = code.replace("import { SocialFeed }", "import { AiSelectorModal } from './components/AiSelectorModal';\nimport { SocialFeed }");
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched import");
} else {
    console.log("Already imported");
}
