const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Ensure google-tts-api is imported
if (!content.includes("import * as googleTTS")) {
    content = content.replace("import { GoogleGenAI } from '@google/genai';", "import { GoogleGenAI } from '@google/genai';\nimport * as googleTTS from 'google-tts-api';");
}

// Add the DJ Schedule checker
const djCheckCode = `
setInterval(() => {
    if (aiUserTempCache && aiUserTempCache.djSchedule) {
        const { start, end } = aiUserTempCache.djSchedule;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        const parseTime = (t) => {
            if (!t) return 0;
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        
        if (start && end) {
            const startM = parseTime(start);
            const endM = parseTime(end);
            
            let isActive = false;
            if (startM < endM) {
                isActive = currentMinutes >= startM && currentMinutes < endM;
            } else {
                isActive = currentMinutes >= startM || currentMinutes < endM;
            }
            
            if (isActive && currentLiveDJ !== "Elizabeth") {
                currentLiveDJ = "Elizabeth";
                io.emit("radio_state_update", { currentLiveDJ: "Elizabeth", streamUrl: "elizabeth_auto" });
                io.emit("new_global_message", { 
                    id: Date.now().toString(), 
                    text: "¡Hola a todos! Ya estoy en vivo en la radio. ¡Envíenme sus pedidos musicales!", 
                    sender: "Elizabeth", 
                    profilePic: aiUserTempCache.profilePic,
                    timestamp: new Date().toISOString()
                });
            } else if (!isActive && currentLiveDJ === "Elizabeth") {
                currentLiveDJ = null;
                io.emit("radio_state_update", { currentLiveDJ: null, streamUrl: "https://listen.moe/stream" });
                ensureAutoRadio();
            }
        }
    }
}, 30000);
`;
if (!content.includes("setInterval(() => {")) {
    content = content.replace("const bannedUsers: Record<string, number> = {};", "const bannedUsers: Record<string, number> = {};\n" + djCheckCode);
}

// Update song_request
const songReqReplacement = `    socket.on("song_request", async (data) => {
      if (!currentUsername) return;
      const song: any = {
          id: Date.now().toString(),
          title: data.title,
          url: data.url,
          requester: currentUsername,
          dedication: data.dedication,
          status: 'pending'
      };
      
      if (currentLiveDJ === "Elizabeth") {
          // Elizabeth Auto-DJ Logic
          socket.emit("dj_request_status", { id: song.id, status: 'pending', title: song.title });
          
          try {
              const prompt = \`Como Elizabeth, una DJ de radio tierna y amigable, analiza esta solicitud de canción.
Canción: \${data.title}
Dedicatoria del usuario (\${currentUsername}): \${data.dedication || 'Ninguna'}

1. ¿Es una canción apta o es ofensiva? (acepta casi todo a menos que sea muy explícito).
2. Genera un breve anuncio de locución de máximo 2 oraciones (ej. "¡Siguiente tema pedido por Juan! Una hermosa canción. ¡Escuchemos!"). Si hay dedicatoria, menciónala tiernamente.

Responde en JSON con { "accepted": true/false, "announcement": "tu anuncio aquí" }\`;
              
              const resp = await aiClient.models.generateContent({
                  model: "gemini-2.5-flash",
                  contents: prompt,
                  config: { responseMimeType: "application/json", temperature: 0.7 }
              });
              
              const resJson = JSON.parse(resp.text?.trim() || "{}");
              if (resJson.accepted) {
                  song.status = 'accepted';
                  song.announcementUrl = googleTTS.getAudioUrl(resJson.announcement || \`Siguiente tema pedido por \${currentUsername}\`, { lang: 'es-US', slow: false, host: 'https://translate.google.com' });
                  
                  if (!currentRequestedSong) {
                      currentRequestedSong = song;
                      io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
                  } else {
                      songQueue.push(song);
                      io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
                  }
                  
                  if (activeUsers[currentUsername]) {
                      io.to(activeUsers[currentUsername].socketId).emit("dj_request_status", { id: song.id, status: 'accepted', title: song.title });
                  }
              } else {
                  if (activeUsers[currentUsername]) {
                      io.to(activeUsers[currentUsername].socketId).emit("dj_request_status", { id: song.id, status: 'rejected', title: song.title });
                  }
              }
          } catch (e) {
              console.error("Elizabeth DJ Error:", e);
          }
      } else if (currentLiveDJ) {
          djQueue.push(song);
          if (activeUsers[currentLiveDJ]) {
              io.to(activeUsers[currentLiveDJ].socketId).emit("dj_queue_update", djQueue);
          }
          socket.emit("dj_request_status", { id: song.id, status: 'pending', title: song.title });
      } else {
          if (!currentRequestedSong) {
              currentRequestedSong = song;
              io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
          } else {
              songQueue.push(song);
              io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
          }
      }
    });`;

content = content.replace(/socket\.on\("song_request",\s*\(\w+\)\s*=>\s*\{[\s\S]*?\}\);\n*\s*socket\.on\("dj_go_live"/, songReqReplacement + '\n\n    socket.on("dj_go_live"');

fs.writeFileSync('server.ts', content);
