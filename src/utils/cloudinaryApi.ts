// Cloudinary API utility for persistent image storage
// This file handles the cross-browser persistence of image references
// The actual images are stored in Cloudinary, but we need to store the references in JSONBin

import { Photo } from '../components/Mosaic';

// Constants
const API_KEY = '$2a$10$Yd0Ql9Ot4Nh3Oc9Tn.Ij4.Oe9Yx6Oi7JE9D7KPmqkZXQVLm5ZDPu'; // Your JSONBin API key
const BIN_ID = '65d4a8c5dc74654018a9e3c3'; // Pre-created bin ID for Poorva's farewell images
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Headers for API requests
const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY,
  'X-Bin-Versioning': 'false',
};

// Debug flag - set to true to see detailed logs
const DEBUG = true;

/**
 * Get photos from localStorage
 * @returns {Photo[]} Array of photos
 */
const getLocalPhotos = (): Photo[] => {
  try {
    const storedPhotos = localStorage.getItem('userPhotos');
    return storedPhotos ? JSON.parse(storedPhotos) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

/**
 * Save photos to localStorage
 * @param {Photo[]} photos Array of photos to save
 */
const saveLocalPhotos = (photos: Photo[]): void => {
  try {
    localStorage.setItem('userPhotos', JSON.stringify(photos));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Fetch photos from JSONBin with localStorage fallback
 * @returns {Promise<Photo[]>} Array of photos
 */
export const fetchPhotos = async (): Promise<Photo[]> => {
  if (DEBUG) console.log('Fetching photos from JSONBin with localStorage fallback');
  
  try {
    if (DEBUG) console.log('Fetching photos from JSONBin...', API_URL);
    
    // Use no-cache to ensure we always get fresh data
    const response = await fetch(API_URL, { 
      headers,
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit' // Don't send cookies to avoid CORS issues
    });
    
    if (!response.ok) {
      console.error(`JSONBin API error: ${response.status} ${response.statusText}`);
      throw new Error(`JSONBin API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (DEBUG) console.log('JSONBin response:', data);
    
    // Ensure we're handling the data structure correctly
    if (!data || !data.record) {
      console.error('Invalid data structure from JSONBin:', data);
      throw new Error('Invalid data structure from JSONBin');
    }
    
    const photos = Array.isArray(data.record) ? data.record : [];
    if (DEBUG) console.log(`Loaded ${photos.length} photos from JSONBin`);
    
    // Cache photos in localStorage as backup
    saveLocalPhotos(photos);
    
    return photos;
  } catch (error) {
    console.error('Error fetching photos from JSONBin:', error);
    console.log('Falling back to localStorage');
    
    // Fallback to localStorage
    const localPhotos = getLocalPhotos();
    return localPhotos;
  }
};

/**
 * Save photos to JSONBin and localStorage
 * @param {Photo[]} photos Array of photos to save
 * @returns {Promise<boolean>} Success status
 */
export const savePhotos = async (photos: Photo[]): Promise<boolean> => {
  // Always save to localStorage for reliability
  saveLocalPhotos(photos);
  if (DEBUG) console.log('Saving photos to JSONBin with localStorage fallback');
  
  try {
    if (DEBUG) console.log('Saving photos to JSONBin...');
    if (DEBUG) console.log('Photos to save:', photos);
    
    // Validate photos array to avoid saving invalid data
    if (!Array.isArray(photos)) {
      console.error('Invalid photos data (not an array):', photos);
      throw new Error('Invalid photos data: not an array');
    }
    
    // Ensure each photo has required fields
    const validPhotos = photos.filter(photo => 
      photo && typeof photo === 'object' && 
      'id' in photo && 
      'src' in photo && 
      'alt' in photo && 
      'note' in photo
    );
    
    if (validPhotos.length !== photos.length) {
      console.warn(`Found ${photos.length - validPhotos.length} invalid photos, filtering them out`);
    }
    
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify(validPhotos),
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit' // Don't send cookies to avoid CORS issues
    });
    
    if (!response.ok) {
      console.error(`JSONBin API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to save photos: ${response.status}`);
    }
    
    const responseData = await response.json();
    if (DEBUG) console.log('JSONBin save response:', responseData);
    
    if (DEBUG) console.log('Photos saved to JSONBin successfully');
    return true;
  } catch (error) {
    console.error('Error saving photos to JSONBin:', error);
    // Even if JSONBin fails, localStorage save was already attempted
    console.log('Falling back to localStorage only');
    return false; // Return false to indicate JSONBin save failed
  }
};

/**
 * Add a new photo to JSONBin
 * @param photo Photo object to add
 * @returns Promise with success status
 */
export const addPhoto = async (photo: Photo): Promise<boolean> => {
  try {
    if (DEBUG) console.log('Adding photo to JSONBin:', photo);
    
    // Validate photo object
    if (!photo || typeof photo !== 'object' || 
        !('id' in photo) || !('src' in photo) || 
        !('alt' in photo) || !('note' in photo)) {
      console.error('Invalid photo object:', photo);
      return false;
    }
    
    // First, get existing photos
    const existingPhotos = await fetchPhotos();
    
    // Check if photo with same ID already exists
    const photoExists = existingPhotos.some(p => p.id === photo.id);
    if (photoExists) {
      console.warn(`Photo with ID ${photo.id} already exists, updating instead of adding`);
      const updatedPhotos = existingPhotos.map(p => p.id === photo.id ? photo : p);
      return await savePhotos(updatedPhotos);
    }
    
    // Add new photo
    const updatedPhotos = [...existingPhotos, photo];
    
    // Save updated photos
    const result = await savePhotos(updatedPhotos);
    if (DEBUG) console.log(`Photo ${result ? 'successfully' : 'failed to'} add to JSONBin`);
    return result;
  } catch (error) {
    console.error('Error adding photo:', error);
    return false;
  }
};

/**
 * Delete a photo from JSONBin
 * @param id Photo ID to delete
 * @returns Promise with success status
 */
export const deletePhoto = async (id: string): Promise<boolean> => {
  try {
    if (DEBUG) console.log(`Deleting photo with ID ${id} from JSONBin`);
    
    // First, get existing photos
    const existingPhotos = await fetchPhotos();
    
    // Check if photo exists
    const photoExists = existingPhotos.some(p => p.id === id);
    if (!photoExists) {
      console.warn(`Photo with ID ${id} not found, nothing to delete`);
      return true; // Nothing to delete, so technically successful
    }
    
    // Filter out the photo to delete
    const updatedPhotos = existingPhotos.filter(photo => photo.id !== id);
    
    // Save updated photos
    const result = await savePhotos(updatedPhotos);
    if (DEBUG) console.log(`Photo ${result ? 'successfully' : 'failed to'} delete from JSONBin`);
    return result;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};
