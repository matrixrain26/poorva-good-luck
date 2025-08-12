import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { photos as initialPhotos } from '../data/content';
import { fetchPhotos, addPhoto, deletePhoto } from '../utils/jsonBinApi';

// Declare Cloudinary types
declare global {
  interface Window {
    cloudinary: any;
  }
}

// Photo tile component with hover/focus overlay
const PhotoTile = ({ 
  photo, 
  isUserUploaded = false, 
  onDelete 
}: { 
  photo: Photo; 
  isUserUploaded?: boolean; 
  onDelete?: (id: string) => void;
}) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);
  
  // Toggle overlay visibility on Enter key
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOverlayVisible(!isOverlayVisible);
    }
  };

  // Handle delete button click
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(photo.id);
    }
  };

  return (
    <motion.div
      ref={tileRef}
      className="relative rounded-xl overflow-hidden aspect-square cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsOverlayVisible(true)}
      onMouseLeave={() => setIsOverlayVisible(false)}
      onFocus={() => setIsOverlayVisible(true)}
      onBlur={() => setIsOverlayVisible(false)}
      aria-label={`Photo: ${photo.alt}. Press Enter to toggle note.`}
    >
      <img 
        src={photo.src} 
        alt={photo.alt} 
        className="w-full h-full object-cover"
      />
      
      <AnimatePresence>
        {isOverlayVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-white text-sm md:text-base">{photo.note}</p>
              
              {isUserUploaded && onDelete && (
                <button
                  onClick={handleDelete}
                  className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors"
                  aria-label="Delete this photo"
                >
                  Delete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Type for photos (both initial and user-uploaded)
export interface Photo {
  id: string;
  src: string;
  alt: string;
  note: string;
  timestamp?: number;
};

const Mosaic = () => {
  const [photos, setPhotos] = useState(initialPhotos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoAlt, setPhotoAlt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load user photos from JSONBin (with localStorage fallback) on component mount
  useEffect(() => {
    console.log('Mosaic component mounted, loading user photos');
    
    const loadPhotos = async () => {
      try {
        // Attempt to fetch from JSONBin with multiple retries
        let retries = 0;
        let jsonBinPhotos: any[] = [];
        
        while (retries < 3) {
          try {
            // Fetch photos from JSONBin (with localStorage fallback)
            jsonBinPhotos = await fetchPhotos();
            console.log(`Loaded ${jsonBinPhotos.length} user photos from JSONBin on attempt ${retries + 1}`);
            break; // Success, exit retry loop
          } catch (fetchError) {
            retries++;
            console.warn(`JSONBin fetch attempt ${retries} failed:`, fetchError);
            if (retries >= 3) throw fetchError; // Re-throw after max retries
            await new Promise(r => setTimeout(r, 1000)); // Wait before retry
          }
        }
        
        // Convert JSONBin PhotoMemory objects to our Photo format
        const userPhotos = jsonBinPhotos.map(photo => ({
          id: photo.id,
          src: photo.url,
          alt: photo.caption || 'User uploaded photo',
          note: photo.caption || 'Memory with Poorva',
          timestamp: photo.timestamp
        }));
        
        // Validate user photos before using them
        const validUserPhotos = userPhotos.filter(photo => {
          const isValid = 
            photo && 
            typeof photo.id === 'string' && 
            typeof photo.src === 'string' && 
            photo.src.includes('cloudinary.com') && // Ensure it's a Cloudinary URL
            typeof photo.alt === 'string' && 
            typeof photo.note === 'string';
            
          if (!isValid) {
            console.warn('Found invalid photo:', photo);
            if (photo && !photo.src.includes('cloudinary.com')) {
              console.warn('Skipping non-Cloudinary image for reliability');
            }
          }
          return isValid;
        });
        
        if (validUserPhotos.length !== userPhotos.length) {
          console.warn(`Filtered out ${userPhotos.length - validUserPhotos.length} invalid photos`);
        }
        
        if (validUserPhotos.length > 0) {
          console.log(`Successfully loaded and processed ${validUserPhotos.length} photos from JSONBin`);
          // Combine initial photos with user photos
          setPhotos([...initialPhotos, ...validUserPhotos]);
        } else {
          console.log('No valid user photos found in JSONBin');
          setPhotos(initialPhotos);
        }
      } catch (error) {
        console.error('Error loading photos after retries:', error);
        // Fallback to initial photos only if everything fails
        setPhotos(initialPhotos);
      }
    };
    
    loadPhotos();
    
    // Listen for the custom event from Hero component
    const handleOpenPhotoDialog = () => {
      setIsDialogOpen(true);
    };
    
    console.log('Adding event listener for open-photo-dialog');
    window.addEventListener('open-photo-dialog', handleOpenPhotoDialog);
    
    return () => {
      console.log('Removing event listener for open-photo-dialog');
      window.removeEventListener('open-photo-dialog', handleOpenPhotoDialog);
    };
  }, []);

  // Store the widget instance as a ref to avoid recreating it on each click
  const cloudinaryWidgetRef = useRef<any>(null);
  
  // Initialize Cloudinary widget once on component mount
  useEffect(() => {
    // Only initialize if window.cloudinary is available and widget isn't already created
    if (window.cloudinary && !cloudinaryWidgetRef.current) {
      console.log('Initializing Cloudinary widget on mount');
      
      cloudinaryWidgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: 'dn29d1f9i',
          uploadPreset: 'poorva_memories',
          folder: 'user_memories',
          sources: ['local', 'camera', 'url'],
          multiple: false,
          cropping: false,
          showAdvancedOptions: false,
          maxFileSize: 5000000, // 5MB
          styles: {
            palette: {
              window: '#1e1e1e',
              windowBorder: '#4b5563',
              tabIcon: '#8b5cf6',
              menuIcons: '#8b5cf6',
              textDark: '#f9fafb',
              textLight: '#1e1e1e',
              link: '#8b5cf6',
              action: '#8b5cf6',
              inactiveTabIcon: '#6b7280',
              error: '#ef4444',
              inProgress: '#8b5cf6',
              complete: '#10b981',
              sourceBg: '#2d3748'
            }
          },
          // Add these options to improve button responsiveness
          buttonClass: 'cloudinary-button',
          buttonCaption: 'Browse Files',
          preBatch: (cb: any, data: any) => {
            console.log('Pre-batch processing', data);
            return cb(data);
          }
        },
        (error: any, result: any) => {
          // Widget callback handler is defined outside openCloudinaryWidget
          // to ensure it's not recreated each time
          handleCloudinaryResult(error, result);
        }
      );
    }
    
    // Cleanup function to close widget if component unmounts
    return () => {
      if (cloudinaryWidgetRef.current) {
        try {
          cloudinaryWidgetRef.current.close();
        } catch (e) {
          console.error('Error closing Cloudinary widget:', e);
        }
      }
    };
  }, []);
  
  // Handler for Cloudinary widget results
  const handleCloudinaryResult = (error: any, result: any) => {
    if (error) {
      console.error('Cloudinary upload error:', error);
      alert('There was an error uploading your image. Please try again.');
      return;
    }
    
    // Log all widget events to help with debugging
    console.log('Cloudinary widget event:', result?.event, result);
    
    if (result && result.event === 'success') {
      // On successful upload
      console.log('Cloudinary upload success:', result.info);
      try {
        // Store Cloudinary response in localStorage for debugging
        localStorage.setItem('lastCloudinaryUpload', JSON.stringify({
          timestamp: new Date().toISOString(),
          url: result.info.secure_url,
          filename: result.info.original_filename
        }));
        
        // Set state and automatically submit the form after successful upload
        setSelectedFile({ name: result.info.original_filename } as File);
        setPreviewUrl(result.info.secure_url);
        
        // Auto-populate caption and alt text if they're empty
        if (!photoCaption) {
          setPhotoCaption('Memory with Poorva');
        }
        
        if (!photoAlt) {
          setPhotoAlt(result.info.original_filename || 'Photo memory with Poorva');
        }
        
        // Close the widget explicitly
        if (cloudinaryWidgetRef.current) {
          cloudinaryWidgetRef.current.close();
        }
        
        // Add a slight delay before auto-submitting to ensure state updates
        setTimeout(async () => {
          // Get photo details
          const photoUrl = result.info.secure_url;
          const caption = photoCaption || result.info.original_filename || 'Memory with Poorva';
          
          console.log('Auto-creating new photo with URL:', photoUrl, 'and caption:', caption);
          
          try {
            // Generate a unique ID for the photo
            const uniqueId = `photo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            
            // Save to JSONBin via jsonBinApi
            console.log('Saving new photo to JSONBin');
            const success = await addPhoto(photoUrl, caption);
            
            // Create a local photo object for state update
            const newPhoto: Photo = {
              id: uniqueId,
              src: photoUrl,
              alt: photoAlt || result.info.original_filename || 'Photo memory with Poorva',
              note: caption,
              timestamp: Date.now()
            };
            
            if (success) {
              console.log('Photo saved successfully to JSONBin');
              
              // After successful JSONBin save, refresh photos from JSONBin
              // This ensures we have the latest shared data
              try {
                console.log('Refreshing photos from JSONBin after successful save');
                const jsonBinPhotos = await fetchPhotos();
                
                // Convert JSONBin PhotoMemory objects to our Photo format
                const userPhotos = jsonBinPhotos.map(photo => ({
                  id: photo.id,
                  src: photo.url,
                  alt: photo.caption || 'User uploaded photo',
                  note: photo.caption || 'Memory with Poorva',
                  timestamp: photo.timestamp
                }));
                
                // Validate user photos before using them
                const validUserPhotos = userPhotos.filter(photo => {
                  const isValid = 
                    photo && 
                    typeof photo.id === 'string' && 
                    typeof photo.src === 'string' && 
                    photo.src.includes('cloudinary.com') && // Ensure it's a Cloudinary URL
                    typeof photo.alt === 'string' && 
                    typeof photo.note === 'string';
                    
                  return isValid;
                });
                
                // Combine initial photos with user photos
                setPhotos([...initialPhotos, ...validUserPhotos]);
              } catch (refreshError) {
                console.error('Error refreshing photos from JSONBin:', refreshError);
                // Still add the new photo to local state if refresh fails
                const updatedPhotos = [...photos, newPhoto];
                setPhotos(updatedPhotos);
              }
            } else {
              console.error('Failed to save photo to JSONBin');
              // Still add to local state even if JSONBin fails
              const updatedPhotos = [...photos, newPhoto];
              setPhotos(updatedPhotos);
            }
          } catch (saveError) {
            console.error('Error saving to JSONBin after upload:', saveError);
            // Still add to local state even if JSONBin fails completely
            const newPhoto: Photo = {
              id: `photo_${Date.now()}_fallback`,
              src: photoUrl,
              alt: photoAlt || result.info.original_filename || 'Photo memory with Poorva',
              note: caption,
              timestamp: Date.now()
            };
            const updatedPhotos = [...photos, newPhoto];
            setPhotos(updatedPhotos);
          }
          
          // Reset form and close dialog
          setSelectedFile(null);
          setPreviewUrl(null);
          setPhotoCaption('');
          setPhotoAlt('');
          setIsDialogOpen(false);
        }, 500);
      } catch (err) {
        console.error('Error processing Cloudinary success:', err);
        // Still try to set the state even if JSONBin fails
        setSelectedFile({ name: result.info.original_filename } as File);
        setPreviewUrl(result.info.secure_url);
      }
    } else if (result && result.event === 'close') {
      console.log('Cloudinary widget closed by user');
    } else if (result && result.event === 'error') {
      console.error('Cloudinary widget error:', result);
      alert('There was an error with the upload widget. Please try again later.');
    }
  };
  
  // Open Cloudinary Upload Widget
  const openCloudinaryWidget = () => {
    console.log('Attempting to open Cloudinary widget');
    
    // Check if Cloudinary is loaded and widget is initialized
    if (!window.cloudinary || !cloudinaryWidgetRef.current) {
      console.error('Cloudinary widget not loaded or not initialized');
      alert('Image upload service is not available. Please try again later.');
      
      // Try to reload the script dynamically if needed
      if (!window.cloudinary) {
        const script = document.createElement('script');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.type = 'text/javascript';
        script.onload = () => {
          console.log('Cloudinary script loaded dynamically');
          setTimeout(() => {
            if (window.cloudinary) {
              // Initialize widget after script loads
              cloudinaryWidgetRef.current = window.cloudinary.createUploadWidget(
                {
                  cloudName: 'dn29d1f9i',
                  uploadPreset: 'poorva_memories',
                  folder: 'user_memories',
                  sources: ['local', 'camera', 'url'],
                  multiple: false,
                  cropping: false,
                  showAdvancedOptions: false,
                  maxFileSize: 5000000,
                  buttonClass: 'cloudinary-button',
                  buttonCaption: 'Browse Files',
                },
                handleCloudinaryResult
              );
              
              console.log('Cloudinary available after dynamic load, opening widget');
              cloudinaryWidgetRef.current.open();
            }
          }, 1000);
        };
        script.onerror = (e) => {
          console.error('Failed to load Cloudinary script dynamically:', e);
          alert('Could not connect to image upload service. Please check your internet connection and try again.');
        };
        document.head.appendChild(script);
        return;
      }
      return;
    }
    
    console.log('Opening existing Cloudinary widget instance');
    // Open the existing widget instance
    cloudinaryWidgetRef.current.open();
  };
  
  // Handle file selection (now just opens Cloudinary widget)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    openCloudinaryWidget();
  };

  // Handle delete photo
  const handleDeletePhoto = async (id: string) => {
    // Only allow deleting user-uploaded photos
    if (initialPhotos.some(p => p.id === id)) {
      console.log('Cannot delete initial photos');
      return;
    }
    
    try {
      // Delete from JSONBin
      await deletePhoto(id);
      
      // Update local state
      setPhotos(photos.filter(photo => photo.id !== id));
      console.log(`Photo with ID ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting photo with ID ${id}:`, error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    if (selectedFile && previewUrl && photoCaption && photoAlt) {
      try {
        console.log('Creating new photo with Cloudinary URL:', previewUrl);
        
        // Create new photo object with Cloudinary URL
        const newPhoto: Photo = {
          id: `photo_${Date.now()}`, // Use timestamp as unique ID with string prefix
          src: previewUrl, // This is now a Cloudinary URL
          alt: photoAlt,
          note: photoCaption,
          timestamp: Date.now()
        };
        
        console.log('New photo object created:', newPhoto);
        
        // Add to photos array immediately to update UI
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);
        
        // Save user photos to localStorage
        // We still save to localStorage for persistence between sessions
        // but now the src URLs point to Cloudinary instead of local data URLs
        const userPhotos = updatedPhotos.filter(photo => !initialPhotos.some(p => p.id === photo.id));
        
        // Validate that we can stringify the userPhotos before attempting to save
        try {
          const userPhotosJson = JSON.stringify(userPhotos);
          console.log('User photos JSON size:', userPhotosJson.length, 'bytes');
          
          // Check if localStorage is available and has space
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('userPhotos', userPhotosJson);
              console.log('User photos saved to localStorage successfully');
            } catch (storageError) {
              console.error('Error saving user photos to localStorage:', storageError);
              // If localStorage is full, try to remove old data or reduce the size
              if (storageError instanceof DOMException && 
                  (storageError.name === 'QuotaExceededError' || 
                   storageError.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                
                console.warn('Storage space is full. Reducing saved photos.');
                
                // Keep only the most recent 10 photos if storage is full
                const reducedUserPhotos = userPhotos.slice(-10);
                try {
                  localStorage.setItem('userPhotos', JSON.stringify(reducedUserPhotos));
                  console.log('Reduced user photos saved to localStorage');
                } catch (finalError) {
                  console.error('Final attempt to save to localStorage failed:', finalError);
                }
              }
            }
          } else {
            console.warn('localStorage is not available in this environment');
          }
        } catch (jsonError) {
          console.error('Error stringifying user photos:', jsonError);
        }
        
        // Reset form and close dialog immediately to avoid UI freeze
        setSelectedFile(null);
        setPreviewUrl(null);
        setPhotoCaption('');
        setPhotoAlt('');
        setIsDialogOpen(false);
        
        console.log('Form submission completed successfully');
      } catch (error) {
        console.error('Error in form submission:', error);
        alert('There was an error saving your photo. Please try again.');
      }
    } else {
      console.warn('Form submission attempted with incomplete data');
      alert('Please complete all fields and upload a photo before submitting.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <div></div> {/* Empty div for flex spacing */}
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* Memory button removed as requested */}
          
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-700 p-6 rounded-xl w-full max-w-md z-50">
              <Dialog.Title className="text-xl font-bold mb-4">Add Your Memory with Poorva</Dialog.Title>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="photo-upload" className="block text-sm font-medium mb-1">Upload Photo</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                    aria-label="Upload a photo memory"
                  />
                  <button
                    type="button"
                    onClick={openCloudinaryWidget}
                    className="w-full h-40 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center hover:border-indigo-500 transition-colors"
                    aria-label="Click to select a photo"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="max-h-full rounded-lg" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="text-sm text-zinc-400">Click to select a photo</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div>
                  <label htmlFor="photo-alt" className="block text-sm font-medium mb-1">Photo Description (for accessibility)</label>
                  <input
                    type="text"
                    id="photo-alt"
                    value={photoAlt}
                    onChange={(e) => setPhotoAlt(e.target.value)}
                    placeholder="Describe what's in the photo"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    aria-label="Photo description for accessibility"
                  />
                </div>
                
                <div>
                  <label htmlFor="photo-caption" className="block text-sm font-medium mb-1">Memory Caption</label>
                  <textarea
                    id="photo-caption"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="Share your memory with Poorva..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                    required
                    aria-label="Memory caption"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition-colors"
                      aria-label="Cancel adding memory"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedFile || !photoCaption || !photoAlt}
                    aria-label="Add this memory"
                  >
                    Add Memory
                  </button>
                </div>
              </form>
              
              <Dialog.Close asChild>
                <button
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-800 transition-colors"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => {
          // Check if this is a user-uploaded photo (not in initialPhotos)
          const isUserUploaded = !initialPhotos.some(p => p.id === photo.id);
          
          return (
            <PhotoTile 
              key={photo.id} 
              photo={photo} 
              isUserUploaded={isUserUploaded}
              onDelete={isUserUploaded ? handleDeletePhoto : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Mosaic;
