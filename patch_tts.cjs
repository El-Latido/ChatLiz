const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const ttsCode = `
  const lastSpokenMessageId = useRef<string | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const latestMessage = messages[messages.length - 1];
    
    if (
        (latestMessage.sender === 'Elizabeth' || latestMessage.isAi) && 
        latestMessage.id !== lastSpokenMessageId.current &&
        latestMessage.text
    ) {
        lastSpokenMessageId.current = latestMessage.id;

        const msgTime = latestMessage.createdAt?.seconds ? latestMessage.createdAt.seconds * 1000 : (typeof latestMessage.createdAt === 'number' ? latestMessage.createdAt : Date.now());
        
        if (Date.now() - msgTime < 15000) {
            const utterance = new SpeechSynthesisUtterance(latestMessage.text);
            utterance.lang = 'es-ES';
            
            const voices = window.speechSynthesis.getVoices();
            const esVoices = voices.filter(v => v.lang.startsWith('es'));
            const preferredVoice = esVoices.find(v => v.name.toLowerCase().includes('monica') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('mujer') || v.name.toLowerCase().includes('google español')) || esVoices[0];
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            utterance.rate = 1.05;
            utterance.pitch = 1.1;
            
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }
  }, [messages]);
`;

if (!content.includes('lastSpokenMessageId')) {
    content = content.replace(/const \[messages, setMessages\] = useState<any\[\]>\(\[\]\);/, "const [messages, setMessages] = useState<any[]>([]);\n" + ttsCode);
}

fs.writeFileSync('src/App.tsx', content);
