const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /      \/\/ Save original message to DB\n      if \(fdb\) \{\n          const docMsg = \{ \.\.\.msg, timestamp: serverTimestamp\(\) \};\n          const participants = \[currentUsername, toUser\]\.sort\(\);\n          const convoId = participants\.join\("_"\);\n          addDoc\(collection\(fdb, 'chats', convoId, 'messages'\), docMsg\)\.catch\(e => console\.error\('Firebase addDoc Error:', e\)\);\n          \/\/ Update the msg so it matches what we return back to sender\n          msg\.createdAt = Date\.now\(\);\n      \}/;

const replacement = `      // Save original message to DB
      if (fdb) {
          const docMsg = { ...msg, timestamp: serverTimestamp() };
          const participants = [currentUsername, toUser].sort();
          const convoId = participants.join("_");
          addDoc(collection(fdb, 'chats', convoId, 'messages'), docMsg).catch(e => console.error('Firebase addDoc Error:', e));
          
          // Update userChats for both users
          const senderChatRef = doc(fdb, "userChats", currentUsername, "chats", toUser);
          setDoc(senderChatRef, {
            lastMessage: msg.text || (msg.audio ? "Audio" : "Imagen"),
            updatedAt: serverTimestamp(),
            withUser: toUser
          }, { merge: true }).catch(e => console.error('Firebase userChats Error:', e));

          const receiverChatRef = doc(fdb, "userChats", toUser, "chats", currentUsername);
          setDoc(receiverChatRef, {
            lastMessage: msg.text || (msg.audio ? "Audio" : "Imagen"),
            updatedAt: serverTimestamp(),
            withUser: currentUsername
          }, { merge: true }).catch(e => console.error('Firebase userChats Error:', e));

          // Send notification
          addDoc(collection(fdb, "notifications"), {
            recipientUid: toUser,
            senderUid: currentUsername,
            senderName: currentUsername,
            type: "MESSAGE",
            message: \`Nuevo mensaje privado de \${currentUsername}\`,
            isRead: false,
            createdAt: serverTimestamp()
          }).catch(e => console.error('Firebase notifications Error:', e));

          // Update the msg so it matches what we return back to sender
          msg.createdAt = Date.now();
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
