const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace global triggerElizabeth
const regex1 = /const timeoutPromise = new Promise\(\(_, reject\) =>[\s\S]*?setTimeout\(\(\) => reject\(new Error\("Timeout de 30 segundos alcanzado"\)\), 30000\)[\s\S]*?\);[\s\S]*?const fetchPromise = ai\.models\.generateContent\(\{[\s\S]*?model: "gemini-2.5-flash",[\s\S]*?contents: parts,[\s\S]*?config: \{[\s\S]*?systemInstruction: sysInstruction,[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?response = await Promise\.race\(\[fetchPromise, timeoutPromise\]\);/gm;

const replace1 = `response = await safeGenerateContent(ai, {
               model: "gemini-2.5-flash",
               contents: parts,
               config: {
                 systemInstruction: sysInstruction,
               }
             }, 30000);`;
             
content = content.replace(regex1, replace1);

// Replace private triggerElizabeth
const regex2 = /const timeoutPromise = new Promise\(\(_, reject\) =>[\s\S]*?setTimeout\(\(\) => reject\(new Error\("Timeout de 30 segundos alcanzado"\)\), 30000\)[\s\S]*?\);[\s\S]*?const fetchPromise = ai\.models\.generateContent\(\{[\s\S]*?model: "gemini-2.5-flash",[\s\S]*?contents: parts,[\s\S]*?config: \{ systemInstruction: sysInstruction \}[\s\S]*?\}\);[\s\S]*?response = await Promise\.race\(\[fetchPromise, timeoutPromise\]\);/gm;

const replace2 = `response = await safeGenerateContent(ai, {
               model: "gemini-2.5-flash",
               contents: parts,
               config: { systemInstruction: sysInstruction }
             }, 30000);`;
             
content = content.replace(regex2, replace2);

fs.writeFileSync('server.ts', content);
