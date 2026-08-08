const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

// Replace everything from `useEffect(() => {` (the one with queue_update) to the end of `toggleMute`
const oldCodeRegex = /  useEffect\(\(\) => \{\n    const handleQueueUpdate =.*?const toggleMute = \(\) => \{/s;

const newCode = `  useEffect(() => {
    const handleQueueUpdate = (data: { queue: any[], current: any }) => {
       setSongQueue(data.queue);
       setCurrentRequestedSong(data.current);
    };
    socket.on('queue_update', handleQueueUpdate);
    return () => {
       socket.off('queue_update', handleQueueUpdate);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlaying = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleError = () => setIsLoading(false);
    
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('error', handleError);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    
    // Set volume correctly depending on state
    if (currentRequestedSong) {
      // Mute main radio when YouTube is playing to ensure separation
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, currentRequestedSong]);

  useEffect(() => {
    if (isPlaying) {
      if (currentRequestedSong) {
         // Pause main radio
         if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
         }
         // Force YouTube to play explicitly
         if (playerRef.current && typeof playerRef.current.getInternalPlayer === 'function') {
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.playVideo === 'function') {
                internalPlayer.playVideo();
            }
         }
      } else {
         // Play main radio
         if (audioRef.current && audioRef.current.paused) {
             // Reload to catch up to live if it was paused
             audioRef.current.load();
             const playPromise = audioRef.current.play();
             if (playPromise !== undefined) {
                 playPromise.catch(e => {
                     console.error("Radio play error:", e);
                     setIsPlaying(false);
                 });
             }
         }
      }
    } else {
      // Pause both
      if (audioRef.current && !audioRef.current.paused) {
         audioRef.current.pause();
      }
      if (playerRef.current && typeof playerRef.current.getInternalPlayer === 'function') {
         const internalPlayer = playerRef.current.getInternalPlayer();
         if (internalPlayer && typeof internalPlayer.pauseVideo === 'function') {
             internalPlayer.pauseVideo();
         }
      }
    }
  }, [isPlaying, currentRequestedSong]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
    if (isMuted) setIsMuted(false);
  };

  const toggleMute = () => {`;

code = code.replace(oldCodeRegex, newCode);
fs.writeFileSync('src/components/InlineRadio.tsx', code);
