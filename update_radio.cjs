const fs = require('fs');

let content = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

// Update !currentLiveDJ to (!currentLiveDJ || currentLiveDJ === 'Elizabeth')
content = content.replace(/!currentLiveDJ/g, "(!currentLiveDJ || currentLiveDJ === 'Elizabeth')");

// Add announcement states
if (!content.includes("announcementState")) {
    content = content.replace("const [isVideoPlaying, setIsVideoPlaying] = useState(false);", "const [isVideoPlaying, setIsVideoPlaying] = useState(false);\n  const [announcementState, setAnnouncementState] = useState<'idle' | 'playing' | 'done'>('done');\n  const [lastSongId, setLastSongId] = useState<string | null>(null);\n  const announcementAudioRef = useRef<HTMLAudioElement>(null);");
}

// Add the logic to update announcement state
const effectCode = `  useEffect(() => {
    if (currentRequestedSong && currentRequestedSong.id !== lastSongId) {
        setLastSongId(currentRequestedSong.id);
        setIsVideoReady(false);
        setIsVideoPlaying(false);
        if (currentRequestedSong.announcementUrl) {
            setAnnouncementState('idle');
        } else {
            setAnnouncementState('done');
        }
    }
  }, [currentRequestedSong, lastSongId]);

  useEffect(() => {
      if (isPlaying && announcementState === 'idle' && currentRequestedSong?.announcementUrl && announcementAudioRef.current) {
          setAnnouncementState('playing');
          announcementAudioRef.current.play().catch(e => {
              console.error("Auto-play blocked for announcement", e);
              setAnnouncementState('done');
          });
      }
  }, [isPlaying, announcementState, currentRequestedSong]);
`;
if (!content.includes("announcementAudioRef.current.play()")) {
    content = content.replace("const handleVideoEnded = () => {", effectCode + "\n  const handleVideoEnded = () => {");
}

// Update the video player to only play if announcement is done
content = content.replace("playing={isPlaying}", "playing={isPlaying && announcementState === 'done'}");

// Add the announcement audio tag
const audioTag = `
      <audio 
         ref={announcementAudioRef}
         src={currentRequestedSong?.announcementUrl || ''}
         onEnded={() => setAnnouncementState('done')}
         onError={() => setAnnouncementState('done')}
      />
`;
if (!content.includes("ref={announcementAudioRef}")) {
    content = content.replace("<audio \n         ref={audioRef}", audioTag + "      <audio \n         ref={audioRef}");
}

// Update the play button condition
content = content.replace("isPlaying && isVideoReady && !isVideoPlaying", "isPlaying && (isVideoReady || announcementState === 'playing') && !isVideoPlaying && announcementState === 'done'");

fs.writeFileSync('src/components/InlineRadio.tsx', content);
