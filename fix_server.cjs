const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `    } catch(e) {
        console.error("Moderation error:", e);
    }
    return { banned: false };
}`;

const r1 = `    } catch(e: any) {
        if (e?.status === 429 || e?.status === 503 || e?.message?.includes('429') || e?.message?.includes('503')) {
            console.warn("Gemini API rate limit (429/503) during moderation. Allowing message to pass.");
        } else {
            console.error("Moderation error:", e);
        }
    }
    return { banned: false };
}`;

if(code.includes(t1)) {
    code = code.replace(t1, r1);
    console.log("Replaced moderation block");
}

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
                 console.error("Audio upload error (Firebase Storage):", e);
                 // No enviamos el audio base64 si falló para no exceder el límite de 1MB de Firestore
                 delete msg.audio;
                 if (!msg.text) msg.text = "🎤 (Audio no pudo ser enviado)";
             }
         } else {
             // Si no hay Storage, enviamos base64 bajo nuestro propio riesgo,
             // o lo limitamos.
             msg.type = 'audio';
             // Podría exceder 1MB, pero lo dejamos pasar
         }
      } else if (msg.audio) {
         msg.type = 'audio';
      }`;

if(code.includes(t2)) {
    code = code.replace(t2, r2);
    console.log("Replaced global upload block");
}

const t3 = `      if (fdb) {
        let dbMsg: any = { ...msg, createdAt: serverTimestamp() };
        await addDoc(collection(fdb, 'messages'), dbMsg);
        const countSnapshot = await getCountFromServer(collection(fdb, 'messages'));`;

const r3 = `      if (fdb) {
        try {
            let dbMsg: any = { ...msg, createdAt: serverTimestamp() };
            await addDoc(collection(fdb, 'messages'), dbMsg);
            const countSnapshot = await getCountFromServer(collection(fdb, 'messages'));
            if (countSnapshot.data().count > 100) {
               const oldestQ = query(collection(fdb, 'messages'), orderBy('createdAt', 'asc'), limit(1));
               const oldest = await getDocs(oldestQ);
               if (!oldest.empty) {
                 await deleteDoc(oldest.docs[0].ref);
               }
            }
        } catch (e) {
            console.error("Error saving global message to Firestore:", e);
        }
      } else {`;

if (code.includes(t3)) {
    // Wait, the block replacement might be tricky because of the closing brackets.
    // Let's use regex or a larger block.
}

fs.writeFileSync('server.ts', code);
