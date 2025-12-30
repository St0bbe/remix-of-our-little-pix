import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadPhoto, deletePhotoFromStorage } from '@/lib/photoService';
import { Photo, PhotoCategory, Album, SharedLink, ActivityItem, Comment, defaultAlbums } from '@/types/photo';

interface DbPhoto {
  id: string;
  user_id: string;
  album_id: string | null;
  title: string | null;
  description: string | null;
  file_path: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  taken_at: string | null;
  is_favorite: boolean;
  is_public: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface DbAlbum {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_photo_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface DbComment {
  id: string;
  user_id: string;
  photo_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Convert DB photo to app Photo type
const dbPhotoToPhoto = (dbPhoto: DbPhoto, comments: Comment[] = []): Photo => ({
  id: dbPhoto.id,
  url: dbPhoto.file_url,
  date: dbPhoto.taken_at || dbPhoto.created_at.split('T')[0],
  category: 'sozinha' as PhotoCategory, // Default, we can add this field to DB later
  childName: dbPhoto.tags?.[0] || 'Família',
  title: dbPhoto.title || undefined,
  description: dbPhoto.description || undefined,
  albumId: dbPhoto.album_id || undefined,
  isFavorite: dbPhoto.is_favorite,
  uploadedBy: dbPhoto.user_id,
  comments,
  createdAt: dbPhoto.created_at,
});

// Convert DB album to app Album type
const dbAlbumToAlbum = (dbAlbum: DbAlbum): Album => ({
  id: dbAlbum.id,
  name: dbAlbum.name,
  description: dbAlbum.description || undefined,
  coverPhotoId: dbAlbum.cover_photo_url || undefined,
  color: 'hsl(200, 70%, 50%)', // Default color
  icon: 'folder',
  isPublic: dbAlbum.is_public,
  createdAt: dbAlbum.created_at,
});

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [children, setChildren] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch photos from Supabase
  const fetchPhotos = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (photosError) {
        console.error('Error fetching photos:', photosError);
        return;
      }

      // Fetch comments for all photos
      const photoIds = photosData?.map(p => p.id) || [];
      let commentsMap: Record<string, Comment[]> = {};

      if (photoIds.length > 0) {
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .in('photo_id', photoIds);

        if (commentsData) {
          commentsData.forEach((comment: DbComment) => {
            if (!commentsMap[comment.photo_id]) {
              commentsMap[comment.photo_id] = [];
            }
            commentsMap[comment.photo_id].push({
              id: comment.id,
              userEmail: comment.user_id,
              text: comment.content,
              createdAt: comment.created_at,
            });
          });
        }
      }

      const convertedPhotos = (photosData || []).map((p: DbPhoto) => 
        dbPhotoToPhoto(p, commentsMap[p.id] || [])
      );

      setPhotos(convertedPhotos);
      
      const uniqueChildren = [...new Set(convertedPhotos.map(p => p.childName))];
      setChildren(uniqueChildren);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  }, [userId]);

  // Fetch albums from Supabase
  const fetchAlbums = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching albums:', error);
        return;
      }

      if (data && data.length > 0) {
        setAlbums(data.map(dbAlbumToAlbum));
      } else {
        // Create default albums if none exist
        const defaultAlbumsToCreate = defaultAlbums.map(album => ({
          user_id: userId,
          name: album.name,
          description: album.description || null,
          is_public: false,
        }));

        const { data: createdAlbums, error: createError } = await supabase
          .from('albums')
          .insert(defaultAlbumsToCreate)
          .select();

        if (!createError && createdAlbums) {
          setAlbums(createdAlbums.map((a: DbAlbum, i: number) => ({
            ...dbAlbumToAlbum(a),
            color: defaultAlbums[i]?.color || 'hsl(200, 70%, 50%)',
            icon: defaultAlbums[i]?.icon || 'folder',
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  }, [userId]);

  // Fetch activities from Supabase
  const fetchActivities = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      if (data) {
        setActivities(data.map(a => {
          const metadata = a.metadata as Record<string, unknown> | null;
          return {
            id: a.id,
            type: a.action as ActivityItem['type'],
            userEmail: a.user_id,
            photoId: a.entity_id || undefined,
            photoTitle: (metadata?.photoTitle as string) || undefined,
            commentText: (metadata?.commentText as string) || undefined,
            createdAt: a.created_at,
          };
        }));
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [userId]);

  // Load all data when user changes
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      Promise.all([fetchPhotos(), fetchAlbums(), fetchActivities()])
        .finally(() => setIsLoading(false));
    } else {
      setPhotos([]);
      setAlbums([]);
      setActivities([]);
      setIsLoading(false);
    }
  }, [userId, fetchPhotos, fetchAlbums, fetchActivities]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;

    const photosChannel = supabase
      .channel('photos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'photos' },
        () => {
          fetchPhotos();
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          fetchPhotos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(photosChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [userId, fetchPhotos]);

  const addActivity = async (activity: Omit<ActivityItem, 'id' | 'createdAt'>) => {
    if (!userId) return;

    const { error } = await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        action: activity.type,
        entity_type: 'photo',
        entity_id: activity.photoId,
        metadata: {
          photoTitle: activity.photoTitle,
          commentText: activity.commentText,
        }
      });

    if (!error) {
      fetchActivities();
    }
  };

  const addPhotos = async (
    newPhotos: Array<{
      file?: File;
      url?: string;
      date: string;
      category: PhotoCategory;
      childName: string;
      title?: string;
      description?: string;
      albumId?: string;
    }>,
    onPhotosAdded?: (count: number) => void,
    userEmail?: string
  ) => {
    if (!userId) return;

    const uploadedPhotos: Photo[] = [];

    for (const photo of newPhotos) {
      let fileUrl = photo.url || '';
      let filePath = '';

      // If there's a file, upload it
      if (photo.file) {
        const result = await uploadPhoto(photo.file, userId);
        if (result) {
          fileUrl = result.fileUrl;
          filePath = result.filePath;
        } else {
          console.error('Failed to upload photo');
          continue;
        }
      }

      // Insert into database
      const { data, error } = await supabase
        .from('photos')
        .insert({
          user_id: userId,
          album_id: photo.albumId || null,
          title: photo.title || null,
          description: photo.description || null,
          file_path: filePath,
          file_url: fileUrl,
          taken_at: photo.date,
          tags: [photo.childName],
          is_favorite: false,
          is_public: false,
        })
        .select()
        .single();

      if (!error && data) {
        const newPhoto = dbPhotoToPhoto(data);
        uploadedPhotos.push(newPhoto);

        // Add activity
        await addActivity({
          type: 'photo_added',
          userEmail: userEmail || userId,
          photoId: data.id,
          photoTitle: photo.title || photo.childName,
        });
      }
    }

    // Refresh photos
    await fetchPhotos();

    if (onPhotosAdded) {
      onPhotosAdded(photos.length + uploadedPhotos.length);
    }
  };

  const updatePhoto = async (id: string, updates: Partial<Photo>) => {
    const dbUpdates: Record<string, unknown> = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.albumId !== undefined) dbUpdates.album_id = updates.albumId;
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
    if (updates.date !== undefined) dbUpdates.taken_at = updates.date;
    if (updates.childName !== undefined) dbUpdates.tags = [updates.childName];

    const { error } = await supabase
      .from('photos')
      .update(dbUpdates)
      .eq('id', id);

    if (!error) {
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const toggleFavorite = async (id: string, userEmail?: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    const newFavoriteState = !photo.isFavorite;
    await updatePhoto(id, { isFavorite: newFavoriteState });

    if (newFavoriteState && userEmail) {
      await addActivity({
        type: 'photo_favorited',
        userEmail,
        photoId: id,
        photoTitle: photo.title || photo.childName,
      });
    }
  };

  const addComment = async (photoId: string, text: string, userEmail: string, parentId?: string) => {
    if (!userId) return;

    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        photo_id: photoId,
        content: text,
      });

    if (!error) {
      await addActivity({
        type: 'comment_added',
        userEmail,
        photoId,
        photoTitle: photo.title || photo.childName,
        commentText: parentId ? `(resposta) ${text}` : text,
      });

      fetchPhotos();
    }
  };

  const deletePhoto = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    // Get the file path from DB
    const { data } = await supabase
      .from('photos')
      .select('file_path')
      .eq('id', id)
      .single();

    // Delete from storage if file path exists
    if (data?.file_path) {
      await deletePhotoFromStorage(data.file_path);
    }

    // Delete from database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (!error) {
      setPhotos(prev => prev.filter(p => p.id !== id));
    }
  };

  const filterPhotos = useCallback((
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
  }, [photos]);

  const getFavorites = useCallback(() => photos.filter(p => p.isFavorite), [photos]);

  const getPhotosByMonth = useCallback(() => {
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
      .map(([month, monthPhotos]) => ({ month, photos: monthPhotos }));
  }, [photos]);

  const addAlbum = async (album: Omit<Album, 'id' | 'createdAt'>) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('albums')
      .insert({
        user_id: userId,
        name: album.name,
        description: album.description || null,
        is_public: album.isPublic || false,
      })
      .select()
      .single();

    if (!error && data) {
      const newAlbum = {
        ...dbAlbumToAlbum(data),
        color: album.color,
        icon: album.icon,
      };
      setAlbums(prev => [...prev, newAlbum]);
      return newAlbum;
    }

    return null;
  };

  const deleteAlbum = async (id: string) => {
    // First update photos to remove album reference
    await supabase
      .from('photos')
      .update({ album_id: null })
      .eq('album_id', id);

    // Then delete album
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', id);

    if (!error) {
      setPhotos(prev => prev.map(p => p.albumId === id ? { ...p, albumId: undefined } : p));
      setAlbums(prev => prev.filter(a => a.id !== id));
    }
  };

  const getAlbumPhotos = useCallback((albumId: string) => {
    return photos.filter(p => p.albumId === albumId);
  }, [photos]);

  // Shared links (keeping localStorage for now as it's simpler)
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
    localStorage.setItem('family-shared-links', JSON.stringify(updatedLinks));
    return newLink.id;
  };

  const getSharedContent = useCallback((linkId: string) => {
    const storedLinks = localStorage.getItem('family-shared-links');
    const links: SharedLink[] = storedLinks ? JSON.parse(storedLinks) : sharedLinks;
    const link = links.find(l => l.id === linkId);
    if (!link) return null;

    if (link.type === 'photo') {
      const photo = photos.find(p => p.id === link.targetId);
      return photo ? { type: 'photo' as const, data: photo } : null;
    } else {
      const album = albums.find(a => a.id === link.targetId);
      const albumPhotos = photos.filter(p => p.albumId === link.targetId);
      return album ? { type: 'album' as const, data: album, photos: albumPhotos } : null;
    }
  }, [photos, albums, sharedLinks]);

  return {
    photos,
    albums,
    children,
    sharedLinks,
    activities,
    isLoading,
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
    addComment,
    addActivity,
    refreshPhotos: fetchPhotos,
    refreshAlbums: fetchAlbums,
  };
};
