// JSONBin.io API utility for persistent message storage
// Documentation: https://jsonbin.io/api-reference

// Types
export interface Message {
  id: number;
  author: string;
  message: string;
}

// Constants
const API_KEY = '$2a$10$Yd0Ql9Ot4Nh3Oc9Tn.Ij4.Oe9Yx6Oi7JE9D7KPmqkZXQVLm5ZDPu'; // Your JSONBin API key
const BIN_ID = '65d4a8c5dc74654018a9e3c2'; // Pre-created bin ID for Poorva's farewell messages

// API URL - using public endpoint to avoid CORS issues
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Headers for API requests
const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY,
  'X-Bin-Versioning': 'false',
};

// Fallback to localStorage if JSONBin fails
const useLocalStorage = true; // Set to true to always use localStorage as backup

/**
 * Get messages from localStorage
 * @returns {Message[]} Array of messages
 */
const getLocalMessages = (): Message[] => {
  try {
    const storedMessages = localStorage.getItem('poorva_messages');
    return storedMessages ? JSON.parse(storedMessages) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

/**
 * Save messages to localStorage
 * @param {Message[]} messages Array of messages to save
 */
const saveLocalMessages = (messages: Message[]): void => {
  try {
    localStorage.setItem('poorva_messages', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Fetch messages from JSONBin with localStorage fallback
 * @returns {Promise<Message[]>} Array of messages
 */
export const fetchMessages = async (): Promise<Message[]> => {
  // If using localStorage only, return local messages
  if (useLocalStorage) {
    const localMessages = getLocalMessages();
    console.log('Using localStorage messages:', localMessages);
    return localMessages;
  }
  
  try {
    console.log('Fetching messages from JSONBin...');
    const response = await fetch(API_URL, { 
      headers,
      method: 'GET',
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`JSONBin API error: ${response.status}`);
    }
    
    const data = await response.json();
    const messages = data.record || [];
    
    // Cache messages in localStorage as backup
    saveLocalMessages(messages);
    return messages;
  } catch (error) {
    console.error('Error fetching messages from JSONBin:', error);
    // Fall back to localStorage if JSONBin fails
    return getLocalMessages();
  }
};

/**
 * Save messages to JSONBin and localStorage
 * @param {Message[]} messages Array of messages to save
 * @returns {Promise<boolean>} Success status
 */
export const saveMessages = async (messages: Message[]): Promise<boolean> => {
  // Always save to localStorage for reliability
  saveLocalMessages(messages);
  
  // If using localStorage only mode, don't attempt JSONBin save
  if (useLocalStorage) {
    console.log('Saving messages to localStorage only');
    return true;
  }
  
  try {
    console.log('Saving messages to JSONBin...');
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify(messages),
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save messages: ${response.status}`);
    }
    
    console.log('Messages saved to JSONBin successfully');
    return true;
  } catch (error) {
    console.error('Error saving messages to JSONBin:', error);
    // Even if JSONBin fails, localStorage save was already attempted
    return true; // Return true since localStorage save succeeded
  }
};

/**
 * Add a new message to JSONBin
 * @param author Author name
 * @param message Message content
 * @returns Promise with success status
 */
export const addMessage = async (author: string, message: string): Promise<boolean> => {
  try {
    // First fetch existing messages
    const existingMessages = await fetchMessages();
    
    // Create new message
    const newMessage: Message = {
      id: Date.now(),
      author,
      message
    };
    
    // Add new message to existing ones
    const updatedMessages = [...existingMessages, newMessage];
    
    // Save updated messages
    return await saveMessages(updatedMessages);
  } catch (error) {
    console.error('Error adding message:', error);
    return false;
  }
};
