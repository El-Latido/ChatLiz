const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/translationCache\.has\(receiverLanguage\)/g, "translationCache.has(senderLanguage + '_' + receiverLanguage + '_' + msg.text)");
code = code.replace(/translationCache\.get\(receiverLanguage\)/g, "translationCache.get(senderLanguage + '_' + receiverLanguage + '_' + msg.text)");
code = code.replace(/translationCache\.set\(receiverLanguage, finalMsgText as string\)/g, "translationCache.set(senderLanguage + '_' + receiverLanguage + '_' + msg.text, finalMsgText as string)");

code = code.replace(/eliTranslationCache\.has\(receiverLanguage\)/g, "eliTranslationCache.has(eliSenderLanguage + '_' + receiverLanguage + '_' + eliMsg.text)");
code = code.replace(/eliTranslationCache\.get\(receiverLanguage\)/g, "eliTranslationCache.get(eliSenderLanguage + '_' + receiverLanguage + '_' + eliMsg.text)");
code = code.replace(/eliTranslationCache\.set\(receiverLanguage, finalMsgText as string\)/g, "eliTranslationCache.set(eliSenderLanguage + '_' + receiverLanguage + '_' + eliMsg.text, finalMsgText as string)");

fs.writeFileSync('server.ts', code);
