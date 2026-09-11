const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const target = `          is_friends_public: isFriendsPublic,
          preferred_background: backgroundBase64,
          bubbleColor: finalBubbleColor,
          bubbleBorder,
          bubbleShape,
          bubbleTexture
      }));`;

const replacement = `          is_friends_public: isFriendsPublic,
          preferred_background: backgroundBase64,
          bubbleColor: finalBubbleColor,
          bubbleBorder,
          bubbleShape,
          bubbleTexture,
          nameColor,
          nameNeon,
          nameRainbow,
          nameNeonColor1,
          nameNeonColor2,
          nameFont,
          chatFont,
          chatColorStyle,
          bgImage: backgroundBase64
      }));`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
console.log("Patched local setUser update");
