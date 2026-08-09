const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const startIdx = code.indexOf("async function moderateMessage(msg: any, aiClient: any)");
if (startIdx !== -1) {
    const endIdx = code.indexOf("}", code.indexOf("return { banned: false, reason: \"\", mentionsElizabeth: false };", startIdx)) + 1;
    
    const newModeration = `async function moderateMessage(msg: any, aiClient: any): Promise<{banned: boolean, reason?: string, mentionsElizabeth?: boolean, transcription?: string}> {
    const txt = (msg.text || "").toLowerCase();
    const mentionsElizabeth = txt.includes('elizabeth') || txt.includes('liz');
    
    // Optimización: Solo usar IA para mensajes de audio o imágenes para evitar límites de cuota
    if (!msg.audio && !msg.image) {
        const badWords = ['violacion', 'pornografia', 'pedofilia'];
        for (const w of badWords) {
            if (txt.includes(w)) {
                return { banned: true, reason: "Contenido inapropiado detectado", mentionsElizabeth };
            }
        }
        return { banned: false, reason: "", mentionsElizabeth };
    }

    try {
        const parts = [];
        if (msg.image) {
             const base64Data = msg.image.split(',')[1];
             const mimeType = msg.image.match(/data:(.*?);/)?.[1] || 'image/jpeg';
             parts.push({ inlineData: { data: base64Data, mimeType } });
             parts.push({ text: "Analiza esta imagen y revisa si es inapropiada." });
        }
        if (msg.audio) {
            const matches = msg.audio.match(/^data:(audio\\/[^;]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                parts.push({
                    inlineData: {
                        mimeType: matches[1],
                        data: matches[2]
                    }
                });
                parts.push({ text: \`Transcribe el audio y aplica moderación.\` });
            }
        }

        parts.push({ text: \`IMPORTANTE: Responde ÚNICAMENTE con un JSON con esta estructura:
{
  "banned": boolean,
  "reason": string,
  "transcription": string,
  "mentionsElizabeth": boolean
}\` });

        const filterResp = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: parts },
            config: { 
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        const resultText = filterResp.text || "{}";
        const result = JSON.parse(resultText);
        return {
            banned: result.banned === true,
            reason: result.reason || "",
            mentionsElizabeth: result.mentionsElizabeth === true,
            transcription: result.transcription || ""
        };
    } catch (e) {
        console.error("Moderation Error:", e);
        return { banned: false, reason: "", mentionsElizabeth };
    }
}`;
    
    code = code.substring(0, startIdx) + newModeration + code.substring(endIdx);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully");
} else {
    console.log("Not found");
}
