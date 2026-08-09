const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('yt-search')) {
    content = content.replace("import * as googleTTS", "import * as googleTTS from 'google-tts-api';\nimport ytSearch from 'yt-search';\n//");
}

const replacement = `
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

              const prompt = \\\`Como Elizabeth, una DJ de radio tierna y amigable, analiza esta solicitud de canción.
Canción: \\\${data.title}
Dedicatoria del usuario (\\\${currentUsername}): \\\${data.dedication || 'Ninguna'}
Url encontrada: \\\${song.url || 'Ninguna'}

1. ¿Es una canción apta o es ofensiva? (acepta casi todo a menos que sea muy explícito).
2. Genera un breve anuncio de locución de máximo 2 oraciones (ej. "¡Siguiente tema pedido por Juan! Una hermosa canción. ¡Escuchemos!"). Si hay dedicatoria, menciónala tiernamente.

Responde en JSON con { "accepted": true/false, "announcement": "tu anuncio aquí" }\\\`;
`;

content = content.replace(/if \(currentLiveDJ === "Elizabeth"\) \{\n\s*\/\/ Elizabeth Auto-DJ Logic\n\s*socket\.emit\("dj_request_status", \{ id: song\.id, status: 'pending', title: song\.title \}\);\n\s*try \{\n\s*const prompt = `Como Elizabeth, una DJ de radio tierna y amigable, analiza esta solicitud de canción.\nCanción: \$\{data\.title\}\nDedicatoria del usuario \(\$\{currentUsername\}\): \$\{data\.dedication \|\| 'Ninguna'\}\n\n1\. ¿Es una canción apta o es ofensiva\? \(acepta casi todo a menos que sea muy explícito\)\.\n2\. Genera un breve anuncio de locución de máximo 2 oraciones \(ej\. "¡Siguiente tema pedido por Juan! Una hermosa canción\. ¡Escuchemos!"\)\. Si hay dedicatoria, menciónala tiernamente\.\n\nResponde en JSON con \{ "accepted": true\/false, "announcement": "tu anuncio aquí" \}`;/, replacement.trim());

fs.writeFileSync('server.ts', content);
