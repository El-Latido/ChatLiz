const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// We need to replace the song_request listener.
const oldSongRequest = `        socket.on("song_request", async (data) => {
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
              if (!song.url) {
                  try {
                      const r = await ytSearch(song.title);
                      const videos = r.videos;
                      if (videos.length > 0) {
                          song.url = videos[0].url;
                      }
                  } catch (e) {
                      console.error("ytSearch error:", e);
                  }
              }
              const prompt = \`Como Elizabeth, una DJ de radio tierna y amigable, analiza esta solicitud de canción.
Canción: \${data.title}
Dedicatoria del usuario (\${currentUsername}): \${data.dedication || 'Ninguna'}
Url encontrada: \${song.url || 'Ninguna'}
1. ¿Es una canción apta o es ofensiva? (acepta casi todo a menos que sea muy explícito).
2. Genera un breve anuncio de locución de máximo 2 oraciones (ej. "¡Siguiente tema pedido por Juan! Una hermosa canción. ¡Escuchemos!"). Si hay dedicatoria, menciónala tiernamente.
Responde en JSON con { "accepted": true/false, "announcement": "tu anuncio aquí" }\`;
              
              const resp = await safeGenerateContent(ai, {
                  model: "gemini-2.5-flash",
                  contents: prompt,
                  config: { responseMimeType: "application/json", temperature: 0.7 }
              });
              
              const resJson = JSON.parse(resp.text?.trim() || "{}");
              if (resJson.accepted) {
                  song.status = 'accepted';
                  song.announcementUrl = googleTTS.getAudioUrl((resJson.announcement || '').substring(0, 199) || \`Siguiente tema pedido por \${currentUsername}\`, { lang: 'es-US', slow: false, host: 'https://translate.google.com' });
                  
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

// Because the exact string might be hard to match due to spacing/indent, let's use a smarter replacement.
// But we can just use regex.

content = content.replace(/socket\.on\("song_request"[\s\S]*?(?=socket\.on\("dj_go_live")/m, 
\`
    socket.on("song_request", async (data) => {
      if (!currentUsername) return;
      const song: any = {
          id: Date.now().toString(),
          title: data.title,
          url: data.url,
          requester: currentUsername,
          dedication: data.dedication,
          status: 'pending'
      };
      
      // Step 1: Send private message for confirmation
      const msg = {
          id: Date.now().toString(),
          text: \`He recibido tu solicitud para la canción "\${data.title}". ¿Es esta la canción que deseas enviar?\`,
          sender: "Elizabeth",
          isAi: true,
          type: "song_confirmation",
          songData: song
      };
      
      try {
          const docRef = doc(collection(fdb, 'private_messages', \`Elizabeth_\${currentUsername}\`, 'messages'));
          await addDoc(collection(fdb, 'private_messages', \`Elizabeth_\${currentUsername}\`, 'messages'), {
             ...msg,
             createdAt: serverTimestamp()
          });
          const docRef2 = doc(collection(fdb, 'private_messages', \`\${currentUsername}_Elizabeth\`, 'messages'));
          await addDoc(collection(fdb, 'private_messages', \`\${currentUsername}_Elizabeth\`, 'messages'), {
             ...msg,
             createdAt: serverTimestamp()
          });
      } catch(e) {
          console.error(e);
      }
      
      socket.emit("receive_private", { ...msg, chat: "Elizabeth" });
    });

    socket.on("confirm_song_request", async (song) => {
        if (!currentUsername) return;
        
        // Notify user we are processing
        const msg = {
            id: Date.now().toString(),
            text: \`¡Excelente! Estoy procesando tu solicitud para "\${song.title}". Te avisaré en cuanto esté lista.\`,
            sender: "Elizabeth",
            isAi: true
        };
        socket.emit("receive_private", { ...msg, chat: "Elizabeth" });
        
        if (currentLiveDJ === "Elizabeth") {
          socket.emit("dj_request_status", { id: song.id, status: 'pending', title: song.title });
          
          try {
              if (!song.url) {
                  try {
                      const r = await ytSearch(song.title);
                      const videos = r.videos;
                      if (videos.length > 0) {
                          song.url = videos[0].url;
                      }
                  } catch (e) {
                      console.error("ytSearch error:", e);
                  }
              }
              const prompt = \\\`Como Elizabeth, una DJ de radio tierna y amigable, analiza esta solicitud de canción.
Canción: \${song.title}
Dedicatoria del usuario (\${currentUsername}): \${song.dedication || 'Ninguna'}
Url encontrada: \${song.url || 'Ninguna'}
1. ¿Es una canción apta o es ofensiva? (acepta casi todo a menos que sea muy explícito).
2. Genera un breve anuncio de locución de máximo 2 oraciones (ej. "¡Siguiente tema pedido por Juan! Una hermosa canción. ¡Escuchemos!"). Si hay dedicatoria, menciónala tiernamente.
Responde en JSON con { "accepted": true/false, "announcement": "tu anuncio aquí" }\\\`;
              
              const resp = await safeGenerateContent(ai, {
                  model: "gemini-2.5-flash",
                  contents: prompt,
                  config: { responseMimeType: "application/json", temperature: 0.7 }
              });
              
              const resJson = JSON.parse(resp.text?.trim() || "{}");
              
              // NEW: Trigger a server-side download/stream URL for Axiss? For now we just use the youtube URL or yt-core later
              
              if (resJson.accepted) {
                  song.status = 'accepted';
                  song.announcementUrl = googleTTS.getAudioUrl((resJson.announcement || '').substring(0, 199) || \\\`Siguiente tema pedido por \${currentUsername}\\\`, { lang: 'es-US', slow: false, host: 'https://translate.google.com' });
                  
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
          socket.emit("dj_request_status", { id: song.id, status: 'accepted', title: song.title });
      }
    });
    
\`);

fs.writeFileSync('server.ts', content);
