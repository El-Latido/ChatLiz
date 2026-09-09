const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Modify emitActiveUsers to filter out incognito users
code = code.replace(
  /const usersList = Object\.values\(activeUsers\)\.map/g,
  `const usersList = Object.values(activeUsers).filter(u => !u.incognito).map`
);

// Also filter in the direct emit during auth:
code = code.replace(
  /const usersList = Object\.values\(activeUsers\)\.map\(\(u\) => \(\{/g,
  `const usersList = Object.values(activeUsers).filter(u => !u.incognito).map((u) => ({`
);

// 2. Prevent incognito users from sending global messages
const sendGlobalMatch = `socket.on("send_global", async (msg) => {`;
const sendGlobalReplacement = `socket.on("send_global", async (msg) => {
      if (activeUsers[currentUsername]?.incognito) {
          return socket.emit("system_message", { text: "No puedes enviar mensajes globales en modo incógnito." });
      }`;
code = code.replace(sendGlobalMatch, sendGlobalReplacement);

// 3. Load incognito flag on login
// In google_login:
code = code.replace(/uid = user\.uid \|\| "";/g, `uid = user.uid || "";\n            let incognito = !!user.incognito;`);
code = code.replace(/activeUsers\[username\]\.status = user\.statusMessage \|\| "Disponible";/g, `activeUsers[username].status = user.statusMessage || "Disponible";\n               activeUsers[username].incognito = incognito;`);
code = code.replace(/activeUsers\[username\] = \{/g, `activeUsers[username] = {\n                  incognito: incognito,`);

// In register_or_login:
code = code.replace(/let profileLikes = 0;/g, `let profileLikes = 0;\n      let incognito = false;`);
code = code.replace(/profileLikes = user\?\.profileLikes \|\| 0;/g, `profileLikes = user?.profileLikes || 0;\n            incognito = !!user?.incognito;`);
code = code.replace(/activeUsers\[currentUsername\] = \{/g, `activeUsers[currentUsername] = {\n            incognito: incognito,`);

// 4. Add admin_delete_user and update_incognito events
const adminBanMatch = `socket.on("admin_ban_user", (targetUser, callback) => {`;
const adminEvents = `
    socket.on("admin_delete_user", async (targetUser, callback) => {
      if (activeUsers[currentUsername]?.role !== "admin" && currentUsername.toUpperCase() !== "AXISS") return callback({success: false});
      
      try {
         let targetEmail = "";
         if (fdb) {
             const d = await getDoc(doc(fdb, "users", targetUser));
             if (d.exists()) {
                 targetEmail = d.data().securityEmail;
                 await deleteDoc(doc(fdb, "users", targetUser));
             }
         } else {
             targetEmail = fallbackState.users[targetUser]?.securityEmail;
             delete fallbackState.users[targetUser];
         }
         
         if (targetEmail) {
             const mailOptions = {
                from: process.env.ADMIN_GMAIL,
                to: targetEmail,
                subject: "Tu cuenta de ChatLiz ha sido eliminada",
                text: "Hola, te informamos que tu cuenta en ChatLiz ha sido eliminada permanentemente por un administrador por incumplimiento de nuestras normas."
             };
             transporter.sendMail(mailOptions, (err) => {
                if (err) console.error("Error sending deletion email", err);
             });
         }
         
         if (activeUsers[targetUser]) {
             io.to(activeUsers[targetUser].socketId).emit("account_deleted");
             io.sockets.sockets.get(activeUsers[targetUser].socketId)?.disconnect();
             delete activeUsers[targetUser];
             emitActiveUsers();
         }
         
         callback({success: true});
      } catch (e) {
         callback({success: false, error: e.message});
      }
    });

    socket.on("update_incognito", async (isIncognito, callback) => {
        if (!currentUsername) return;
        if (activeUsers[currentUsername]) {
            activeUsers[currentUsername].incognito = isIncognito;
        }
        if (fdb) {
            await setDoc(doc(fdb, "users", currentUsername), { incognito: isIncognito }, { merge: true });
        } else {
            if(fallbackState.users[currentUsername]) fallbackState.users[currentUsername].incognito = isIncognito;
        }
        callback && callback({ success: true });
        emitActiveUsers();
    });

    socket.on("admin_ban_user", (targetUser, callback) => {`;

code = code.replace(adminBanMatch, adminEvents);

// 5. Add WebRTC signaling for Friends Webcam
const webcamSignaling = `
    let webcamQueue = [];
    socket.on("join_webcam_queue", () => {
        if (!currentUsername) return;
        if (!webcamQueue.includes(socket.id)) {
            webcamQueue.push(socket.id);
        }
        if (webcamQueue.length >= 2) {
            const peer1 = webcamQueue.shift();
            const peer2 = webcamQueue.shift();
            io.to(peer1).emit("webcam_matched", { initiator: true, partnerSocket: peer2 });
            io.to(peer2).emit("webcam_matched", { initiator: false, partnerSocket: peer1 });
        }
    });
    socket.on("leave_webcam_queue", () => {
        webcamQueue = webcamQueue.filter(id => id !== socket.id);
    });
    socket.on("webcam_signal", (data) => {
        io.to(data.to).emit("webcam_signal", { signal: data.signal, from: socket.id });
    });
    socket.on("webcam_disconnect", (data) => {
        io.to(data.to).emit("webcam_peer_disconnected");
    });
    
    socket.on("disconnect", () => {
        webcamQueue = webcamQueue.filter(id => id !== socket.id);
`;
code = code.replace(`socket.on("disconnect", () => {`, webcamSignaling);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully");
