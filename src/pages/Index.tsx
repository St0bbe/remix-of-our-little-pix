import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PhotoFilters } from '@/components/PhotoFilters';
import { PhotoGrid } from '@/components/PhotoGrid';
import { UploadModal } from '@/components/UploadModal';
import { PhotoViewer } from '@/components/PhotoViewer';
import { AlbumGrid } from '@/components/AlbumGrid';
import { CreateAlbumModal } from '@/components/CreateAlbumModal';
import { TimelineView } from '@/components/TimelineView';
import { LoginScreen } from '@/components/LoginScreen';
import { PasswordSettings } from '@/components/PasswordSettings';
import { SharedView } from '@/components/SharedView';
import { StatsView } from '@/components/StatsView';
import { Slideshow } from '@/components/Slideshow';
import { EditPhotoModal } from '@/components/EditPhotoModal';
import { BackupExport } from '@/components/BackupExport';
import { PrintMode } from '@/components/PrintMode';
import { usePhotos } from '@/hooks/usePhotos';
import { usePhotoNotifications } from '@/hooks/usePhotoNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Photo, PhotoCategory } from '@/types/photo';
import { Plus, Camera, Heart, Grid, Clock, FolderHeart, Download, Settings, LogOut, Star, BarChart3, Play, MoreHorizontal, FileArchive, Printer } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

const Index = () => {
  const { 
    photos, albums, children, 
    addPhotos, deletePhoto, filterPhotos, updatePhoto,
    addAlbum, toggleFavorite, getFavorites,
    createShareLink, getSharedContent 
  } = usePhotos();
  
  const { isAuthenticated, isLoading, currentUser, login, logout, changePassword, hasUserRegistered } = useAuth();
  const { updatePhotoCount } = usePhotoNotifications();
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [isPasswordSettingsOpen, setIsPasswordSettingsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<PhotoCategory | 'all'>('all');
  const [childFilter, setChildFilter] = useState<string | 'all'>('all');
  const [albumFilter, setAlbumFilter] = useState<string | 'all'>('all');
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery');
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [slideshowStartIndex, setSlideshowStartIndex] = useState(0);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isPrintModeOpen, setIsPrintModeOpen] = useState(false);

  // Check for shared link
  const [sharedContent, setSharedContent] = useState<ReturnType<typeof getSharedContent>>(null);
  const [isSharedView, setIsSharedView] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      setTimeout(() => {
        const content = getSharedContent(shareId);
        if (content) {
          setSharedContent(content);
          setIsSharedView(true);
        }
      }, 500);
    }
  }, [photos, albums]);

  const filteredPhotos = useMemo(() => {
    return filterPhotos(categoryFilter, childFilter, albumFilter);
  }, [photos, categoryFilter, childFilter, albumFilter, filterPhotos]);

  const favoritePhotos = useMemo(() => getFavorites(), [photos, getFavorites]);

  const photoCountByAlbum = useMemo(() => {
    const counts: Record<string, number> = {};
    photos.forEach(p => {
      if (p.albumId) {
        counts[p.albumId] = (counts[p.albumId] || 0) + 1;
      }
    });
    return counts;
  }, [photos]);

  const togglePhotoSelection = (id: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const downloadSelectedPhotos = async () => {
    if (selectedPhotos.size === 0) {
      toast.error('Selecione pelo menos uma foto');
      return;
    }

    toast.loading('Preparando download...');
    
    const selectedPhotosList = photos.filter(p => selectedPhotos.has(p.id));
    
    if (selectedPhotosList.length === 1) {
      const photo = selectedPhotosList[0];
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = `${photo.childName}-${photo.date}.jpg`;
      link.click();
      toast.dismiss();
      toast.success('Foto baixada!');
    } else {
      const zip = new JSZip();
      selectedPhotosList.forEach((photo, i) => {
        const base64Data = photo.url.split(',')[1];
        zip.file(`foto-${i + 1}-${photo.date}.jpg`, base64Data, { base64: true });
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fotos-familia.zip';
      link.click();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success(`${selectedPhotosList.length} fotos baixadas!`);
    }
    
    setSelectedPhotos(new Set());
    setSelectionMode(false);
  };

  const handleSharePhoto = (photoId: string) => {
    return createShareLink('photo', photoId);
  };

  const handleShareAlbum = (albumId: string) => {
    return createShareLink('album', albumId);
  };

  const startSlideshow = (startIndex = 0) => {
    setSlideshowStartIndex(startIndex);
    setIsSlideshowOpen(true);
  };

  const startSlideshowFromPhoto = () => {
    if (viewingPhoto) {
      const index = filteredPhotos.findIndex(p => p.id === viewingPhoto.id);
      startSlideshow(index >= 0 ? index : 0);
    }
  };

  // Show loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  // Show shared view (public, no auth required)
  if (isSharedView && sharedContent) {
    return (
      <>
        <SharedView
          type={sharedContent.type}
          photo={sharedContent.type === 'photo' ? sharedContent.data as Photo : undefined}
          album={sharedContent.type === 'album' ? sharedContent.data : undefined}
          photos={sharedContent.type === 'album' ? sharedContent.photos : undefined}
          onViewPhoto={setViewingPhoto}
        />
        <PhotoViewer
          photo={viewingPhoto}
          isOpen={!!viewingPhoto}
          onClose={() => setViewingPhoto(null)}
        />
      </>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} hasUserRegistered={hasUserRegistered} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={currentUser?.email} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-2 bg-secondary/50 px-4 py-2 rounded-full mb-4">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              {photos.length} memória{photos.length !== 1 ? 's' : ''} guardada{photos.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Momentos Especiais
          </h2>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            size="lg"
            onClick={() => setIsUploadOpen(true)}
            className="gradient-primary shadow-soft hover:shadow-hover transition-all duration-300 gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Fotos
          </Button>
          {photos.length > 0 && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={() => startSlideshow()}
              >
                <Play className="w-5 h-5 mr-2" />
                Slideshow
              </Button>
              <Button
                size="lg"
                variant={selectionMode ? 'default' : 'outline'}
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  setSelectedPhotos(new Set());
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                {selectionMode ? 'Cancelar' : 'Baixar'}
              </Button>
              {selectionMode && selectedPhotos.size > 0 && (
                <Button size="lg" onClick={downloadSelectedPhotos}>
                  Baixar ({selectedPhotos.size})
                </Button>
              )}
              {selectionMode && selectedPhotos.size > 0 && (
                <Button size="lg" variant="outline" onClick={() => setIsPrintModeOpen(true)}>
                  <Printer className="w-5 h-5 mr-2" />
                  Imprimir ({selectedPhotos.size})
                </Button>
              )}
            </>
          )}
          
          {/* More options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsBackupOpen(true)}>
                <FileArchive className="w-4 h-4 mr-2" />
                Exportar Backup
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectionMode(false);
                setIsPrintModeOpen(true);
              }} disabled={photos.length === 0}>
                <Printer className="w-4 h-4 mr-2" />
                Modo Impressão
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPasswordSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Alterar Senha
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5">
            <TabsTrigger value="gallery" className="gap-1 text-xs sm:text-sm">
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Galeria</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1 text-xs sm:text-sm">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Favoritas</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1 text-xs sm:text-sm">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="albums" className="gap-1 text-xs sm:text-sm">
              <FolderHeart className="w-4 h-4" />
              <span className="hidden sm:inline">Álbuns</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6">
            {photos.length > 0 && (
              <PhotoFilters
                categoryFilter={categoryFilter}
                childFilter={childFilter}
                children={children}
                onCategoryChange={setCategoryFilter}
                onChildChange={setChildFilter}
              />
            )}
            <PhotoGrid
              photos={filteredPhotos}
              onDelete={deletePhoto}
              onView={setViewingPhoto}
              onToggleFavorite={toggleFavorite}
              selectionMode={selectionMode}
              selectedPhotos={selectedPhotos}
              onToggleSelect={togglePhotoSelection}
            />
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <PhotoGrid
              photos={favoritePhotos}
              onDelete={deletePhoto}
              onView={setViewingPhoto}
              onToggleFavorite={toggleFavorite}
              selectionMode={selectionMode}
              selectedPhotos={selectedPhotos}
              onToggleSelect={togglePhotoSelection}
              emptyMessage="Clique no coração das fotos para adicioná-las aos favoritos!"
            />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineView photos={photos} onViewPhoto={setViewingPhoto} />
          </TabsContent>

          <TabsContent value="albums">
            <AlbumGrid
              albums={albums}
              onSelectAlbum={(id) => {
                setAlbumFilter(id);
                setActiveTab('gallery');
              }}
              onCreateAlbum={() => setIsCreateAlbumOpen(true)}
              onShareAlbum={handleShareAlbum}
              photoCountByAlbum={photoCountByAlbum}
            />
          </TabsContent>

          <TabsContent value="stats">
            <StatsView photos={photos} children={children} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 text-center py-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Feito com</span>
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span>para nossa família</span>
          </div>
        </footer>
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={addPhotos}
        existingChildren={children}
        albums={albums}
        onPhotosAdded={updatePhotoCount}
      />

      <CreateAlbumModal
        isOpen={isCreateAlbumOpen}
        onClose={() => setIsCreateAlbumOpen(false)}
        onCreateAlbum={addAlbum}
      />

      <PasswordSettings
        isOpen={isPasswordSettingsOpen}
        onClose={() => setIsPasswordSettingsOpen(false)}
        currentEmail={currentUser?.email || ''}
        onChangePassword={changePassword}
      />

      <PhotoViewer
        photo={viewingPhoto}
        isOpen={!!viewingPhoto}
        onClose={() => setViewingPhoto(null)}
        onToggleFavorite={toggleFavorite}
        onShare={handleSharePhoto}
        onEdit={setEditingPhoto}
        onSlideshow={startSlideshowFromPhoto}
      />

      <EditPhotoModal
        photo={editingPhoto}
        isOpen={!!editingPhoto}
        onClose={() => setEditingPhoto(null)}
        onSave={updatePhoto}
        albums={albums}
      />

      <Slideshow
        photos={filteredPhotos.length > 0 ? filteredPhotos : photos}
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        startIndex={slideshowStartIndex}
      />

      <BackupExport
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        photos={photos}
        albums={albums}
      />

      <PrintMode
        photos={selectionMode && selectedPhotos.size > 0 
          ? photos.filter(p => selectedPhotos.has(p.id)) 
          : photos
        }
        isOpen={isPrintModeOpen}
        onClose={() => setIsPrintModeOpen(false)}
      />
    </div>
  );
};

export default Index;
