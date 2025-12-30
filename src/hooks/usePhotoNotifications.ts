import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const PHOTOS_KEY = 'family-photos';
const LAST_PHOTO_COUNT_KEY = 'family-last-photo-count';

export const usePhotoNotifications = () => {
  const [lastPhotoCount, setLastPhotoCount] = useState<number>(0);

  useEffect(() => {
    // Initialize with current count
    const storedPhotos = localStorage.getItem(PHOTOS_KEY);
    const photos = storedPhotos ? JSON.parse(storedPhotos) : [];
    const storedCount = localStorage.getItem(LAST_PHOTO_COUNT_KEY);
    
    if (storedCount) {
      setLastPhotoCount(parseInt(storedCount, 10));
    } else {
      setLastPhotoCount(photos.length);
      localStorage.setItem(LAST_PHOTO_COUNT_KEY, photos.length.toString());
    }
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PHOTOS_KEY && e.newValue) {
        const newPhotos = JSON.parse(e.newValue);
        const storedCount = localStorage.getItem(LAST_PHOTO_COUNT_KEY);
        const previousCount = storedCount ? parseInt(storedCount, 10) : 0;
        
        if (newPhotos.length > previousCount) {
          const addedCount = newPhotos.length - previousCount;
          toast.success(`${addedCount} nova${addedCount > 1 ? 's' : ''} foto${addedCount > 1 ? 's' : ''} adicionada${addedCount > 1 ? 's' : ''}!`, {
            description: 'O outro usuário adicionou fotos ao álbum',
            duration: 5000,
          });
          
          // Update the count
          localStorage.setItem(LAST_PHOTO_COUNT_KEY, newPhotos.length.toString());
          setLastPhotoCount(newPhotos.length);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updatePhotoCount = useCallback((count: number) => {
    setLastPhotoCount(count);
    localStorage.setItem(LAST_PHOTO_COUNT_KEY, count.toString());
  }, []);

  return { updatePhotoCount };
};
