const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const autoRadioList = `
const top30Songs = [
  { title: "Blinding Lights - The Weeknd", url: "https://www.youtube.com/watch?v=4NRXx6U8ABQ" },
  { title: "Dance Monkey - Tones and I", url: "https://www.youtube.com/watch?v=q0hyYWKXF0Q" },
  { title: "Shape of You - Ed Sheeran", url: "https://www.youtube.com/watch?v=JGwWNGJdvx8" },
  { title: "Someone You Loved - Lewis Capaldi", url: "https://www.youtube.com/watch?v=zABLecsR5UE" },
  { title: "Sunflower - Post Malone, Swae Lee", url: "https://www.youtube.com/watch?v=ApXoWvfEYVU" },
  { title: "As It Was - Harry Styles", url: "https://www.youtube.com/watch?v=H5v3kku4y6Q" },
  { title: "Starboy - The Weeknd", url: "https://www.youtube.com/watch?v=34Na4j8HLjc" },
  { title: "Stay - The Kid LAROI, Justin Bieber", url: "https://www.youtube.com/watch?v=kTJczUoc26U" },
  { title: "Heat Waves - Glass Animals", url: "https://www.youtube.com/watch?v=mRD0-GxqHVo" },
  { title: "Believer - Imagine Dragons", url: "https://www.youtube.com/watch?v=7wtfhZwyrcc" }
];

function generateAutoSong() {
  const song = top30Songs[Math.floor(Math.random() * top30Songs.length)];
  return {
    id: Date.now().toString() + Math.random().toString(),
    title: song.title,
    url: song.url,
    requester: "Auto DJ"
  };
}

function ensureAutoRadio() {
  if (!currentLiveDJ && !currentRequestedSong && songQueue.length === 0) {
    for (let i = 0; i < 5; i++) {
        songQueue.push(generateAutoSong());
    }
    currentRequestedSong = songQueue.shift();
    io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
  }
}
`;

const globalStateRegex = /let songQueue: any\[\] = \[\];\n  let currentRequestedSong: any = null;/;
code = code.replace(globalStateRegex, `let songQueue: any[] = [];\n  let currentRequestedSong: any = null;\n${autoRadioList}`);

const serverListenRegex = /server\.listen\(PORT/;
code = code.replace(serverListenRegex, `ensureAutoRadio();\n  server.listen(PORT`);

const stopLiveRegex = /socket\.on\("dj_stop_live", \(\) => \{\n        if \(!currentUsername \|\| currentUsername !== currentLiveDJ\) return;\n        currentLiveDJ = null;\n        djStreamUrl = null;\n        io\.emit\("radio_state_update", \{ currentLiveDJ: null, streamUrl: "https:\/\/listen\.moe\/stream" \}\);\n    \}\);/;

code = code.replace(stopLiveRegex, `socket.on("dj_stop_live", () => {
        if (!currentUsername || currentUsername !== currentLiveDJ) return;
        currentLiveDJ = null;
        djStreamUrl = null;
        io.emit("radio_state_update", { currentLiveDJ: null, streamUrl: "https://listen.moe/stream" });
        ensureAutoRadio();
    });

    socket.on("admin_cut_transmission", () => {
        if (!currentUsername || activeUsers[currentUsername]?.role !== 'admin') return;
        currentLiveDJ = null;
        djStreamUrl = null;
        io.emit("radio_state_update", { currentLiveDJ: null, streamUrl: "https://listen.moe/stream" });
        ensureAutoRadio();
    });`);

const songEndedRegex = /currentRequestedSong = songQueue\.shift\(\);\n         \} else \{\n             currentRequestedSong = null;\n         \}/;
code = code.replace(songEndedRegex, `currentRequestedSong = songQueue.shift();
         } else {
             if (!currentLiveDJ) {
                 songQueue.push(generateAutoSong());
                 currentRequestedSong = songQueue.shift();
             } else {
                 currentRequestedSong = null;
             }
         }`);

fs.writeFileSync('server.ts', code);
