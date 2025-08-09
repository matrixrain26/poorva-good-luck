import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { audioSrc } from '../data/content';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    // Get volume from localStorage or default to 0.7 (70%)
    const savedVolume = localStorage.getItem('audioVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.7;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    if (!audioRef.current) return;
    
    setVolume(newVolume);
    audioRef.current.volume = isMuted ? 0 : newVolume;
    
    // Save to localStorage
    localStorage.setItem('audioVolume', newVolume.toString());
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    audioRef.current.volume = newMuteState ? 0 : volume;
  };

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 'M' key toggles mute
      if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMuted, volume]);

  // Listen for custom toggle-audio event from Hero component
  useEffect(() => {
    const handleToggleAudio = () => {
      togglePlay();
    };

    window.addEventListener('toggle-audio', handleToggleAudio);
    return () => {
      window.removeEventListener('toggle-audio', handleToggleAudio);
    };
  }, [isPlaying]);

  return (
    <div>
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        loop 
        preload="auto"
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <motion.div 
        className={`bg-background border border-white/10 rounded-full shadow-lg ${
          isExpanded ? 'p-4' : 'p-3'
        }`}
        animate={{ width: isExpanded ? 'auto' : 'auto' }}
        transition={{ duration: 0.3 }}
      >
        {isExpanded ? (
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/10 transition"
                aria-label={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 accent-indigo-500"
                aria-label="Volume control"
              />
            </div>
            
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-full hover:bg-white/10 transition"
              aria-label="Collapse audio controls"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-center"
            aria-label="Expand audio controls"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default AudioPlayer;
