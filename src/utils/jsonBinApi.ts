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

// API URL
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Headers for API requests
const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY,
  'X-Bin-Versioning': 'false'
};

/**
 * Fetch messages from JSONBin
 * @returns Promise with array of messages
 */
export const fetchMessages = async (): Promise<Message[]> => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }
    
    const data = await response.json();
    return data.record.messages || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Save messages to JSONBin
 * @param messages Array of messages to save
 * @returns Promise with success status
 */
export const saveMessages = async (messages: Message[]): Promise<boolean> => {
  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ messages })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save messages: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving messages:', error);
    return false;
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
