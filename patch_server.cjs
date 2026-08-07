const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const declarations = `  let activeUsers: Record<string, any> = {};
  const chessGames: Record<string, any> = {};

  let songQueue: any[] = [];
  let currentRequestedSong: any = null;
`;

code = code.replace(`  let activeUsers: Record<string, any> = {};\n  const chessGames: Record<string, any> = {};\n`, declarations);

const queueEvents = `    socket.on("song_request", (data) => {
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
    });

    socket.on("song_ended", (data) => {
      if (!currentUsername || !currentRequestedSong) return;
      if (currentRequestedSong.id === data.id) {
         if (songQueue.length > 0) {
             currentRequestedSong = songQueue.shift();
         } else {
             currentRequestedSong = null;
         }
         io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
      }
    });

    socket.on("send_global",`;

code = code.replace(/    socket\.on\("send_global",/g, queueEvents);

fs.writeFileSync('server.ts', code);
