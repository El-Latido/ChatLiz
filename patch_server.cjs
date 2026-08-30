const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (code.includes('react_to_message_snippet')) {
    console.log("Found bad snippet, restoring from memory cache not possible. Need fresh file or manual fix.");
} else {
    console.log("File is likely fine or missing the snippet.");
}
