const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const startIdx = code.indexOf('if (triggerPrivateAi) {');
const endIdx = code.indexOf('socket.on("read_messages"', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    let block = code.substring(startIdx, endIdx);
    
    // Replace typing username
    block = block.replace(/io\.emit\("typing", \{ username: "Elizabeth"/, 'io.emit("typing", { username: aiCharacter.id');
    
    // Replace prompt
    const oldPromptStart = 'const baseSysInstruction = `Eres Elizabeth.';
    const oldPromptEnd = "Regla final: NO incluyas prefijos como 'Elizabeth:' al inicio de tu mensaje.`;";
    
    const promptStartIdx = block.indexOf(oldPromptStart);
    const promptEndIdx = block.indexOf(oldPromptEnd, promptStartIdx);
    if(promptStartIdx !== -1 && promptEndIdx !== -1) {
        const oldPromptFull = block.substring(promptStartIdx, promptEndIdx + oldPromptEnd.length);
        block = block.replace(oldPromptFull, 'const baseSysInstruction = `${aiCharacter.prompt}\\nContexto temporal: Hablas en privado con ${currentUsername}. En su zona horaria local son las ${userTimeStr}. Usa este dato de forma transparente si el contexto lo requiere.`;');
    }
    
    // Replace aiUserTempCache logic
    block = block.replace(/const sysInstruction = aiUserTempCache\?.systemInstruction\s*\?\s*`\$\{baseSysInstruction\}Instrucciones adicionales del Administrador:\$\{aiUserTempCache\.systemInstruction\}`\s*:\s*baseSysInstruction;/, 
        'const sysInstruction = (aiCharacter.id === "Elizabeth" && aiUserTempCache?.systemInstruction) ? `${baseSysInstruction}\\nInstrucciones adicionales: ${aiUserTempCache.systemInstruction}` : baseSysInstruction;');
        
    // Replace participants array 1
    block = block.replace(/\[currentUsername, "Elizabeth"\]/g, '[currentUsername, aiCharacter.id]');
    
    // Replace history string
    block = block.replace(/Responde de forma privada como Elizabeth\./g, 'Responde de forma privada como ${aiCharacter.name}.');
    
    // Replace rawText.replace
    block = block.replace(/rawText\.replace\(\/\^Elizabeth:\\s\*\/\i, ""\)/g, "rawText.replace(new RegExp('^' + aiCharacter.name + ':\\\\s*', 'i'), '')");
    
    // Replace sender
    block = block.replace(/sender: "Elizabeth"/g, 'sender: aiCharacter.id,\n            isAi: true');
    
    // Replace receive_private emit
    block = block.replace(/socket\.emit\("receive_private", eliMsg, "Elizabeth"\);/, 'socket.emit("receive_private", eliMsg, aiCharacter.id);');
    
    code = code.substring(0, startIdx) + block + code.substring(endIdx);
    fs.writeFileSync('server.ts', code);
    console.log("Patched inside");
}
