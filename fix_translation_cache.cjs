const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('const translationCache = new Map<string, string>();', '');
code = code.replace('const eliTranslationCache = new Map<string, string>();', '');

code = code.replace('let aiUserTempCache: any = { username: "Elizabeth", profilePic: "", statusMessage: "Administradora", role: "admin" };', 
'const translationCache = new Map<string, string>();\nconst eliTranslationCache = new Map<string, string>();\nlet aiUserTempCache: any = { username: "Elizabeth", profilePic: "", statusMessage: "Administradora", role: "admin" };');

fs.writeFileSync('server.ts', code);
