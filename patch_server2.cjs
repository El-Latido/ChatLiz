const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `    socket.on("song_request", async (data) => {
      if (!currentUsername) return;
      const song = {
          id: Date.now().toString(),
          title: data.title,
          url: data.url,
          requester: currentUsername,
          dedication: data.dedication,
          status: 'pending'
      };
      
      const msg = {
          id: Date.now().toString(),
          text: "He recibido tu solicitud para la canción '" + data.title + "'. ¿Es esta la canción que deseas enviar?",
          sender: "Elizabeth",
          isAi: true,
          type: "song_confirmation",
          songData: song
      };
      
      try {
          const docRef = doc(collection(fdb, 'private_messages', "Elizabeth_" + currentUsername, 'messages'));
          await addDoc(collection(fdb, 'private_messages', "Elizabeth_" + currentUsername, 'messages'), {
             ...msg,
             createdAt: serverTimestamp()
          });
      } catch(e) {}
      
      socket.emit("receive_private", { ...msg, chat: "Elizabeth" });
    });

    socket.on("confirm_song_request", async (song) => {
        if (!currentUsername) return;
        const msg = {
            id: Date.now().toString(),
            text: "¡Excelente! Estoy procesando tu solicitud para '" + song.title + "'. Te avisaré en cuanto esté lista.",
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
                      if (r.videos.length > 0) song.url = r.videos[0].url;
                  } catch (e) {}
              }
              const prompt = \`Como Elizabeth, analiza esta solicitud de canción. Canción: \${song.title}. Genera un anuncio. Responde en JSON con { "accepted": true/false, "announcement": "..." }\`;
              const resp = await safeGenerateContent(ai, { model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", temperature: 0.7 } });
              const resJson = JSON.parse(resp.text?.trim() || "{}");
              if (resJson.accepted) {
                  song.status = 'accepted';
                  song.announcementUrl = googleTTS.getAudioUrl((resJson.announcement || '').substring(0, 199) || "Tema pedido por " + currentUsername, { lang: 'es-US', slow: false, host: 'https://translate.google.com' });
                  if (!currentRequestedSong) { currentRequestedSong = song; io.emit("queue_update", { queue: songQueue, current: currentRequestedSong }); }
                  else { songQueue.push(song); io.emit("queue_update", { queue: songQueue, current: currentRequestedSong }); }
                  if (activeUsers[currentUsername]) io.to(activeUsers[currentUsername].socketId).emit("dj_request_status", { id: song.id, status: 'accepted', title: song.title });
              } else {
                  if (activeUsers[currentUsername]) io.to(activeUsers[currentUsername].socketId).emit("dj_request_status", { id: song.id, status: 'rejected', title: song.title });
              }
          } catch (e) {}
      } else if (currentLiveDJ) {
          djQueue.push(song);
          if (activeUsers[currentLiveDJ]) io.to(activeUsers[currentLiveDJ].socketId).emit("dj_queue_update", djQueue);
          socket.emit("dj_request_status", { id: song.id, status: 'pending', title: song.title });
      } else {
          if (!currentRequestedSong) { currentRequestedSong = song; io.emit("queue_update", { queue: songQueue, current: currentRequestedSong }); }
          else { songQueue.push(song); io.emit("queue_update", { queue: songQueue, current: currentRequestedSong }); }
          socket.emit("dj_request_status", { id: song.id, status: 'accepted', title: song.title });
      }
    });
`;

content = content.replace(/socket\.on\("song_request"[\s\S]*?(?=socket\.on\("dj_go_live")/m, replacement);
fs.writeFileSync('server.ts', content);
