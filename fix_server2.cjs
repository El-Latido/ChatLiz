const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t2 = `      if (msg.audio && msg.audio.startsWith('data:audio') && fStorage) {
         try {
             const audioRef = ref(fStorage, \`audios/\${Date.now()}_\${currentUsername}.wav\`);
             await uploadString(audioRef, msg.audio, 'data_url');
             const downloadUrl = await getDownloadURL(audioRef);
             msg.audio = downloadUrl;
             msg.type = 'audio';
         } catch (e) {
             console.error("Audio upload error", e);
         }
      } else if (msg.audio) {
         msg.type = 'audio';
      }`;

const r2 = `      if (msg.audio && msg.audio.startsWith('data:audio')) {
         if (fStorage) {
             try {
                 const audioRef = ref(fStorage, \`audios/\${Date.now()}_\${currentUsername}.wav\`);
                 await uploadString(audioRef, msg.audio, 'data_url');
                 const downloadUrl = await getDownloadURL(audioRef);
                 msg.audio = downloadUrl;
                 msg.type = 'audio';
             } catch (e) {
                 console.error("Private Audio upload error (Firebase Storage):", e);
                 delete msg.audio;
                 if (!msg.text) msg.text = "🎤 (Audio no pudo ser enviado)";
             }
         } else {
             msg.type = 'audio';
         }
      } else if (msg.audio) {
         msg.type = 'audio';
      }`;

if(code.includes(t2)) {
    code = code.replace(t2, r2);
    console.log("Replaced private upload block");
}

fs.writeFileSync('server.ts', code);
