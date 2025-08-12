import { useState } from 'react';
import { motion } from 'framer-motion';
import { recipientName } from '../data/content';

// Dialog component for leaving a message
const MessageDialog = ({ isOpen, onClose, onSave }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (author: string, message: string) => void;
}) => {
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (author.trim() && message.trim()) {
      onSave(author, message);
      setAuthor('');
      setMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-background border border-white/10 rounded-2xl p-6 w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <h2 id="dialog-title" className="text-2xl font-bold mb-4">Leave a Message</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="author" className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-1">Your Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 transition"
            >
              Save Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Hero = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // Photo memory dialog trigger removed as the button was removed

  // Function to toggle audio play state (will be connected to AudioPlayer component)
  const toggleAudio = () => {
    // This will be connected to the AudioPlayer component via a context or prop drilling
    setIsAudioPlaying(!isAudioPlaying);
    
    // Dispatch a custom event that AudioPlayer will listen for
    const event = new CustomEvent('toggle-audio');
    window.dispatchEvent(event);
  };

  // Function to save a new message
  const saveMessage = (author: string, message: string) => {
    const newMessage = { id: Date.now(), author, message };
    const existingMessages = JSON.parse(localStorage.getItem('guestMessages') || '[]');
    localStorage.setItem('guestMessages', JSON.stringify([...existingMessages, newMessage]));
  };

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-transparent bg-clip-text animate-gradient-x mb-2">
        <h1 className="text-5xl md:text-7xl font-bold">
          Good luck, {recipientName}!
        </h1>
      </div>
      
      <p className="text-xl md:text-2xl text-zinc-300 mt-4 mb-8">
        We're cheering for you on this exciting new chapter of your life
      </p>
      
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <button
          onClick={toggleAudio}
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/20 flex items-center gap-2"
          aria-label={isAudioPlaying ? "Pause music" : "Play music"}
        >
          {isAudioPlaying ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              Pause Music
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Play Music
            </>
          )}
        </button>
        
        {/* Message and memory buttons removed as requested */}
      </div>
      
      <MessageDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        onSave={saveMessage}
      />
    </motion.div>
  );
};

export default Hero;
