import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { audioSrc, backupAudioSrc1, backupAudioSrc2 } from '../data/content';

// Define audio formats to try in order of preference
const AUDIO_FORMATS = ['mp3', 'ogg', 'wav'];

// Helper function to check if we're in production
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && 
   !window.location.hostname.includes('127.0.0.1'));

console.log(`AudioPlayer initializing in ${isProduction ? 'production' : 'development'} environment`);

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    // Get volume from localStorage or default to 0.7 (70%)
    const savedVolume = localStorage.getItem('audioVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.7;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Try to get last working audio source from localStorage
  const getInitialAudioSrc = () => {
    try {
      const lastWorkingSource = localStorage.getItem('lastWorkingAudioSrc');
      if (lastWorkingSource) {
        console.log('Found last working audio source in localStorage:', lastWorkingSource);
        return lastWorkingSource;
      }
    } catch (e) {
      console.error('Error reading last working audio source from localStorage:', e);
    }
    return audioSrc; // Default to primary source if nothing in localStorage
  };
  
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

  // Track current audio source and index
  const [currentAudioSrc, setCurrentAudioSrc] = useState(getInitialAudioSrc);
  const [audioSourceIndex, setAudioSourceIndex] = useState(0);
  const [currentFormat, setCurrentFormat] = useState('mp3');
  const [audioLoadAttempts, setAudioLoadAttempts] = useState(0);
  
  // All available audio sources in fallback order
  const audioSources = [audioSrc, backupAudioSrc1, backupAudioSrc2];
  
  // Generate a source URL with format
  const generateSourceUrl = (baseUrl: string, format: string) => {
    // If the URL already has a format extension, replace it
    if (/\.(mp3|ogg|wav)$/i.test(baseUrl)) {
      return baseUrl.replace(/\.(mp3|ogg|wav)$/i, `.${format}`);
    }
    // Otherwise, add the format extension
    return `${baseUrl}.${format}`;
  };
  
  // Try next audio source in the fallback chain
  const tryNextAudioSource = () => {
    console.log(`Audio load attempt ${audioLoadAttempts + 1}`);
    setAudioLoadAttempts(prev => prev + 1);
    
    // First try different formats of the same source
    const currentFormatIndex = AUDIO_FORMATS.indexOf(currentFormat);
    const nextFormatIndex = currentFormatIndex + 1;
    
    if (nextFormatIndex < AUDIO_FORMATS.length) {
      // Try next format with same source
      const nextFormat = AUDIO_FORMATS[nextFormatIndex];
      console.log(`Trying format ${nextFormat} with source ${audioSourceIndex}: ${audioSources[audioSourceIndex]}`);
      setCurrentFormat(nextFormat);
      const newSrc = generateSourceUrl(audioSources[audioSourceIndex], nextFormat);
      setCurrentAudioSrc(newSrc);
      return true;
    }
    
    // If all formats tried, move to next source
    const nextSourceIndex = audioSourceIndex + 1;
    if (nextSourceIndex < audioSources.length) {
      console.log(`Trying audio source ${nextSourceIndex}: ${audioSources[nextSourceIndex]}`);
      setAudioSourceIndex(nextSourceIndex);
      setCurrentFormat(AUDIO_FORMATS[0]); // Reset format to first option
      const newSrc = generateSourceUrl(audioSources[nextSourceIndex], AUDIO_FORMATS[0]);
      setCurrentAudioSrc(newSrc);
      return true;
    }
    
    console.error('All audio sources and formats failed');
    
    // Last resort: try direct URLs without format manipulation
    if (audioLoadAttempts < audioSources.length * 2) {
      const lastResortIndex = audioLoadAttempts % audioSources.length;
      console.log(`Last resort: trying direct URL for source ${lastResortIndex}`);
      setCurrentAudioSrc(audioSources[lastResortIndex]);
      return true;
    }
    
    return false;
  };

  // Initialize audio element when component mounts
  useEffect(() => {
    console.log(`Initializing audio with source: ${currentAudioSrc}`);
    
    if (audioRef.current) {
      // Set volume
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Add comprehensive error handling
      audioRef.current.onerror = (e) => {
        const error = e as ErrorEvent;
        console.error(`Audio playback error with source ${audioSourceIndex}:`, error);
        console.error(`Audio error details - code: ${audioRef.current?.error?.code}, message: ${audioRef.current?.error?.message}`);
        
        // Try next source after a short delay
        setTimeout(() => {
          tryNextAudioSource();
        }, 1000);
      };
      
      // Add loadstart handler
      audioRef.current.onloadstart = () => {
        console.log(`Audio loadstart event for source: ${currentAudioSrc}`);
      };
      
      // Add loadeddata handler
      audioRef.current.onloadeddata = () => {
        console.log(`Audio loaded successfully: ${currentAudioSrc}`);
      };
      
      // Add canplay handler
      audioRef.current.oncanplay = () => {
        console.log(`Audio can play: ${currentAudioSrc}`);
        // If we were previously playing, resume playback
        if (isPlaying) {
          audioRef.current?.play().catch(playError => {
            console.error('Failed to resume playback after source change:', playError);
          });
        }
      };
      
      // Add stalled handler
      audioRef.current.onstalled = () => {
        console.warn(`Audio stalled: ${currentAudioSrc}`);
      };
      
      // Add waiting handler
      audioRef.current.onwaiting = () => {
        console.warn(`Audio waiting: ${currentAudioSrc}`);
      };
    }
  }, [isMuted, volume, currentAudioSrc, audioSourceIndex, isPlaying]);

  return (
    <div>
      <audio 
        ref={audioRef} 
        src={currentAudioSrc} 
        loop 
        crossOrigin="anonymous"
        preload="auto"
        onLoadStart={() => console.log(`Audio load started: ${currentAudioSrc}`)}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => {
          console.log(`Audio playback started: ${currentAudioSrc}`);
          setIsPlaying(true);
          // Store last successful audio source in localStorage
          try {
            localStorage.setItem('lastWorkingAudioSrc', currentAudioSrc);
          } catch (e) {
            console.error('Failed to save working audio source to localStorage:', e);
          }
        }}
        onPause={() => {
          console.log(`Audio playback paused: ${currentAudioSrc}`);
          setIsPlaying(false);
        }}
        onError={(e) => {
          console.error(`Audio error event triggered for ${currentAudioSrc}:`, e);
          console.error(`Audio error details:`, audioRef.current?.error);
          tryNextAudioSource();
        }}
      >
        {/* Add source elements as fallbacks */}
        <source src={audioSrc} type="audio/mpeg" />
        <source src={backupAudioSrc1} type="audio/mpeg" />
        <source src={backupAudioSrc2} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
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
