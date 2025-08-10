import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import Mosaic from './components/Mosaic';
import Messages from './components/Messages';
import AudioPlayer from './components/AudioPlayer';
import AudioTest from './components/AudioTest';
import { recipientName } from './data/content';

function App() {
  // Track whether we should show animations (respect prefers-reduced-motion)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Check if we should show the audio test page
  const [showAudioTest, setShowAudioTest] = useState(false);

  // Check user's motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // Check URL parameters for debug mode
  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const debugAudio = urlParams.get('debugAudio');
    
    // Show audio test page if debugAudio parameter is present
    if (debugAudio === 'true') {
      console.log('Audio debug mode activated');
      setShowAudioTest(true);
    }
  }, []);

  // If in audio debug mode, only show the AudioTest component
  if (showAudioTest) {
    return (
      <div className="min-h-screen text-zinc-100 p-6 bg-background">
        <div className="mb-6">
          <button 
            onClick={() => setShowAudioTest(false)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded"
          >
            Return to Main Page
          </button>
        </div>
        <AudioTest />
      </div>
    );
  }
  
  // Otherwise show the normal app
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
      className="min-h-screen text-zinc-100"
    >
      <header>
        <h1 className="sr-only">Good Luck, {recipientName}!</h1>
      </header>

      <main className="flex flex-col gap-16 md:gap-24">
        <section id="hero" className="min-h-[90vh] flex items-center justify-center">
          <Hero />
        </section>

        <section id="photos" className="py-10">
          <h2 className="text-3xl font-bold mb-8">Photo Memories</h2>
          <Mosaic />
        </section>

        <section id="messages" className="py-10">
          <h2 className="text-3xl font-bold mb-8">Messages</h2>
          <Messages />
        </section>
        
        <section id="countdown" className="py-10">
          <Countdown />
        </section>
      </main>

      <footer className="mt-16 py-6 opacity-80 text-sm">
        <p>Created with love for {recipientName}'s MS journey</p>
      </footer>

      <div className="fixed bottom-6 right-6 z-50">
        <AudioPlayer />
      </div>
    </motion.div>
  );
}

export default App;
