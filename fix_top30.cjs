const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /(const top30Songs = \[\s+[\s\S]*?\];)/m;
const match = code.match(regex);
if (match) {
    const arrStr = match[1];
    code = code.replace(arrStr, ''); // remove it from current position
    
    // Now insert it right above `const initHistory`
    const target = 'const initHistory = () => {';
    code = code.replace(target, arrStr + '\n  ' + target);
    fs.writeFileSync('server.ts', code);
    console.log("Patched top30Songs");
} else {
    console.log("Could not find top30Songs");
}
