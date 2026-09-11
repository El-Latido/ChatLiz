const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The chunk we want to replace in the Firestore snapshot listener
const target = `                activeUsers[data.username].profilePic = data.profilePic;
                activeUsers[data.username].statusMessage = data.statusMessage;
                activeUsers[data.username].role = data.role;
                activeUsers[data.username].pais_idioma = data.pais_idioma;`;

const replacement = target + `
                activeUsers[data.username].nameColor = data.nameColor;
                activeUsers[data.username].nameNeon = data.nameNeon;
                activeUsers[data.username].nameRainbow = data.nameRainbow;
                activeUsers[data.username].nameNeonColor1 = data.nameNeonColor1;
                activeUsers[data.username].nameNeonColor2 = data.nameNeonColor2;
                activeUsers[data.username].nameFont = data.nameFont;
                activeUsers[data.username].chatFont = data.chatFont;
                activeUsers[data.username].chatColorStyle = data.chatColorStyle;
                activeUsers[data.username].bgImage = data.bgImage;`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts snapshot listener");
