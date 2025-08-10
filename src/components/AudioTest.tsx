import { useState, useEffect } from 'react';
import { audioSrc, backupAudioSrc1, backupAudioSrc2 } from '../data/content';

// Audio formats to try
const AUDIO_FORMATS = ['mp3', 'ogg', 'wav'];

const AudioTest = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentSource, setCurrentSource] = useState('');
  const [playbackStatus, setPlaybackStatus] = useState('Not started');
  
  // Add a log message
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().substr(11, 8)}: ${message}`]);
  };
  
  // Test audio sources
  const audioSources = [
    { name: 'Primary Source', url: audioSrc },
    { name: 'Backup Source 1', url: backupAudioSrc1 },
    { name: 'Backup Source 2', url: backupAudioSrc2 },
    // Add direct URLs to test
    { name: 'Direct MP3', url: audioSrc.replace(/\.(ogg|wav)$/i, '.mp3') },
    { name: 'Direct OGG', url: audioSrc.replace(/\.(mp3|wav)$/i, '.ogg') },
    { name: 'Direct WAV', url: audioSrc.replace(/\.(mp3|ogg)$/i, '.wav') },
    // Add Cloudinary URLs with different delivery types
    { name: 'Cloudinary MP3', url: audioSrc.includes('cloudinary.com') ? 
      audioSrc.replace(/\/(upload|video)\//, '/upload/q_auto/') : audioSrc },
    { name: 'Cloudinary Streaming', url: audioSrc.includes('cloudinary.com') ? 
      audioSrc.replace(/\/(upload|video)\//, '/video/streaming/') : audioSrc }
  ];

  // Test a specific audio source with different formats
  const testAudioSourceWithFormats = (source: { name: string, url: string }) => {
    // Test original format
    testAudioSource(source);
    
    // Test with different formats if not already format-specific
    if (!source.name.includes('Direct')) {
      AUDIO_FORMATS.forEach(format => {
        const formatUrl = source.url.replace(/\.(mp3|ogg|wav)$/i, `.${format}`);
        if (formatUrl !== source.url) {
          setTimeout(() => {
            testAudioSource({ 
              name: `${source.name} (${format})`, 
              url: formatUrl 
            });
          }, 3000); // Delay to avoid overlapping tests
        }
      });
    }
  };
  
  // Test a specific audio source
  const testAudioSource = (source: { name: string, url: string }) => {
    addLog(`Testing ${source.name}: ${source.url}`);
    setCurrentSource(source.url);
    setPlaybackStatus('Loading...');
    
    const audio = new Audio(source.url);
    
    audio.onloadstart = () => {
      addLog(`${source.name}: Load started`);
    };
    
    audio.oncanplay = () => {
      addLog(`${source.name}: Can play`);
      setPlaybackStatus('Ready to play');
      
      // Try to play
      audio.play().then(() => {
        addLog(`${source.name}: Playback started successfully`);
        setPlaybackStatus('Playing');
        
        // Stop after 2 seconds
        setTimeout(() => {
          audio.pause();
          addLog(`${source.name}: Playback stopped after test`);
          setPlaybackStatus('Test complete');
        }, 2000);
        
      }).catch(error => {
        addLog(`${source.name}: Playback failed - ${error.message}`);
        setPlaybackStatus(`Failed: ${error.message}`);
      });
    };
    
    audio.onerror = () => {
      const errorCode = audio.error ? audio.error.code : 'unknown';
      const errorMessage = audio.error ? audio.error.message : 'unknown error';
      addLog(`${source.name}: Error loading - Code: ${errorCode}, Message: ${errorMessage}`);
      setPlaybackStatus(`Error: ${errorMessage}`);
    };
  };
  
  // Check browser audio support
  useEffect(() => {
    addLog('Audio Test Page Loaded');
    
    // Check audio format support
    const audio = document.createElement('audio');
    addLog(`Browser can play MP3: ${audio.canPlayType('audio/mpeg') || 'no'}`);
    addLog(`Browser can play OGG: ${audio.canPlayType('audio/ogg; codecs="vorbis"') || 'no'}`);
    addLog(`Browser can play WAV: ${audio.canPlayType('audio/wav') || 'no'}`);
    
    // Check if AudioContext is supported
    if (window.AudioContext || (window as any).webkitAudioContext) {
      addLog('AudioContext is supported');
    } else {
      addLog('AudioContext is NOT supported');
    }
    
    // Check if autoplay is allowed
    const autoplayTest = document.createElement('audio');
    autoplayTest.src = 'data:audio/mpeg;base64,/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    autoplayTest.volume = 0.01;
    
    const autoplayPromise = autoplayTest.play();
    if (autoplayPromise) {
      autoplayPromise
        .then(() => {
          addLog('Autoplay is allowed');
          autoplayTest.pause();
        })
        .catch(error => {
          addLog(`Autoplay is blocked: ${error.message}`);
        });
    } else {
      addLog('Autoplay test inconclusive');
    }
    
    // Check CORS settings
    addLog('Checking CORS settings...');
    fetch(audioSrc, { method: 'HEAD' })
      .then(response => {
        addLog(`CORS check for primary source: ${response.status} ${response.statusText}`);
        const corsHeaders = response.headers.get('access-control-allow-origin');
        addLog(`CORS headers: ${corsHeaders || 'none'}`);
      })
      .catch(error => {
        addLog(`CORS check failed: ${error.message}`);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white/5 rounded-lg border border-white/10">
      <h2 className="text-2xl font-bold mb-4">Audio Playback Test</h2>
      
      <div className="mb-6">
        <h3 className="text-xl mb-2">Test Audio Sources</h3>
        <div className="flex flex-wrap gap-2">
          {audioSources.map((source, index) => (
            <button
              key={index}
              onClick={() => testAudioSourceWithFormats(source)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm"
            >
              {source.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl mb-2">Current Test</h3>
        <div className="bg-white/5 p-3 rounded">
          <p><strong>Source:</strong> {currentSource || 'None selected'}</p>
          <p><strong>Status:</strong> {playbackStatus}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl mb-2">Debug Logs</h3>
        <div className="bg-black/50 p-3 rounded h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioTest;
