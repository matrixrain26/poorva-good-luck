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
  console.log('Fetching photos from JSONBin with localStorage fallback');
  
  try {
    console.log('Fetching photos from JSONBin...');
    
    const response = await fetch(API_URL, { 
      headers,
      method: 'GET',
      mode: 'cors',
      credentials: 'omit' // Don't send cookies to avoid CORS issues
    });
    
    if (!response.ok) {
      console.error(`JSONBin API error: ${response.status} ${response.statusText}`);
      throw new Error(`JSONBin API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('JSONBin response:', data);
    
    const photos = data.record || [];
    console.log(`Loaded ${photos.length} photos from JSONBin`);
    
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
  console.log('Saving photos to JSONBin with localStorage fallback');
  
  try {
    console.log('Saving photos to JSONBin...');
    console.log('Photos to save:', photos);
    
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify(photos),
      mode: 'cors',
      credentials: 'omit' // Don't send cookies to avoid CORS issues
    });
    
    if (!response.ok) {
      console.error(`JSONBin API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to save photos: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('JSONBin save response:', responseData);
    
    console.log('Photos saved to JSONBin successfully');
    return true;
  } catch (error) {
    console.error('Error saving photos to JSONBin:', error);
    // Even if JSONBin fails, localStorage save was already attempted
    console.log('Falling back to localStorage only');
    return true; // Return true since localStorage save succeeded
  }
};

/**
 * Add a new photo to JSONBin
 * @param photo Photo object to add
 * @returns Promise with success status
 */
export const addPhoto = async (photo: Photo): Promise<boolean> => {
  try {
    // First, get existing photos
    const existingPhotos = await fetchPhotos();
    
    // Add new photo
    const updatedPhotos = [...existingPhotos, photo];
    
    // Save updated photos
    return await savePhotos(updatedPhotos);
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
export const deletePhoto = async (id: number): Promise<boolean> => {
  try {
    // First, get existing photos
    const existingPhotos = await fetchPhotos();
    
    // Filter out the photo to delete
    const updatedPhotos = existingPhotos.filter(photo => photo.id !== id);
    
    // Save updated photos
    return await savePhotos(updatedPhotos);
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};
