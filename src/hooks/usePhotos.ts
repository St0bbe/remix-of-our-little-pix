import { useState, useEffect } from 'react';
import { Photo, PhotoCategory, Album, defaultAlbums } from '@/types/photo';

const PHOTOS_KEY = 'family-photos';
const ALBUMS_KEY = 'family-albums';

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [children, setChildren] = useState<string[]>([]);

  useEffect(() => {
    // Load photos
    const storedPhotos = localStorage.getItem(PHOTOS_KEY);
    if (storedPhotos) {
      const parsedPhotos = JSON.parse(storedPhotos) as Photo[];
      setPhotos(parsedPhotos);
      
      const uniqueChildren = [...new Set(parsedPhotos.map(p => p.childName))];
      setChildren(uniqueChildren);
    }

    // Load or initialize albums
    const storedAlbums = localStorage.getItem(ALBUMS_KEY);
    if (storedAlbums) {
      setAlbums(JSON.parse(storedAlbums));
    } else {
      const initialAlbums = defaultAlbums.map(album => ({
        ...album,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }));
      setAlbums(initialAlbums);
      localStorage.setItem(ALBUMS_KEY, JSON.stringify(initialAlbums));
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
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));

    const uniqueChildren = [...new Set(updatedPhotos.map(p => p.childName))];
    setChildren(uniqueChildren);
  };

  const updatePhoto = (id: string, updates: Partial<Photo>) => {
    const updatedPhotos = photos.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setPhotos(updatedPhotos);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
  };

  const deletePhoto = (id: string) => {
    const updatedPhotos = photos.filter(p => p.id !== id);
    setPhotos(updatedPhotos);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
  };

  const filterPhotos = (
    categoryFilter: PhotoCategory | 'all',
    childFilter: string | 'all',
    albumFilter: string | 'all'
  ) => {
    return photos.filter(photo => {
      const matchCategory = categoryFilter === 'all' || photo.category === categoryFilter;
      const matchChild = childFilter === 'all' || photo.childName === childFilter;
      const matchAlbum = albumFilter === 'all' || photo.albumId === albumFilter;
      return matchCategory && matchChild && matchAlbum;
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

  const addAlbum = (album: Omit<Album, 'id' | 'createdAt'>) => {
    const newAlbum = {
      ...album,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updatedAlbums = [...albums, newAlbum];
    setAlbums(updatedAlbums);
    localStorage.setItem(ALBUMS_KEY, JSON.stringify(updatedAlbums));
    return newAlbum;
  };

  const deleteAlbum = (id: string) => {
    // Remove album from photos
    const updatedPhotos = photos.map(p => 
      p.albumId === id ? { ...p, albumId: undefined } : p
    );
    setPhotos(updatedPhotos);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));

    // Remove album
    const updatedAlbums = albums.filter(a => a.id !== id);
    setAlbums(updatedAlbums);
    localStorage.setItem(ALBUMS_KEY, JSON.stringify(updatedAlbums));
  };

  const getAlbumPhotos = (albumId: string) => {
    return photos.filter(p => p.albumId === albumId);
  };

  return {
    photos,
    albums,
    children,
    addPhotos,
    updatePhoto,
    deletePhoto,
    filterPhotos,
    getPhotosByMonth,
    addAlbum,
    deleteAlbum,
    getAlbumPhotos,
  };
};
