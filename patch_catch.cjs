const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace the outer catch block in triggerElizabeth
content = content.replace(/\} catch \(e\) \{\n\s*console\.error\("Gemini Error:", e\);\n\s*const errorMsg = \{ text: "Uf, me quedé sin energía por un momento \(Límites de IA alcanzados\)\. Denme un respiro\.", sender: "Elizabeth", id: Date\.now\(\)\.toString\(\), createdAt: Date\.now\(\) \};\n\s*if \(fdb\) \{\n\s*await addDoc\(collection\(fdb, 'messages'\), \{ \.\.\.errorMsg, createdAt: serverTimestamp\(\) \}\);\n\s*\} else \{\n\s*fallbackState\.globalMessages\.push\(errorMsg\);\n\s*saveFallbackDB\(\);\n\s*\}\n\s*io\.emit\("receive_global", errorMsg\);\n\s*\}/g, 
`} catch (e) {
          console.error("Gemini Error:", e);
          const errorMsg = { text: "Uf, me quedé sin energía por un momento. Denme un respiro.", sender: "Elizabeth", id: Date.now().toString(), createdAt: Date.now() };
          try {
            if (fdb) {
                await addDoc(collection(fdb, 'messages'), { ...errorMsg, createdAt: serverTimestamp() });
            } else {
                fallbackState.globalMessages.push(errorMsg);
                saveFallbackDB();
            }
          } catch(dbErr) {
            console.error("Failed to save error msg to db", dbErr);
          }
          io.emit("receive_global", errorMsg);
        }`);
        
// Also in triggerPrivateElizabeth
content = content.replace(/\} catch \(e\) \{\n\s*console\.error\("Gemini Error:", e\);\n\s*const errorMsg = \{ text: "Uf, me quedé sin energía por un momento \(Límites de IA alcanzados\)\. Dame un respiro\.", sender: "Elizabeth", id: Date\.now\(\)\.toString\(\), createdAt: Date\.now\(\) \};\n\s*if \(fdb\) \{\n\s*const participants = \[currentUsername, "Elizabeth"\]\.sort\(\);\n\s*const convoId = participants\.join\("_"\);\n\s*await addDoc\(collection\(fdb, 'private_messages', convoId, 'messages'\), \{ \.\.\.errorMsg, createdAt: serverTimestamp\(\) \}\);\n\s*\}\n\s*socket\.emit\("receive_private", errorMsg, "Elizabeth"\);\n\s*\}/g,
`} catch (e) {
          console.error("Gemini Error:", e);
          const errorMsg = { text: "Uf, me quedé sin energía por un momento. Dame un respiro.", sender: "Elizabeth", id: Date.now().toString(), createdAt: Date.now() };
          try {
              if (fdb) {
                const participants = [currentUsername, "Elizabeth"].sort();
                const convoId = participants.join("_");
                await addDoc(collection(fdb, 'private_messages', convoId, 'messages'), { ...errorMsg, createdAt: serverTimestamp() });
              }
          } catch (dbErr) {
              console.error("Failed to save private error msg", dbErr);
          }
          socket.emit("receive_private", errorMsg, "Elizabeth");
        }`);

fs.writeFileSync('server.ts', content);
