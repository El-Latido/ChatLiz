const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const safeGenFunc = `
async function safeGenerateContent(aiInstance: any, params: any, timeoutMs: number = 20000): Promise<any> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    });
    try {
        const fetchPromise = aiInstance.models.generateContent(params);
        return await Promise.race([fetchPromise, timeoutPromise]);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}
`;

if (!content.includes('safeGenerateContent')) {
    content = content.replace('async function moderateMessage', safeGenFunc + '\nasync function moderateMessage');
}

// Now replace all aiClient.models.generateContent and ai.models.generateContent
content = content.replace(/await aiClient\.models\.generateContent\(/g, 'await safeGenerateContent(aiClient, ');
content = content.replace(/await ai\.models\.generateContent\(/g, 'await safeGenerateContent(ai, ');

// Fix the promise races in triggerElizabeth and triggerPrivateElizabeth
// In triggerElizabeth:
//              const timeoutPromise = new Promise((_, reject) =>
//                 setTimeout(() => reject(new Error("Timeout de 30 segundos alcanzado")), 30000)
//              );
//              const fetchPromise = safeGenerateContent(ai, { ... });
//              response = await Promise.race([fetchPromise, timeoutPromise]);
content = content.replace(
/const timeoutPromise = new Promise[\s\S]*?const fetchPromise = (safeGenerateContent[^;]+;\n)\s*response = await Promise\.race\(\[fetchPromise, timeoutPromise\]\);/gm,
`response = await $1`
);

fs.writeFileSync('server.ts', content);
