const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(msg\.text && senderLanguage !== receiverLanguage\) \{\n           try \{\n              const resp = await ai\.models\.generateContent\(\{/;

const replacement = `if (msg.text && senderLanguage !== receiverLanguage) {
           const cacheKey = senderLanguage + "_" + receiverLanguage + "_" + msg.text;
           if (translationCache.has(cacheKey)) {
               finalMsgTextForReceiver = translationCache.get(cacheKey);
           } else {
           try {
              const resp = await ai.models.generateContent({`;

code = code.replace(regex, replacement);

const regexEnd = /finalMsgTextForReceiver = resp\.text \|\| msg\.text;\n           \} catch \(e\) \{/;
const replacementEnd = `finalMsgTextForReceiver = resp.text || msg.text;
              translationCache.set(cacheKey, finalMsgTextForReceiver);
           } catch (e) {`;

code = code.replace(regexEnd, replacementEnd);
// Also need to add an extra '}' because we added an 'else {'
const regexEnd2 = /finalMsgTextForReceiver = msg\.text;\n           \}\n        \}/;
const replacementEnd2 = `finalMsgTextForReceiver = msg.text;
           }
           }
        }`;
code = code.replace(regexEnd2, replacementEnd2);

fs.writeFileSync('server.ts', code);
