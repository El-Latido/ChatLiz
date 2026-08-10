const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the previous TTS useEffect
const effectRegex = /const lastSpokenMessageId = useRef<string \| null>\(null\);\s*useEffect\(\(\) => \{[\s\S]*?window\.speechSynthesis\.speak\(utterance\);\s*\}\s*\}\s*\}, \[messages\]\);/g;

content = content.replace(effectRegex, '');

// Add hablarElizabeth function outside component or inside
const hablarFunc = `
function hablarElizabeth(texto: string) {
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'es-ES';
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}
`;

// Insert it right before App component
content = content.replace('export default function App() {', hablarFunc + '\nexport default function App() {');

// Update socket.on('receive_global'
content = content.replace(/socket\.on\('receive_global', \(msg: any\) => \{[\s\S]*?\}\);/m, 
`socket.on('receive_global', (msg: any) => {
      if (msg.sender === 'Elizabeth' || msg.isAi) {
         if (msg.text) hablarElizabeth(msg.text);
      }
    });`);

// Update socket.on('receive_private'
content = content.replace(/socket\.on\('receive_private', \(msg: any, fromUser: string\) => \{[\s\S]*?\}\);/m, 
`socket.on('receive_private', (msg: any, fromUser: string) => {
      if (activeChat !== fromUser) {
        setUnreadPMs(prev => ({ ...prev, [fromUser]: true }));
      }
      if (fromUser === 'Elizabeth' && msg.text) {
          hablarElizabeth(msg.text);
      }
    });`);

fs.writeFileSync('src/App.tsx', content);
