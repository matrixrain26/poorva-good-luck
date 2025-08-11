// JSONBin.io API utility for persistent message storage
// Documentation: https://jsonbin.io/api-reference

// Types
export interface Message {
  id: number;
  author: string;
  message: string;
}

export interface PhotoMemory {
  id: string;
  url: string;
  caption: string;
  timestamp: number;
}

// Constants
const API_KEY = '$2a$10$Yd0Ql9Ot4Nh3Oc9Tn.Ij4.Oe9Yx6Oi7JE9D7KPmqkZXQVLm5ZDPu'; // Your JSONBin API key
const BASE_API_URL = 'https://api.jsonbin.io/v3';

// Debug flag - set to true to see detailed logs
const DEBUG = true;

// Headers for API requests
const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY,
  'X-Bin-Versioning': 'false',
};

// LocalStorage keys
const MESSAGES_BIN_ID_KEY = 'poorva_messages_bin_id';
const PHOTOS_BIN_ID_KEY = 'poorva_photos_bin_id';
const LOCAL_MESSAGES_KEY = 'poorva_messages';
const LOCAL_PHOTOS_KEY = 'poorva_photos';

// Helper functions for localStorage
const getLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveLocalData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Bin ID management
const getBinId = (type: 'messages' | 'photos'): string | null => {
  const key = type === 'messages' ? MESSAGES_BIN_ID_KEY : PHOTOS_BIN_ID_KEY;
  return localStorage.getItem(key);
};

const saveBinId = (type: 'messages' | 'photos', binId: string): void => {
  const key = type === 'messages' ? MESSAGES_BIN_ID_KEY : PHOTOS_BIN_ID_KEY;
  localStorage.setItem(key, binId);
};

// Message specific helpers
const getLocalMessages = (): Message[] => {
  return getLocalData<Message[]>(LOCAL_MESSAGES_KEY, []);
};

const saveLocalMessages = (messages: Message[]): void => {
  saveLocalData(LOCAL_MESSAGES_KEY, messages);
};

// Photo specific helpers
const getLocalPhotos = (): PhotoMemory[] => {
  return getLocalData<PhotoMemory[]>(LOCAL_PHOTOS_KEY, []);
};

const saveLocalPhotos = (photos: PhotoMemory[]): void => {
  saveLocalData(LOCAL_PHOTOS_KEY, photos);
};

/**
 * Fetch data from JSONBin with localStorage fallback
 * @param type Type of data to fetch ('messages' or 'photos')
 * @returns Promise with data array
 */
const fetchFromJsonBin = async <T>(type: 'messages' | 'photos'): Promise<T[]> => {
  // Get local data as fallback
  const localData = type === 'messages' 
    ? getLocalMessages() as unknown as T[]
    : getLocalPhotos() as unknown as T[];
  
  // Check if we have a bin ID
  const binId = getBinId(type);
  if (!binId) {
    if (DEBUG) console.log(`No JSONBin ID found for ${type}, using localStorage only`);
    return localData;
  }
  
  try {
    // Try to fetch from JSONBin
    if (DEBUG) console.log(`Fetching ${type} from JSONBin ID: ${binId}...`);
    
    const response = await fetch(`${BASE_API_URL}/b/${binId}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      console.error(`JSONBin API error for ${type}:`, response.status);
      // If bin not found, clear the stored bin ID
      if (response.status === 404) {
        localStorage.removeItem(type === 'messages' ? MESSAGES_BIN_ID_KEY : PHOTOS_BIN_ID_KEY);
      }
      return localData; // Fall back to localStorage
    }
    
    const data = await response.json();
    if (DEBUG) console.log(`JSONBin ${type} response:`, data);
    
    // Extract data from response
    const jsonBinData = data?.record?.[type] || [];
    
    if (Array.isArray(jsonBinData) && jsonBinData.length > 0) {
      // Save to localStorage for offline access
      if (type === 'messages') {
        saveLocalMessages(jsonBinData as unknown as Message[]);
      } else {
        saveLocalPhotos(jsonBinData as unknown as PhotoMemory[]);
      }
      return jsonBinData;
    }
    
    // If JSONBin has no data, use localStorage
    return localData;
  } catch (error) {
    console.error(`Error fetching ${type} from JSONBin:`, error);
    return localData; // Fall back to localStorage
  }
};

/**
 * Save data to JSONBin and localStorage
 * @param type Type of data to save ('messages' or 'photos')
 * @param data Data array to save
 * @returns Promise with success status
 */
const saveToJsonBin = async <T>(type: 'messages' | 'photos', data: T[]): Promise<boolean> => {
  if (DEBUG) console.log(`Saving ${type} to JSONBin and localStorage`);
  
  // Always save to localStorage first as a backup
  if (type === 'messages') {
    saveLocalMessages(data as unknown as Message[]);
  } else {
    saveLocalPhotos(data as unknown as PhotoMemory[]);
  }
  
  try {
    const binId = getBinId(type);
    let url = BASE_API_URL;
    let method = 'POST';
    let body = JSON.stringify({ [type]: data });
    
    if (binId) {
      // Update existing bin
      url = `${BASE_API_URL}/b/${binId}`;
      method = 'PUT';
      if (DEBUG) console.log(`Updating existing ${type} bin: ${binId}`);
    } else {
      // Create new bin
      url = `${BASE_API_URL}/b`;
      method = 'POST';
      if (DEBUG) console.log(`Creating new bin for ${type}`);
    }
    
    // Save to JSONBin
    const response = await fetch(url, {
      method,
      headers,
      body,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit' // Don't send cookies to avoid CORS issues
    });
    
    if (!response.ok) {
      console.error(`JSONBin API error for ${type}: ${response.status} ${response.statusText}`);
      throw new Error(`JSONBin API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    if (DEBUG) console.log(`JSONBin ${type} save response:`, responseData);
    
    // If we created a new bin, save the bin ID
    if (!binId && responseData.metadata && responseData.metadata.id) {
      saveBinId(type, responseData.metadata.id);
      if (DEBUG) console.log(`New ${type} bin created with ID: ${responseData.metadata.id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving ${type} to JSONBin:`, error);
    return false;
  }
};

/**
 * Fetch messages from JSONBin with localStorage fallback
 * @returns {Promise<Message[]>} Array of messages
 */
export const fetchMessages = async (): Promise<Message[]> => {
  return fetchFromJsonBin('messages');
};

/**
 * Save messages to JSONBin and localStorage
 * @param {Message[]} messages Array of messages to save
 * @returns {Promise<boolean>} Success status
 */
export const saveMessages = async (messages: Message[]): Promise<boolean> => {
  return saveToJsonBin('messages', messages);
};

/**
 * Add a new message to JSONBin
 * @param author Author name
 * @param message Message content
 * @returns Promise with success status
 */
export const addMessage = async (author: string, message: string): Promise<boolean> => {
  if (!author || !message) {
    console.error('Invalid message data:', { author, message });
    return false;
  }
  
  try {
    // Get existing messages
    const existingMessages = await fetchMessages();
    
    // Create new message
    const newMessage: Message = {
      id: Date.now(), // Use timestamp as ID
      author,
      message
    };
    
    // Add to messages array
    const updatedMessages = [...existingMessages, newMessage];
    
    // Save updated messages
    return await saveMessages(updatedMessages);
  } catch (error) {
    console.error('Error adding message:', error);
    return false;
  }
};

/**
 * Fetch photos from JSONBin with localStorage fallback
 * @returns {Promise<PhotoMemory[]>} Array of photos
 */
export const fetchPhotos = async (): Promise<PhotoMemory[]> => {
  return fetchFromJsonBin<PhotoMemory>('photos');
};

/**
 * Save photos to JSONBin and localStorage
 * @param {PhotoMemory[]} photos Array of photos to save
 * @returns {Promise<boolean>} Success status
 */
export const savePhotos = async (photos: PhotoMemory[]): Promise<boolean> => {
  return saveToJsonBin('photos', photos);
};

/**
 * Add a new photo memory to JSONBin
 * @param url Photo URL (Cloudinary)
 * @param caption Photo caption
 * @returns Promise with success status
 */
export const addPhoto = async (url: string, caption: string): Promise<boolean> => {
  if (!url) {
    console.error('Invalid photo data: missing URL');
    return false;
  }
  
  try {
    // Get existing photos
    const existingPhotos = await fetchPhotos();
    
    // Create new photo memory
    const newPhoto: PhotoMemory = {
      id: `photo_${Date.now()}`, // Use timestamp as ID with prefix
      url,
      caption: caption || '',
      timestamp: Date.now()
    };
    
    // Add to photos array
    const updatedPhotos = [...existingPhotos, newPhoto];
    
    // Save updated photos
    return await savePhotos(updatedPhotos);
  } catch (error) {
    console.error('Error adding photo:', error);
    return false;
  }
};

/**
 * Delete a photo by ID
 * @param id Photo ID to delete
 * @returns Promise with success status
 */
export const deletePhoto = async (id: string): Promise<boolean> => {
  try {
    // Get existing photos
    const existingPhotos = await fetchPhotos();
    
    // Filter out the photo to delete
    const updatedPhotos = existingPhotos.filter(photo => photo.id !== id);
    
    // If no photos were removed, return false
    if (updatedPhotos.length === existingPhotos.length) {
      console.error(`Photo with ID ${id} not found`);
      return false;
    }
    
    // Save updated photos
    return await savePhotos(updatedPhotos);
  } catch (error) {
    console.error(`Error deleting photo with ID ${id}:`, error);
    return false;
  }
};
