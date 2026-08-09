const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const toReplace = "if (safeProfilePic.startsWith('data:image')) {";
const startIdx = serverCode.indexOf(toReplace);
if (startIdx !== -1) {
    const endIdx = serverCode.indexOf("      }", startIdx) + 7;
    serverCode = serverCode.substring(0, startIdx) + serverCode.substring(endIdx);
    fs.writeFileSync('server.ts', serverCode);
    console.log("Patched successfully");
} else {
    console.log("Not found");
}
