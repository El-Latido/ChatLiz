const fs = require('fs');

// Patch InlineRadio.tsx
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

code = code.replace(
  `playPromise.catch(e => {
                     console.error("Radio play error:", e);
                     setIsPlaying(false);
                 });`,
  `playPromise.catch((e: any) => {
                     if (e.name === 'AbortError') {
                         console.log('Reproducción de radio cancelada por nueva petición.');
                         return;
                     }
                     console.error("Radio play error:", e);
                     setIsPlaying(false);
                 });`
);

code = code.replace(
  `announcementAudioRef.current.play().catch(e => {
              console.error("Auto-play blocked for announcement", e);
              setAnnouncementState('done');
          });`,
  `announcementAudioRef.current.play().catch((e: any) => {
              if (e.name === 'AbortError') return;
              console.error("Auto-play blocked for announcement", e);
              setAnnouncementState('done');
          });`
);

fs.writeFileSync('src/components/InlineRadio.tsx', code);

// Patch PremiumAudioPlayer.tsx
let code2 = fs.readFileSync('src/components/PremiumAudioPlayer.tsx', 'utf8');
code2 = code2.replace(
  `audioRef.current.play().catch(err => console.error("Playback error:", err));`,
  `audioRef.current.play().catch((err: any) => {
        if (err.name === 'AbortError') return;
        console.error("Playback error:", err);
      });`
);
fs.writeFileSync('src/components/PremiumAudioPlayer.tsx', code2);
