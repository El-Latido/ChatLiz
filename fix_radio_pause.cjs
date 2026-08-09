const fs = require('fs');
let content = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const replacement = `
  useEffect(() => {
      if (isPlaying && announcementState === 'idle' && currentRequestedSong?.announcementUrl && announcementAudioRef.current) {
          setAnnouncementState('playing');
          announcementAudioRef.current.play().catch(e => {
              console.error("Auto-play blocked for announcement", e);
              setAnnouncementState('done');
          });
      } else if (!isPlaying && announcementState === 'playing' && announcementAudioRef.current) {
          announcementAudioRef.current.pause();
      } else if (isPlaying && announcementState === 'playing' && announcementAudioRef.current) {
          announcementAudioRef.current.play().catch(e => console.error("Resume blocked", e));
      }
  }, [isPlaying, announcementState, currentRequestedSong]);
`;
content = content.replace(/useEffect\(\(\) => \{\n\s*if \(isPlaying && announcementState === 'idle'[\s\S]*?\}\), \[isPlaying, announcementState, currentRequestedSong\]\);/, replacement.trim());

fs.writeFileSync('src/components/InlineRadio.tsx', content);
