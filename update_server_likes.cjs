const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetLike = /socket\.on\("like_user", async \(targetUser\) => \{[\s\S]*?\}\);/;

const repLike = `socket.on("like_user", async (targetUser) => {
      if (!currentUsername) return;
      if (fdb) {
        try {
          const uRef = doc(fdb, "users", targetUser);
          const snap = await getDoc(uRef);
          if (snap.exists()) {
            const data = snap.data();
            const likedBy = data.likedBy || [];
            
            // Check if already liked
            if (!likedBy.includes(currentUsername)) {
                const currentLikes = data.profileLikes || 0;
                await updateDoc(uRef, { 
                    profileLikes: currentLikes + 1,
                    likedBy: arrayUnion(currentUsername)
                });
                if (activeUsers[targetUser]) {
                  activeUsers[targetUser].profileLikes = currentLikes + 1;
                  io.to(activeUsers[targetUser].socketId).emit("user_liked", currentUsername);
                }
            } else {
                // If they click again, maybe unlike? Or just ignore. The prompt says "sigue sumando like y es un like por cada usuario", so let's prevent adding if already liked. We can also allow unliking.
                const currentLikes = data.profileLikes || 0;
                if (currentLikes > 0) {
                   await updateDoc(uRef, {
                      profileLikes: currentLikes - 1,
                      likedBy: arrayRemove(currentUsername)
                   });
                   if (activeUsers[targetUser]) {
                     activeUsers[targetUser].profileLikes = currentLikes - 1;
                   }
                }
            }
          }
        } catch (e) {
          console.error("Error liking user:", e);
        }
      }
    });`;

code = code.replace(targetLike, repLike);
fs.writeFileSync('server.ts', code);
console.log("Updated server.ts like_user");
