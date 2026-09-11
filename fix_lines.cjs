const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

const correct = `    socket.on("like_user", async (targetUser) => {
      if (!currentUsername) return;
      if (fdb) {
        try {
          const uRef = doc(fdb, "users", targetUser);
          const snap = await getDoc(uRef);
          if (snap.exists()) {
            const data = snap.data();
            const likedBy = data.likedBy || [];
            
            if (!likedBy.includes(currentUsername)) {
                const currentLikes = data.profileLikes || 0;
                await updateDoc(uRef, { 
                    profileLikes: currentLikes + 1,
                    likedBy: arrayUnion(currentUsername)
                });
                if (activeUsers[targetUser]) {
                  activeUsers[targetUser].profileLikes = currentLikes + 1;
                  io.to(activeUsers[targetUser].socketId).emit("user_liked", currentUsername);
                  emitActiveUsers();
                }
            } else {
                const currentLikes = data.profileLikes || 0;
                if (currentLikes > 0) {
                   await updateDoc(uRef, {
                      profileLikes: currentLikes - 1,
                      likedBy: arrayRemove(currentUsername)
                   });
                   if (activeUsers[targetUser]) {
                     activeUsers[targetUser].profileLikes = currentLikes - 1;
                     emitActiveUsers();
                   }
                }
            }
          }
        } catch (e) {
          console.error("Error liking user:", e);
        }
      } else {
        if (fallbackState.users[targetUser]) {
            const likedBy = fallbackState.users[targetUser].likedBy || [];
            if (!likedBy.includes(currentUsername)) {
              fallbackState.users[targetUser].likedBy = [...likedBy, currentUsername];
              fallbackState.users[targetUser].profileLikes = (fallbackState.users[targetUser].profileLikes || 0) + 1;
              if (activeUsers[targetUser]) {
                activeUsers[targetUser].profileLikes = fallbackState.users[targetUser].profileLikes;
                io.to(activeUsers[targetUser].socketId).emit("user_liked", currentUsername);
              }
              emitActiveUsers();
            } else {
              fallbackState.users[targetUser].likedBy = likedBy.filter(u => u !== currentUsername);
              fallbackState.users[targetUser].profileLikes = Math.max(0, (fallbackState.users[targetUser].profileLikes || 0) - 1);
              if (activeUsers[targetUser]) {
                activeUsers[targetUser].profileLikes = fallbackState.users[targetUser].profileLikes;
              }
              emitActiveUsers();
            }
        }
      }
    });`;

// lines 1362 to 1420 (0-indexed 1361 to 1419)
lines.splice(1361, 1420 - 1361 + 1, correct);

fs.writeFileSync('server.ts', lines.join('\n'));
console.log("Replaced lines successfully");
