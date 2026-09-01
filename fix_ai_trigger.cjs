const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The import
if (!code.includes('import { AI_CHARACTERS }')) {
    code = code.replace('import { updateAiProfileInFirebase } from "./server/firebaseLogic";', 'import { updateAiProfileInFirebase } from "./server/firebaseLogic";\nimport { AI_CHARACTERS } from "./src/aiCharacters";');
}

// 1. replace `let triggerPrivateElizabeth = false;` to `let triggerPrivateAi = false; let aiCharacter = null;`
code = code.replace(/let triggerPrivateElizabeth = false;\s*if \(toUser === "Elizabeth"\) \{\s*triggerPrivateElizabeth = true;\s*\}/, 
`let triggerPrivateAi = false;
      let aiCharacter = null;
      if (AI_CHARACTERS[toUser]) {
        triggerPrivateAi = true;
        aiCharacter = AI_CHARACTERS[toUser];
      }`);

// 2. replace `if (triggerPrivateElizabeth) {`
const tokenLogic = `if (triggerPrivateAi) {
        // Tokens validation
        const userCoins = activeUsers[currentUsername]?.lizCoins || 0;
        if (userCoins < 1) {
            io.to(activeUsers[currentUsername].socketId).emit("receive_private", {
                text: \`[SISTEMA] No tienes suficientes LizCoins para chatear con \${aiCharacter.name}. Ve al Selector de Personajes IA en la barra lateral para ver un video y ganar créditos.\`,
                sender: toUser,
                id: Date.now().toString()
            }, currentUsername);
            return;
        }
        
        // Deduct token
        activeUsers[currentUsername].lizCoins -= 1;
        if (fdb) {
           updateDoc(doc(fdb, "users", currentUsername), { lizCoins: activeUsers[currentUsername].lizCoins }).catch(()=>{});
        } else {
           if (fallbackState.users[currentUsername]) {
               fallbackState.users[currentUsername].lizCoins = activeUsers[currentUsername].lizCoins;
               saveFallbackDB();
           }
        }
        io.to(activeUsers[currentUsername].socketId).emit("update_user_info", activeUsers[currentUsername]);
`;
code = code.replace('if (triggerPrivateElizabeth) {', tokenLogic);

fs.writeFileSync('server.ts', code);
console.log("Patched trigger");
