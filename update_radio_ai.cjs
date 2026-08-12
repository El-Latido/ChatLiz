const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

// Update Music list
file = file.replace(
/const top30Songs = \[[\s\S]*?\];/m,
`const top30Songs = [
  // Pop & Hits
  { title: "Blinding Lights - The Weeknd", url: "https://www.youtube.com/watch?v=4NRXx6U8ABQ" },
  { title: "Shape of You - Ed Sheeran", url: "https://www.youtube.com/watch?v=JGwWNGJdvx8" },
  { title: "As It Was - Harry Styles", url: "https://www.youtube.com/watch?v=H5v3kku4y6Q" },
  { title: "Stay - The Kid LAROI, Justin Bieber", url: "https://www.youtube.com/watch?v=kTJczUoc26U" },
  // 80s
  { title: "Take On Me - a-ha", url: "https://www.youtube.com/watch?v=djV11Xbc914" },
  { title: "Billie Jean - Michael Jackson", url: "https://www.youtube.com/watch?v=Zi_XLOBDo_Y" },
  { title: "Sweet Child O' Mine - Guns N' Roses", url: "https://www.youtube.com/watch?v=1w7OgIMMRc4" },
  // Rock
  { title: "Bohemian Rhapsody - Queen", url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ" },
  { title: "Smells Like Teen Spirit - Nirvana", url: "https://www.youtube.com/watch?v=hTWKbfoikeg" },
  { title: "Hotel California - Eagles", url: "https://www.youtube.com/watch?v=EqPtz5qN7HM" }
];`
);

// Add songHistory array
if (!file.includes('let songHistory: any[] = [];')) {
    file = file.replace(
        'let currentRequestedSong: any = null;',
        'let currentRequestedSong: any = null;\n  let songHistory: any[] = [];'
    );
}

// Update song_ended
file = file.replace(
`    socket.on("song_ended", (data) => {
      if (!currentUsername || !currentRequestedSong) return;
      if (currentRequestedSong.id === data.id) {`,
`    socket.on("song_ended", (data) => {
      if (!currentUsername || !currentRequestedSong) return;
      if (currentRequestedSong.id === data.id) {
         songHistory.unshift(currentRequestedSong.title);
         if (songHistory.length > 30) songHistory.pop();
         io.emit("radio_history_update", songHistory);`
);

// We should also emit history when user connects (or maybe in queue_update)
file = file.replace(
`io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });`,
`io.emit("queue_update", { queue: songQueue, current: currentRequestedSong, history: songHistory });`
);

// Remove "Otaku" from AI instructions
file = file.replace(/Radio Otakus Dream/g, 'Radio General');
file = file.replace(/Funciones Especiales \(Otaku & DJ\)/g, 'Funciones Especiales (DJ)');
file = file.replace(/Trivialidades Otaku/g, 'Trivialidades');
file = file.replace(/anime, manga o cultura japonesa/g, 'cultura pop, ciencia o tecnología');

// Add console log to AI trigger
file = file.replace(
`      if (triggerElizabeth) {
        try {`,
`      if (triggerElizabeth) {
        console.log("Detectado mensaje para IA:", msg);
        try {`
);

fs.writeFileSync('server.ts', file);
