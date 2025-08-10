import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { photos as initialPhotos } from '../data/content';

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
  onDelete?: (id: number) => void;
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
type Photo = {
  id: number;
  src: string;
  alt: string;
  note: string;
};

const Mosaic = () => {
  const [photos, setPhotos] = useState(initialPhotos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoAlt, setPhotoAlt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load user photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('userPhotos');
    if (savedPhotos) {
      const userPhotos = JSON.parse(savedPhotos) as Photo[];
      // Combine initial photos with user photos
      setPhotos([...initialPhotos, ...userPhotos]);
    }
    
    // Listen for the custom event from Hero component
    const handleOpenPhotoDialog = () => {
      setIsDialogOpen(true);
    };
    
    window.addEventListener('open-photo-dialog', handleOpenPhotoDialog);
    
    return () => {
      window.removeEventListener('open-photo-dialog', handleOpenPhotoDialog);
    };
  }, []);

  // Open Cloudinary Upload Widget
  const openCloudinaryWidget = () => {
    // Check if Cloudinary is loaded
    if (!window.cloudinary) {
      console.error('Cloudinary widget not loaded');
      alert('Image upload service is not available. Please try again later.');
      return;
    }
    
    // Create and open the Cloudinary Upload Widget
    const uploadWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dn29d1f9i',
        uploadPreset: 'poorva_memories', // Create this preset in your Cloudinary dashboard (unsigned)
        folder: 'user_memories', // Store in a specific folder
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
        }
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          alert('There was an error uploading your image. Please try again.');
          return;
        }
        
        if (result && result.event === 'success') {
          // On successful upload
          console.log('Cloudinary upload success:', result.info);
          setSelectedFile({ name: result.info.original_filename } as File);
          setPreviewUrl(result.info.secure_url);
        }
      }
    );
    
    uploadWidget.open();
  };
  
  // Handle file selection (now just opens Cloudinary widget)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    openCloudinaryWidget();
  };

  // Handle photo deletion
  const handleDeletePhoto = (id: number) => {
    // Filter out the photo with the given id
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    setPhotos(updatedPhotos);
    
    // Update localStorage
    const userPhotos = updatedPhotos.filter(photo => !initialPhotos.some(p => p.id === photo.id));
    localStorage.setItem('userPhotos', JSON.stringify(userPhotos));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFile && previewUrl && photoCaption && photoAlt) {
      // Create new photo object with Cloudinary URL
      const newPhoto: Photo = {
        id: Date.now(), // Use timestamp as unique ID
        src: previewUrl, // This is now a Cloudinary URL
        alt: photoAlt,
        note: photoCaption
      };
      
      // Add to photos array
      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);
      
      // Save user photos to localStorage
      // We still save to localStorage for persistence between sessions
      // but now the src URLs point to Cloudinary instead of local data URLs
      const userPhotos = updatedPhotos.filter(photo => !initialPhotos.some(p => p.id === photo.id));
      try {
        localStorage.setItem('userPhotos', JSON.stringify(userPhotos));
        console.log('User photos saved to localStorage successfully');
      } catch (error) {
        console.error('Error saving user photos to localStorage:', error);
      }
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setPhotoCaption('');
      setPhotoAlt('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <div></div> {/* Empty div for flex spacing */}
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Trigger asChild>
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              aria-label="Add your memory with Poorva"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add your memory with Poorva
            </button>
          </Dialog.Trigger>
          
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
