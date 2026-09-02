const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Replace aiUserTempCache declaration
const oldCache = `  let aiUserTempCache = {
    username: "Elizabeth",
    profilePic: "",
    statusMessage: "Administradora",
    role: "admin",
  };`;
const newCache = `  let aiUserTempCache = {};
  for (const k of Object.keys(AI_CHARACTERS)) {
      aiUserTempCache[k] = {
          username: k,
          profilePic: AI_CHARACTERS[k].avatar || "",
          statusMessage: "Inteligencia Artificial",
          role: k === "Elizabeth" ? "admin" : "user",
      };
  }`;
code = code.replace(oldCache, newCache);

// 2. Replace loadAiUser
const oldLoadAiUser = `  const loadAiUser = withErrorHandling(async () => {
    if (fdb) {
      try {
        const docR = await getDoc(doc(fdb, "users", "Elizabeth"));
        if (docR.exists()) aiUserTempCache = docR.data();
      } catch (e) {}
    } else {
      if (fallbackState.users["Elizabeth"])
        aiUserTempCache = {
          ...fallbackState.users["Elizabeth"],
          username: "Elizabeth",
        };
    }
  }, "loadAiUser");`;

const newLoadAiUser = `  const loadAiUser = withErrorHandling(async () => {
    if (fdb) {
      try {
        for (const ai of Object.keys(AI_CHARACTERS)) {
            const docR = await getDoc(doc(fdb, "users", ai));
            if (docR.exists()) aiUserTempCache[ai] = { ...aiUserTempCache[ai], ...docR.data() };
        }
      } catch (e) {}
    } else {
      for (const ai of Object.keys(AI_CHARACTERS)) {
        if (fallbackState.users[ai])
          aiUserTempCache[ai] = {
            ...aiUserTempCache[ai],
            ...fallbackState.users[ai],
            username: ai,
          };
      }
    }
  }, "loadAiUser");`;
code = code.replace(oldLoadAiUser, newLoadAiUser);

// 3. onSnapshot for "users" collection
const oldSnapshot = `              if (data.username === "Elizabeth") {
                aiUserTempCache = { ...aiUserTempCache, ...data };
                changed = true;
              } else if (activeUsers[data.username]) {`;

const newSnapshot = `              if (AI_CHARACTERS[data.username]) {
                aiUserTempCache[data.username] = { ...aiUserTempCache[data.username], ...data };
                changed = true;
              } else if (activeUsers[data.username]) {`;
code = code.replace(oldSnapshot, newSnapshot);

// 4. emitActiveUsers
const oldUnshift = `    usersList.unshift(aiUserTempCache);`;
const newUnshift = `    for (const ai of Object.keys(AI_CHARACTERS)) { usersList.unshift(aiUserTempCache[ai]); }`;
// Need to replace it globally
code = code.replace(/usersList\.unshift\(aiUserTempCache\);/g, newUnshift);

// 5. update_ai_config
const oldUpdate = `    socket.on("update_ai_config", async (data, callback) => {
      if (currentUsername !== "Axiss")
        return callback({
          success: false,
          error:
            "Solo el Administrador Supremo Axiss puede modificar mi perfil.",
        });
      const aiUsername = "Elizabeth";
      const { profilePic, statusMessage, systemInstruction } = data;`;

const newUpdate = `    socket.on("update_ai_config", async (data, callback) => {
      if (currentUsername !== "Axiss")
        return callback({
          success: false,
          error:
            "Solo el Administrador Supremo Axiss puede modificar el perfil.",
        });
      const aiUsername = data.aiUsername || "Elizabeth";
      if (!AI_CHARACTERS[aiUsername]) return callback({ success: false, error: "Personaje IA no encontrado." });
      
      const { profilePic, statusMessage, systemInstruction } = data;`;
code = code.replace(oldUpdate, newUpdate);

// 5.5 update_ai_config assignments
const oldUpdateAssignments = `      aiUserTempCache = {
        username: aiUsername,
        profilePic: safeProfilePic,
        statusMessage: safeStatusMessage,
        systemInstruction: safeSystemInstruction,
        role: "admin",
      };`;
const newUpdateAssignments = `      aiUserTempCache[aiUsername] = {
        ...aiUserTempCache[aiUsername],
        username: aiUsername,
        profilePic: safeProfilePic,
        statusMessage: safeStatusMessage,
        systemInstruction: safeSystemInstruction,
      };`;
code = code.replace(oldUpdateAssignments, newUpdateAssignments);


// 6. triggerPrivateAi instructions for Gemini
// There are two places where sysInstruction is defined (global chat DJ / private chat)
// Actually we only care about private chat now, but let's check both
code = code.replace(/const sysInstruction = \(aiCharacter\.id === "Elizabeth" && aiUserTempCache\?\.systemInstruction\)/g,
 'const sysInstruction = aiUserTempCache[aiCharacter.id]?.systemInstruction');
 
// For older sysInstruction block in triggerPrivateAi
code = code.replace(/const sysInstruction = aiUserTempCache\?\.systemInstruction\s*\?\s*`\$\{baseSysInstruction\}\\nInstrucciones adicionales del Administrador:\\n\$\{aiUserTempCache\.systemInstruction\}`\s*:\s*baseSysInstruction;/g,
 'const sysInstruction = aiUserTempCache[aiCharacter.id]?.systemInstruction ? `${baseSysInstruction}\\nInstrucciones adicionales del Administrador:\\n${aiUserTempCache[aiCharacter.id].systemInstruction}` : baseSysInstruction;');

// Replace another old prompt format if exists
code = code.replace(/const sysInstruction = aiUserTempCache\?\.systemInstruction\s*\?\s*`\$\{baseSysInstruction\}\\n\\nInstrucciones adicionales del Administrador:\\n\$\{aiUserTempCache\.systemInstruction\}`\s*:\s*baseSysInstruction;/g,
 'const sysInstruction = aiUserTempCache[aiCharacter.id]?.systemInstruction ? `${baseSysInstruction}\\nInstrucciones adicionales del Administrador:\\n${aiUserTempCache[aiCharacter.id].systemInstruction}` : baseSysInstruction;');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for multi-AI config");
