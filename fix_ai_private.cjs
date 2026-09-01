const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetBlockStart = 'if (triggerPrivateAi) {';
const targetBlockEnd = 'socket.on("read_messages", (data) => {';

const startIndex = code.indexOf(targetBlockStart);
const endIndex = code.indexOf(targetBlockEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    let block = code.substring(startIndex, endIndex);

    block = block.replace(/sender: "Elizabeth",/g, 'sender: aiCharacter.id,\n            isAi: true,');
    block = block.replace(/\[currentUsername, "Elizabeth"\]/g, '[currentUsername, aiCharacter.id]');
    block = block.replace(/socket\.emit\("receive_private", eliMsg, "Elizabeth"\);/g, 'socket.emit("receive_private", eliMsg, aiCharacter.id);');
    block = block.replace(/io\.emit\("typing", \{ username: "Elizabeth"/g, 'io.emit("typing", { username: aiCharacter.id');
    // Also change the earlier fallback text 
    block = block.replace(/let cleanText = rawText.replace\(\/\^Elizabeth:\\s\*\//ig, "let cleanText = rawText.replace(new RegExp('^' + aiCharacter.name + ':\\\\s*', 'i')");
    
    code = code.substring(0, startIndex) + block + code.substring(endIndex);
    fs.writeFileSync('server.ts', code);
    console.log("Patched AI logic inside private chat block");
} else {
    console.log("Could not find block indices");
}

