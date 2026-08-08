const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const globalState = `  let songQueue: any[] = [];
  let currentRequestedSong: any = null;`;

const newGlobalState = `  let songQueue: any[] = [];
  let currentRequestedSong: any = null;
  
  // DJ State
  let currentLiveDJ: string | null = null;
  let djStreamUrl: string | null = null;
  let djQueue: any[] = [];`;

code = code.replace(globalState, newGlobalState);

const registerLoginRegex = /const userRole = userData\.role \|\| "user";/g;
const newRegisterLogin = `const userRole = userData.role || "user";
        const djSchedule = userData.djSchedule || null;`;

code = code.replace(registerLoginRegex, newRegisterLogin);

const activeUserRegex = /role: userRole,\n\s*pais_idioma:/g;
const newActiveUser = `role: userRole,
          djSchedule: djSchedule,
          pais_idioma:`;
code = code.replace(activeUserRegex, newActiveUser);

const oldSongRequest = `    socket.on("song_request", (data) => {
      if (!currentUsername) return;
      const song = {
          id: Date.now().toString(),
          title: data.title,
          url: data.url,
          requester: currentUsername
      };
      
      if (!currentRequestedSong) {
          currentRequestedSong = song;
          io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
      } else {
          songQueue.push(song);
          io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
      }
    });`;

const newSongRequest = `    socket.on("song_request", (data) => {
      if (!currentUsername) return;
      const song = {
          id: Date.now().toString(),
          title: data.title,
          url: data.url,
          requester: currentUsername,
          status: 'pending'
      };
      
      if (currentLiveDJ) {
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
    });

    socket.on("dj_go_live", (streamUrl) => {
        if (!currentUsername || activeUsers[currentUsername]?.role !== 'dj') return;
        currentLiveDJ = currentUsername;
        djStreamUrl = streamUrl || "https://listen.moe/stream";
        io.emit("radio_state_update", { currentLiveDJ, streamUrl: djStreamUrl });
        if (activeUsers[currentLiveDJ]) {
            io.to(activeUsers[currentLiveDJ].socketId).emit("dj_queue_update", djQueue);
        }
    });

    socket.on("dj_stop_live", () => {
        if (!currentUsername || currentUsername !== currentLiveDJ) return;
        currentLiveDJ = null;
        djStreamUrl = null;
        io.emit("radio_state_update", { currentLiveDJ: null, streamUrl: "https://listen.moe/stream" });
    });

    socket.on("dj_handle_request", (data: { id: string, action: 'accept' | 'reject' }) => {
        if (!currentUsername || currentUsername !== currentLiveDJ) return;
        const reqIndex = djQueue.findIndex(r => r.id === data.id);
        if (reqIndex !== -1) {
            djQueue[reqIndex].status = data.action === 'accept' ? 'accepted' : 'rejected';
            
            // Notify the requester
            const requester = djQueue[reqIndex].requester;
            if (activeUsers[requester]) {
                io.to(activeUsers[requester].socketId).emit("dj_request_status", { 
                    id: data.id, 
                    status: djQueue[reqIndex].status,
                    title: djQueue[reqIndex].title 
                });
            }
            
            // Send updated queue to DJ
            io.to(activeUsers[currentLiveDJ].socketId).emit("dj_queue_update", djQueue);
        }
    });
    
    // Admin sets DJ Schedule
    socket.on("admin_set_dj_schedule", async (data: { targetUser: string, schedule: { start: string, end: string } }) => {
        if (!currentUsername || activeUsers[currentUsername]?.role !== 'admin') return;
        const target = data.targetUser;
        if (fdb) {
            const { updateDoc, doc } = require("firebase/firestore");
            try {
                await updateDoc(doc(fdb, 'users', target), { role: 'dj', djSchedule: data.schedule });
            } catch(e) {
                console.error(e);
            }
        }
        if (activeUsers[target]) {
            activeUsers[target].role = 'dj';
            activeUsers[target].djSchedule = data.schedule;
            io.to(activeUsers[target].socketId).emit("profile_updated", activeUsers[target]);
        }
        emitActiveUsers();
    });
`;

code = code.replace(oldSongRequest, newSongRequest);

fs.writeFileSync('server.ts', code);
