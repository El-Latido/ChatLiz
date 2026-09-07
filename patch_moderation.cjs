const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `const BANNED_WORDS = ["puta", "puto", "mierda", "pendejo", "pendeja", "cabrón", "cabron", "zorra", "idiota", "estúpido", "estupido", "imbécil", "imbecil"];
const userWarnings = {};

async function moderateMessage(msg, aiClient) {
  const text = (msg.text || "").toLowerCase();
  let banned = false;
  let reason = "";
  let mentionsElizabeth = false;

  if (text.match(/\\b(@?elizabeth|@?liz)\\b/i)) {
    mentionsElizabeth = true;
  }

  const containsBadWord = BANNED_WORDS.some(word => text.includes(word));
  
  if (containsBadWord) {
     const sender = msg.sender || msg.senderId;
     if (sender) {
         userWarnings[sender] = (userWarnings[sender] || 0) + 1;
         if (userWarnings[sender] >= 3) {
             banned = true;
             reason = "Acumulación de 3 advertencias por uso de lenguaje inapropiado.";
             userWarnings[sender] = 0; // reset
         } else {
             banned = false; // It's just a warning, handled outside? Or maybe return warning?
             reason = \`ADVERTENCIA \${userWarnings[sender]}/3: Modera tu lenguaje o serás bloqueado.\`;
         }
     }
  }

  return {
    banned,
    reason, // If not banned, can be used as a warning message
    isWarning: containsBadWord && !banned,
    transcription: "", // Tokenless doesn't transcribe audio
    mentionsElizabeth
  };
}`;

const moderateRegex = /async function moderateMessage[\s\S]*?__name\(moderateMessage,\s*"moderateMessage"\);/;

if (code.match(moderateRegex)) {
    code = code.replace(moderateRegex, replacement + '\n__name(moderateMessage, "moderateMessage");');
    fs.writeFileSync('server.ts', code);
    console.log("Patched moderateMessage");
} else {
    console.log("Could not find moderateMessage");
}
