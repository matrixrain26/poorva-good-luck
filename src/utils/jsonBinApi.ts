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

// Default bin ID - hardcoded for reliability across browsers
// This is a pre-created bin specifically for Poorva's farewell app
const DEFAULT_BIN_ID = '65d4a8c5dc74654018a9e3c3';

// LocalStorage keys - only used for offline fallback
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
const getBinId = (_type: 'messages' | 'photos'): string => {
  // Always use the same bin ID for both types
  return DEFAULT_BIN_ID;
};

// No longer need to save bin IDs as they are hardcoded for reliability

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
  
  // Always use the default bin ID for reliability
  const binId = getBinId(type);
  
  try {
    // Try to fetch from JSONBin
    if (DEBUG) console.log(`Fetching ${type} from JSONBin ID: ${binId}...`);
    
    const response = await fetch(`${BASE_API_URL}/b/${binId}`, {
      method: 'GET',
      headers,
      mode: 'cors',
      cache: 'no-cache', // Always get fresh data
      credentials: 'omit' // Don't send cookies to avoid CORS issues
    });
    
    if (!response.ok) {
      console.error(`JSONBin API error for ${type}:`, response.status, response.statusText);
      console.log('Falling back to localStorage data');
      return localData; // Fall back to localStorage
    }
    
    const data = await response.json();
    if (DEBUG) console.log(`JSONBin response for ${type}:`, data);
    
    // Extract data from response - handle structured format
    let jsonBinData;
    
    if (data && data.record) {
      // Check if we have a structured format with both types
      if (data.record.messages && data.record.photos) {
        // Structured format with both types
        jsonBinData = type === 'messages' ? data.record.messages : data.record.photos;
      } else if (data.record[type] && Array.isArray(data.record[type])) {
        // Object with type key format
        jsonBinData = data.record[type];
      } else if (Array.isArray(data.record)) {
        // Direct array format - legacy support
        jsonBinData = data.record;
        console.warn('Using legacy array format from JSONBin - should migrate to structured format');
      } else {
        // Unknown format - initialize empty arrays
        console.warn(`Unknown JSONBin data format for ${type}:`, data.record);
        jsonBinData = [];
      }
    } else {
      jsonBinData = [];
    }
    
    if (DEBUG) console.log(`Parsed ${jsonBinData?.length || 0} items from JSONBin for ${type}`);
    
    if (Array.isArray(jsonBinData) && jsonBinData.length > 0) {
      // Validate data before using it
      let validData;
      
      if (type === 'photos') {
        validData = (jsonBinData as unknown as PhotoMemory[]).filter(photo => 
          photo && 
          typeof photo.id === 'string' && 
          typeof photo.url === 'string' && 
          photo.url.includes('cloudinary.com') // Ensure it's a Cloudinary URL
        );
        
        if (validData.length !== jsonBinData.length) {
          console.warn(`Filtered out ${jsonBinData.length - validData.length} invalid photos`);
        }
      } else {
        // For messages
        validData = (jsonBinData as unknown as Message[]).filter(msg => 
          msg && 
          typeof msg.id === 'number' && 
          typeof msg.author === 'string' && 
          typeof msg.message === 'string'
        );
        
        if (validData.length !== jsonBinData.length) {
          console.warn(`Filtered out ${jsonBinData.length - validData.length} invalid messages`);
        }
      }
      
      // Save to localStorage for offline access
      if (type === 'messages') {
        saveLocalMessages(validData as unknown as Message[]);
      } else {
        saveLocalPhotos(validData as unknown as PhotoMemory[]);
      }
      
      return validData as T[];
    }
    
    // If JSONBin has no data, use localStorage
    console.log(`No valid data found in JSONBin for ${type}, using localStorage`);
    return localData;
  } catch (error) {
    console.error(`Error fetching ${type} from JSONBin:`, error);
    console.log('Falling back to localStorage data due to error');
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
  // Always save to localStorage first as backup
  if (type === 'messages') {
    saveLocalMessages(data as unknown as Message[]);
  } else {
    saveLocalPhotos(data as unknown as PhotoMemory[]);
  }
  
  try {
    // Always use the default bin ID for reliability
    const binId = getBinId(type);
    
    // First, get the current bin data to preserve the other type's data
    const response = await fetch(`${BASE_API_URL}/b/${binId}`, {
      method: 'GET',
      headers,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit'
    });
    
    // Prepare structured data for JSONBin
    let binData: any = {};
    
    if (response.ok) {
      const currentData = await response.json();
      
      if (currentData && currentData.record) {
        // If we have existing structured data, preserve it
        if (typeof currentData.record === 'object' && !Array.isArray(currentData.record)) {
          binData = currentData.record;
        }
      }
    }
    
    // Update only the specific type's data in the structured format
    binData[type] = data;
    
    if (DEBUG) console.log(`Saving ${type} to JSONBin (${binId}) with structured format:`, binData);
    
    // Update the bin with our structured data
    const updateResponse = await fetch(`${BASE_API_URL}/b/${binId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(binData),
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit' // Don't send cookies to avoid CORS issues
    });
    
    if (!updateResponse.ok) {
      console.error(`Failed to update ${type} bin:`, updateResponse.status, updateResponse.statusText);
      return false;
    }
    
    const responseData = await updateResponse.json();
    if (DEBUG) console.log(`${type} saved successfully to JSONBin:`, responseData);
    
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
