import { useState, useEffect } from 'react';
import { Photo, PhotoCategory } from '@/types/photo';

const STORAGE_KEY = 'family-photos';

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [children, setChildren] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedPhotos = JSON.parse(stored) as Photo[];
      setPhotos(parsedPhotos);
      
      const uniqueChildren = [...new Set(parsedPhotos.map(p => p.childName))];
      setChildren(uniqueChildren);
    }
  }, []);

  const addPhotos = (newPhotos: Omit<Photo, 'id' | 'createdAt'>[]) => {
    const photosWithIds = newPhotos.map(photo => ({
      ...photo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }));

    const updatedPhotos = [...photos, ...photosWithIds];
    setPhotos(updatedPhotos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPhotos));

    const uniqueChildren = [...new Set(updatedPhotos.map(p => p.childName))];
    setChildren(uniqueChildren);
  };

  const deletePhoto = (id: string) => {
    const updatedPhotos = photos.filter(p => p.id !== id);
    setPhotos(updatedPhotos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPhotos));
  };

  const filterPhotos = (
    categoryFilter: PhotoCategory | 'all',
    childFilter: string | 'all',
    dateFilter: string | 'all'
  ) => {
    return photos.filter(photo => {
      const matchCategory = categoryFilter === 'all' || photo.category === categoryFilter;
      const matchChild = childFilter === 'all' || photo.childName === childFilter;
      const matchDate = dateFilter === 'all' || photo.date.startsWith(dateFilter);
      return matchCategory && matchChild && matchDate;
    });
  };

  const getPhotosByMonth = () => {
    const grouped: Record<string, Photo[]> = {};
    
    photos.forEach(photo => {
      const monthKey = photo.date.substring(0, 7);
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(photo);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, photos]) => ({ month, photos }));
  };

  return {
    photos,
    children,
    addPhotos,
    deletePhoto,
    filterPhotos,
    getPhotosByMonth,
  };
};
