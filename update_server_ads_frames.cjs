const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Insert watch_ad_reward and update_frame
const injection = `
    socket.on("watch_ad_reward", async (callback) => {
      if (!currentUsername) return callback({ success: false });
      if (fdb) {
         try {
             // 1. Update user coins
             const uRef = doc(fdb, "users", currentUsername);
             const snap = await getDoc(uRef);
             let newCoins = 100;
             if (snap.exists()) {
                 newCoins = (snap.data().lizCoins || 0) + 100;
                 await updateDoc(uRef, { lizCoins: newCoins });
             }

             // 2. Update Admin Axiss
             const axissRef = doc(fdb, "users", "Axiss");
             const axissSnap = await getDoc(axissRef);
             if (axissSnap.exists()) {
                 const currentRev = axissSnap.data().adRevenue || 0;
                 const newRev = currentRev + 0.50; // Earn 50 cents per ad for example
                 await updateDoc(axissRef, { adRevenue: newRev });
                 if (activeUsers["Axiss"]) {
                     activeUsers["Axiss"].adRevenue = newRev;
                     io.to(activeUsers["Axiss"].socketId).emit("admin_revenue_update", newRev);
                 }
             }

             if (activeUsers[currentUsername]) {
                 activeUsers[currentUsername].lizCoins = newCoins;
                 emitActiveUsers();
             }
             callback({ success: true, newCoins });
         } catch(e) {
             console.error("Ad reward error:", e);
             callback({ success: false });
         }
      } else {
         if (fallbackState.users[currentUsername]) {
             fallbackState.users[currentUsername].lizCoins = (fallbackState.users[currentUsername].lizCoins || 0) + 100;
             if (activeUsers[currentUsername]) activeUsers[currentUsername].lizCoins = fallbackState.users[currentUsername].lizCoins;
             if (fallbackState.users["Axiss"]) {
                 fallbackState.users["Axiss"].adRevenue = (fallbackState.users["Axiss"].adRevenue || 0) + 0.50;
                 if (activeUsers["Axiss"]) activeUsers["Axiss"].adRevenue = fallbackState.users["Axiss"].adRevenue;
             }
             saveFallbackDB();
             emitActiveUsers();
             callback({ success: true, newCoins: fallbackState.users[currentUsername].lizCoins });
         } else {
             callback({ success: false });
         }
      }
    });

    socket.on("update_frame", async (frameId, callback) => {
      if (!currentUsername) return callback({ success: false });
      if (fdb) {
          try {
              const uRef = doc(fdb, "users", currentUsername);
              await updateDoc(uRef, { activeFrame: frameId || null });
              if (activeUsers[currentUsername]) {
                  activeUsers[currentUsername].activeFrame = frameId;
                  emitActiveUsers();
              }
              callback({ success: true });
          } catch(e) {
              console.error(e);
              callback({ success: false });
          }
      } else {
          if (fallbackState.users[currentUsername]) {
              fallbackState.users[currentUsername].activeFrame = frameId;
              if (activeUsers[currentUsername]) activeUsers[currentUsername].activeFrame = frameId;
              saveFallbackDB();
              emitActiveUsers();
              callback({ success: true });
          }
      }
    });
`;

// we'll place it right before update_ai_config
code = code.replace('    socket.on("update_ai_config"', injection + '\n    socket.on("update_ai_config"');

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts with Ad and Frame logic");
