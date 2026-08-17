const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add playNotifySound function at the top of MainApp
const audioFn = `
  const playNotifySound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch(e) { console.error("Sound error", e); }
  };
`;
if (!code.includes('playNotifySound = ()')) {
    code = code.replace(/function MainApp\(\) \{/, "function MainApp() {\n" + audioFn);
}

// 2. Play sound when message arrives
code = code.replace(/setMessages\(prev => \[\.\.\.prev, msg\]\);/g, "setMessages(prev => [...prev, msg]); playNotifySound();");
code = code.replace(/setMessages\(prev => \{\n\s*if \(prev\.some\(m => m\.id === msg\.id\)\)\s*return prev;\n\s*return \[\.\.\.prev, msg\];\n\s*\}\);/g, "setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; playNotifySound(); return [...prev, msg]; });");

// 3. Play sound when private message arrives
// Search for socket.on('private_message'
code = code.replace(
    /socket\.on\('private_message', \(msg: MessageObj\) => \{/,
    "socket.on('private_message', (msg: MessageObj) => {\n        playNotifySound();"
);

// 4. Play sound when notification arrives (in onSnapshot)
// Wait, onSnapshot sets notifications. We should play sound if the new snapshot has more notifications than before.
// Instead of that, we can play sound in the effect or on data arrive.
code = code.replace(
    /setNotifications\(prev => \{/,
    "setNotifications(prev => {\n                if (msgs.filter(m => !m.read).length > prev.filter(p => !p.read).length) playNotifySound();"
);

// 5. Fix userCache so offline users have usernames
code = code.replace(
    /cacheUpdates\[updatedUser\.username\] = updatedUser;/,
    "const uName = updatedUser.username || change.doc.id;\n                    cacheUpdates[uName] = { ...updatedUser, username: uName };"
);

fs.writeFileSync('src/App.tsx', code);
