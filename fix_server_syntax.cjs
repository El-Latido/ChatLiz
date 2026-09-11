const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /socket\.on\("like_user", async \(targetUser\) => \{[\s\S]*?\}\);[\s\S]*?if \(activeUsers\[targetUser\]\) \{[\s\S]*?\}\);/g;

// I'll just find the exact string that is broken and replace it.
const broken = `    socket.on("like_user", async (targetUser) => {
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
    });
            if (activeUsers[targetUser]) {
              activeUsers[targetUser].profileLikes = currentLikes + 1;
              emitActiveUsers();
              io.to(activeUsers[targetUser].socketId).emit("user_liked", currentUsername);
            }
          }
        } catch (e) {}
      } else {
        if (fallbackState.users[targetUser]) {
          fallbackState.users[targetUser].profileLikes =
            (fallbackState.users[targetUser].profileLikes || 0) + 1;
          if (activeUsers[targetUser])
            activeUsers[targetUser].profileLikes =
              fallbackState.users[targetUser].profileLikes;
          emitActiveUsers();
          io.to(activeUsers[targetUser].socketId).emit("user_liked", currentUsername);
        }
      }
    });`;

const correct = `    socket.on("like_user", async (targetUser) => {
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

if(code.includes(broken)) {
    code = code.replace(broken, correct);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed syntax error in server.ts");
} else {
    console.log("Could not find the exact broken string.");
}
