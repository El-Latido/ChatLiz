const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const targetSaveDoc = /const savePromise = setDoc\(doc\(db, "users", user\.username!\), \{[\s\S]*?updatedAt: new Date\(\)\s*\}, \{ merge: true \}\);/;

const newSaveDoc = `const savePromise = setDoc(doc(db, "users", user.username!), {
        password: password,
        profilePic: fotoURL,
        statusMessage: comentario,
        pais_idioma: pais,
        is_friends_public: isFriendsPublic,
        preferred_background: backgroundBase64,
        bubbleColor: finalBubbleColor,
        bubbleBorder: bubbleBorder,
        bubbleShape: bubbleShape,
        bubbleTexture: bubbleTexture,
        nameColor,
        nameNeon,
        nameFont,
        chatFont,
        bgImage,
        updatedAt: new Date()
      }, { merge: true });`;

const targetSetUser = /setUser\(prev => \(\{[\s\S]*?bubbleTexture,\s*is_friends_public: isFriendsPublic,\s*incognito\s*\}\)\);/;

const newSetUser = `setUser(prev => ({
          ...prev,
          password,
          profilePic: fotoURL,
          statusMessage: comentario,
          pais_idioma: pais,
          preferred_background: backgroundBase64,
          bubbleColor: finalBubbleColor,
          bubbleBorder,
          bubbleShape,
          bubbleTexture,
          nameColor,
          nameNeon,
          nameFont,
          chatFont,
          bgImage,
          is_friends_public: isFriendsPublic,
          incognito
      }));`;

code = code.replace(targetSaveDoc, newSaveDoc);
code = code.replace(targetSetUser, newSetUser);
fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
console.log("Updated ProfileConfigModal.tsx handleSaveProfile");
