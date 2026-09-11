const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `      activeDecoration: u.activeDecoration || null,
      ownedDecorations: u.ownedDecorations || [],
    }));`;

const replacement1 = `      activeDecoration: u.activeDecoration || null,
      ownedDecorations: u.ownedDecorations || [],
      nameColor: u.nameColor,
      nameNeon: u.nameNeon,
      nameRainbow: u.nameRainbow,
      nameNeonColor1: u.nameNeonColor1,
      nameNeonColor2: u.nameNeonColor2,
      nameFont: u.nameFont,
      chatFont: u.chatFont,
      chatColorStyle: u.chatColorStyle,
      bgImage: u.bgImage,
      bubbleColor: u.bubbleColor,
      bubbleBorder: u.bubbleBorder,
      bubbleShape: u.bubbleShape,
      bubbleTexture: u.bubbleTexture,
    }));`;

const target2 = `          activeDecoration: u.activeDecoration || null,
          ownedDecorations: u.ownedDecorations || [],
        }));`;

const replacement2 = `          activeDecoration: u.activeDecoration || null,
          ownedDecorations: u.ownedDecorations || [],
          nameColor: u.nameColor,
          nameNeon: u.nameNeon,
          nameRainbow: u.nameRainbow,
          nameNeonColor1: u.nameNeonColor1,
          nameNeonColor2: u.nameNeonColor2,
          nameFont: u.nameFont,
          chatFont: u.chatFont,
          chatColorStyle: u.chatColorStyle,
          bgImage: u.bgImage,
          bubbleColor: u.bubbleColor,
          bubbleBorder: u.bubbleBorder,
          bubbleShape: u.bubbleShape,
          bubbleTexture: u.bubbleTexture,
        }));`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts usersList");
