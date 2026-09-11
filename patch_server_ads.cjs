const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  socket.on("buy_decoration"`;

const replacement = `  socket.on("watch_ad_reward", async (data, callback) => {
    try {
        const username = Array.from(userSockets.entries()).find(([_, s]) => s === socket.id)?.[0];
        if (!username) return callback({ success: false, error: "No autenticado" });
        
        const reward = data.reward || 10;
        
        // Update user's coins
        const userRef = doc(db, "users", username);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const currentCoins = userDoc.data().lizCoins || 0;
            await updateDoc(userRef, { lizCoins: currentCoins + reward });
            
            // Update admin monetization stats
            const statsRef = doc(db, "system", "monetization");
            const statsDoc = await getDoc(statsRef);
            if (statsDoc.exists()) {
                const currentViews = statsDoc.data().adViews || 0;
                const currentRevenue = statsDoc.data().lifetimeRevenue || 0;
                await updateDoc(statsRef, {
                    adViews: currentViews + 1,
                    lifetimeRevenue: currentRevenue + 0.05 // Example $0.05 per ad
                });
            } else {
                await setDoc(statsRef, { adViews: 1, lifetimeRevenue: 0.05 });
            }
            
            callback({ success: true });
        }
    } catch (e: any) {
        callback({ success: false, error: e.message });
    }
  });

  socket.on("buy_decoration"`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server for watch_ad_reward");
