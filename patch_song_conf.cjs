const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add song_confirmation type handling
const songConfirmationUI = `
                                         {m.type === 'song_confirmation' && m.songData && (
                                             <button onClick={() => {
                                                 socket.emit('confirm_song_request', m.songData);
                                                 // Hide the button locally or something, but let's just leave it for now or we could add a handled flag
                                             }} className="w-full mt-2 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-bold shadow-md hover:from-green-400 hover:to-emerald-500 transition-colors flex items-center justify-center gap-2">
                                                 <Music size={16} /> [Sí, enviar canción]
                                             </button>
                                         )}
`;

content = content.replace(/\{m\.image && <div/m, songConfirmationUI + "\n                                         {m.image && <div");

fs.writeFileSync('src/App.tsx', content);
