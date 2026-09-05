const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const searchAd = `    socket.on("buy_decoration", async (data, cb) => {`;
const replaceAd = `    socket.on("watch_ad_reward", async () => {
      if (!currentUsername || !fdb) return;
      try {
        const uRef = doc(fdb, "users", currentUsername);
        const snap = await getDoc(uRef);
        if (snap.exists()) {
          const currentCoins = snap.data().lizCoins || 0;
          await updateDoc(uRef, {
            lizCoins: currentCoins + 100
          });
          socket.emit("update_coins", currentCoins + 100);
        }
      } catch (e) {
        console.error("Ad reward error", e);
      }
    });

    socket.on("buy_decoration", async (data, cb) => {`;
code = code.replace(searchAd, replaceAd);


const searchComment = `    socket.on("like_user", async (targetUser) => {`;
const replaceComment = `    socket.on("add_profile_comment", async (data) => {
      if (!currentUsername || !fdb) return;
      try {
          const commentObj = {
              author: currentUsername,
              text: data.comment,
              timestamp: Date.now()
          };
          const uRef = doc(fdb, "users", data.targetUser);
          const snap = await getDoc(uRef);
          if (snap.exists()) {
              await updateDoc(uRef, {
                  profileComments: [...(snap.data().profileComments || []), commentObj]
              });
          }
          // Notify the target user if online
          const targetSocketId = activeUsers[data.targetUser]?.socketId;
          if (targetSocketId) {
              io.to(targetSocketId).emit("new_profile_comment", { fromUser: currentUsername, comment: commentObj });
          }
      } catch (e) {
          console.error("Error adding profile comment", e);
      }
    });

    socket.on("like_user", async (targetUser) => {`;

code = code.replace(searchComment, replaceComment);

fs.writeFileSync('server.ts', code);
