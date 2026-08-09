const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Global chat catch block
const globalCatch = /\} catch \(e\) \{\n          console\.error\("Gemini Error:", e\);\n        \} finally \{\n          io\.emit\("stop_typing", \{ username: "Elizabeth", chat: "global" \}\);\n        \}/;

const newGlobalCatch = `} catch (e) {
          console.error("Gemini Error:", e);
          const errorMsg = { text: "Uf, me quedé sin energía por un momento (Límites de IA alcanzados). Denme un respiro.", sender: "Elizabeth", id: Date.now().toString(), createdAt: Date.now() };
          if (fdb) {
            await addDoc(collection(fdb, 'messages'), { ...errorMsg, createdAt: serverTimestamp() });
          } else {
            fallbackState.globalMessages.push(errorMsg);
            saveFallbackDB();
          }
          io.emit("receive_global", errorMsg);
        } finally {
          io.emit("stop_typing", { username: "Elizabeth", chat: "global" });
        }`;

code = code.replace(globalCatch, newGlobalCatch);

// Private chat catch block
const privateCatch = /\} catch \(e\) \{\n          console\.error\("Gemini Error:", e\);\n        \} finally \{\n          io\.emit\("stop_typing", \{ username: "Elizabeth", chat: currentUsername \}\);\n        \}/;

const newPrivateCatch = `} catch (e) {
          console.error("Gemini Error:", e);
          const errorMsg = { text: "Uf, me quedé sin energía por un momento (Límites de IA alcanzados). Dame un respiro.", sender: "Elizabeth", id: Date.now().toString(), createdAt: Date.now() };
          if (fdb) {
            const participants = [currentUsername, "Elizabeth"].sort();
            const convoId = participants.join("_");
            await addDoc(collection(fdb, 'private_messages', convoId, 'messages'), { ...errorMsg, createdAt: serverTimestamp() });
          }
          socket.emit("receive_private", errorMsg, "Elizabeth");
        } finally {
          io.emit("stop_typing", { username: "Elizabeth", chat: currentUsername });
        }`;

code = code.replace(privateCatch, newPrivateCatch);

fs.writeFileSync('server.ts', code);
