import { useState, useEffect } from 'react';
import { Photo, PhotoCategory, Album, SharedLink, defaultAlbums } from '@/types/photo';

const PHOTOS_KEY = 'family-photos';
const ALBUMS_KEY = 'family-albums';
const SHARED_LINKS_KEY = 'family-shared-links';

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
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

    // Load shared links
    const storedLinks = localStorage.getItem(SHARED_LINKS_KEY);
    if (storedLinks) {
      setSharedLinks(JSON.parse(storedLinks));
    }
  }, []);

  const addPhotos = (newPhotos: Omit<Photo, 'id' | 'createdAt'>[], onPhotosAdded?: (count: number) => void) => {
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
    
    // Notify about the new count for cross-tab notifications
    if (onPhotosAdded) {
      onPhotosAdded(updatedPhotos.length);
    }
  };

  const updatePhoto = (id: string, updates: Partial<Photo>) => {
    const updatedPhotos = photos.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setPhotos(updatedPhotos);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
  };

  const toggleFavorite = (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      updatePhoto(id, { isFavorite: !photo.isFavorite });
    }
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

  const getFavorites = () => photos.filter(p => p.isFavorite);

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
    const updatedPhotos = photos.map(p => 
      p.albumId === id ? { ...p, albumId: undefined } : p
    );
    setPhotos(updatedPhotos);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));

    const updatedAlbums = albums.filter(a => a.id !== id);
    setAlbums(updatedAlbums);
    localStorage.setItem(ALBUMS_KEY, JSON.stringify(updatedAlbums));
  };

  const getAlbumPhotos = (albumId: string) => {
    return photos.filter(p => p.albumId === albumId);
  };

  // Shared links
  const createShareLink = (type: 'photo' | 'album', targetId: string): string => {
    const existingLink = sharedLinks.find(l => l.type === type && l.targetId === targetId);
    if (existingLink) {
      return existingLink.id;
    }

    const newLink: SharedLink = {
      id: crypto.randomUUID().slice(0, 8),
      type,
      targetId,
      createdAt: new Date().toISOString(),
    };

    const updatedLinks = [...sharedLinks, newLink];
    setSharedLinks(updatedLinks);
    localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(updatedLinks));
    return newLink.id;
  };

  const getSharedContent = (linkId: string) => {
    const link = sharedLinks.find(l => l.id === linkId);
    if (!link) return null;

    if (link.type === 'photo') {
      const photo = photos.find(p => p.id === link.targetId);
      return photo ? { type: 'photo' as const, data: photo } : null;
    } else {
      const album = albums.find(a => a.id === link.targetId);
      const albumPhotos = photos.filter(p => p.albumId === link.targetId);
      return album ? { type: 'album' as const, data: album, photos: albumPhotos } : null;
    }
  };

  return {
    photos,
    albums,
    children,
    sharedLinks,
    addPhotos,
    updatePhoto,
    toggleFavorite,
    deletePhoto,
    filterPhotos,
    getFavorites,
    getPhotosByMonth,
    addAlbum,
    deleteAlbum,
    getAlbumPhotos,
    createShareLink,
    getSharedContent,
  };
};
