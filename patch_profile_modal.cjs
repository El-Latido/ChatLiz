const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const target1 = `  const [bubbleBorder, setBubbleBorder] = useState(user.bubbleBorder || 'border-[#5A52A5]/30');
  const [bubbleShape, setBubbleShape] = useState(user.bubbleShape || 'rounded-2xl rounded-tr-sm');
  const [bubbleTexture, setBubbleTexture] = useState(user.bubbleTexture || 'none');`;

const replacement1 = `  const [bubbleBorder, setBubbleBorder] = useState(user.bubbleBorder || 'border-[#5A52A5]/30');
  const [bubbleShape, setBubbleShape] = useState(user.bubbleShape || 'rounded-2xl rounded-tr-sm');
  const [bubbleTexture, setBubbleTexture] = useState(user.bubbleTexture || 'none');

  const [nameColor, setNameColor] = useState(user.nameColor || '#FFFFFF');
  const [nameNeon, setNameNeon] = useState(user.nameNeon || 'none');
  const [nameRainbow, setNameRainbow] = useState(user.nameRainbow || false);
  const [nameNeonColor1, setNameNeonColor1] = useState(user.nameNeonColor1 || '#00f3ff');
  const [nameNeonColor2, setNameNeonColor2] = useState(user.nameNeonColor2 || '#ff00ff');
  const [nameFont, setNameFont] = useState(user.nameFont || 'default');
  const [chatFont, setChatFont] = useState(user.chatFont || 'default');
  const [chatColorStyle, setChatColorStyle] = useState(user.chatColorStyle || 'default');
`;

const target2 = `        nameColor,
        nameNeon,
        nameFont,
        chatFont,
        bgImage,`;

const replacement2 = `        nameColor,
        nameNeon,
        nameRainbow,
        nameNeonColor1,
        nameNeonColor2,
        nameFont,
        chatFont,
        chatColorStyle,
        bgImage: backgroundBase64,`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
console.log("Patched ProfileConfigModal state & save");
