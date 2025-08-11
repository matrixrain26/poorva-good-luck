import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { messages as initialMessages, defaultNewMessage } from '../data/content';
import { fetchMessages, addMessage, Message as MessageType } from '../utils/jsonBinApi';

// Message dialog component
const AddMessageDialog = ({ isOpen, onClose, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (author: string, message: string) => void;
}) => {
  const [author, setAuthor] = useState(defaultNewMessage.author);
  const [message, setMessage] = useState(defaultNewMessage.message);

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setAuthor('');
      setMessage('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (author.trim() && message.trim()) {
      onSave(author, message);
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
        aria-labelledby="message-dialog-title"
      >
        <h2 id="message-dialog-title" className="text-2xl font-bold mb-4">Add Your Message</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="message-author" className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              id="message-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="message-text" className="block text-sm font-medium mb-1">Your Message</label>
            <textarea
              id="message-text"
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
              Add Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Messages = () => {
  // State for messages
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  // Load messages from JSONBin on component mount
  useEffect(() => {
    const loadMessagesFromJsonBin = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching messages from JSONBin...');
        // Attempt to fetch from JSONBin with multiple retries
        let retries = 0;
        let jsonBinMessages: MessageType[] = [];
        
        while (retries < 3) {
          try {
            jsonBinMessages = await fetchMessages();
            console.log(`Loaded ${jsonBinMessages.length} messages from JSONBin on attempt ${retries + 1}`);
            break; // Success, exit retry loop
          } catch (fetchError) {
            retries++;
            console.warn(`JSONBin fetch attempt ${retries} failed:`, fetchError);
            if (retries >= 3) throw fetchError; // Re-throw after max retries
            await new Promise(r => setTimeout(r, 1000)); // Wait before retry
          }
        }
        
        // Validate messages before using them
        const validMessages = jsonBinMessages.filter(msg => {
          const isValid = 
            msg && 
            typeof msg.id === 'number' && 
            typeof msg.author === 'string' && 
            typeof msg.message === 'string' && 
            msg.author.trim() !== '' && 
            msg.message.trim() !== '';
            
          if (!isValid) {
            console.warn('Found invalid message:', msg);
          }
          return isValid;
        });
        
        if (validMessages.length !== jsonBinMessages.length) {
          console.warn(`Filtered out ${jsonBinMessages.length - validMessages.length} invalid messages`);
        }
        
        if (validMessages.length > 0) {
          // Sort messages by ID (timestamp) for consistency
          const sortedMessages = [...validMessages].sort((a, b) => a.id - b.id);
          
          // Combine initial messages with JSONBin messages
          setMessages([...initialMessages, ...sortedMessages]);
          // Also save to localStorage as backup
          localStorage.setItem('guestMessages', JSON.stringify(sortedMessages));
          console.log(`Successfully loaded and processed ${sortedMessages.length} messages from JSONBin`);
        } else {
          console.log('No valid messages found in JSONBin');
        }
      } catch (error) {
        console.error('Error loading messages from JSONBin after retries:', error);
        // Fallback to localStorage if JSONBin fails
        try {
          const savedMessages = JSON.parse(localStorage.getItem('guestMessages') || '[]');
          if (savedMessages.length > 0) {
            console.log(`Falling back to ${savedMessages.length} messages from localStorage`);
            // Validate localStorage messages too
            const validLocalMessages = savedMessages.filter((msg: any) => 
              msg && 
              typeof msg.id === 'number' && 
              typeof msg.author === 'string' && 
              typeof msg.message === 'string' && 
              msg.author.trim() !== '' && 
              msg.message.trim() !== ''
            );
            
            if (validLocalMessages.length > 0) {
              // Sort messages by ID (timestamp) for consistency
              const sortedMessages = [...validLocalMessages].sort((a, b) => a.id - b.id);
              setMessages([...initialMessages, ...sortedMessages]);
            }
          }
        } catch (localError) {
          console.error('Error loading messages from localStorage:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessagesFromJsonBin();
    
    // Listen for the custom event from Hero component
    const handleOpenMessageDialog = () => {
      setIsDialogOpen(true);
    };
    
    console.log('Adding event listener for open-message-dialog');
    window.addEventListener('open-message-dialog', handleOpenMessageDialog);
    
    return () => {
      console.log('Removing event listener for open-message-dialog');
      window.removeEventListener('open-message-dialog', handleOpenMessageDialog);
    };
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && messages.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, messages.length]);

  // Handle next/prev navigation
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    resetAutoPlay();
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + messages.length) % messages.length);
    resetAutoPlay();
  };

  // Go to a specific message by index
  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    resetAutoPlay();
  };

  // Reset the auto-play timer
  const resetAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (isPlaying && messages.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 4000);
    }
  };

  // Shuffle messages
  const shuffleMessages = () => {
    const shuffled = [...messages].sort(() => Math.random() - 0.5);
    setMessages(shuffled);
    setCurrentIndex(0);
    resetAutoPlay();
  };

  // Add a new message
  const handleAddMessage = async (author: string, message: string) => {
    if (!author.trim() || !message.trim()) return;
    
    setIsLoading(true);
    
    const newMessage = {
      id: Date.now(),
      author: author.trim(),
      message: message.trim()
    };
    
    // Add to state immediately for UI responsiveness
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Save to JSONBin first (most reliable for cross-browser persistence)
    try {
      console.log('Saving new message to JSONBin:', { author, message });
      const success = await addMessage(author.trim(), message.trim());
      
      if (success) {
        console.log('Message saved successfully to JSONBin');
        // After successful JSONBin save, refresh messages from JSONBin
        // This ensures we have the latest shared data
        try {
          console.log('Refreshing messages from JSONBin after successful save');
          const jsonBinMessages = await fetchMessages();
          
          // Validate messages before using them
          const validMessages = jsonBinMessages.filter(msg => 
            msg && 
            typeof msg.id === 'number' && 
            typeof msg.author === 'string' && 
            typeof msg.message === 'string'
          );
          
          if (validMessages.length > 0) {
            // Combine initial messages with JSONBin messages
            setMessages([...initialMessages, ...validMessages]);
            // Also save to localStorage as backup
            localStorage.setItem('guestMessages', JSON.stringify(validMessages));
          }
        } catch (refreshError) {
          console.error('Error refreshing messages from JSONBin:', refreshError);
        }
      } else {
        console.error('Failed to save message to JSONBin');
        // Fallback to localStorage only if JSONBin fails
        saveToLocalStorage(updatedMessages);
      }
    } catch (error) {
      console.error('Error saving to JSONBin:', error);
      // Fallback to localStorage only if JSONBin fails
      saveToLocalStorage(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to save messages to localStorage
  const saveToLocalStorage = (updatedMessages: MessageType[]) => {
    try {
      const userMessages = updatedMessages.filter(msg => !initialMessages.some(initial => initial.id === msg.id));
      localStorage.setItem('guestMessages', JSON.stringify(userMessages));
      console.log(`Saved ${userMessages.length} messages to localStorage as backup`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div 
        className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg relative"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        onFocus={() => setIsPlaying(false)}
        onBlur={() => setIsPlaying(true)}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-zinc-300">Loading messages...</p>
            </div>
          </div>
        )}
        <div className="min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p className="text-lg md:text-xl mb-4">"{messages[currentIndex].message}"</p>
              <p className="text-sm text-zinc-400">— {messages[currentIndex].author}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation controls */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goToPrev}
            className="p-2 rounded-full hover:bg-white/10 transition"
            aria-label="Previous message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="flex gap-2">
            {messages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
                aria-label={`Go to message ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="p-2 rounded-full hover:bg-white/10 transition"
            aria-label="Next message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={shuffleMessages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            aria-label="Shuffle messages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
            Shuffle
          </button>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 transition"
            aria-label="Add your message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Your Message
          </button>
        </div>
      </div>

      <AddMessageDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleAddMessage}
      />
    </div>
  );
};

export default Messages;
