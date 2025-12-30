import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PhotoFilters } from '@/components/PhotoFilters';
import { PhotoGrid } from '@/components/PhotoGrid';
import { UploadModal } from '@/components/UploadModal';
import { PhotoViewer } from '@/components/PhotoViewer';
import { AlbumGrid } from '@/components/AlbumGrid';
import { CreateAlbumModal } from '@/components/CreateAlbumModal';
import { TimelineView } from '@/components/TimelineView';
import { usePhotos } from '@/hooks/usePhotos';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Photo, PhotoCategory } from '@/types/photo';
import { Plus, Camera, Heart, Grid, Clock, FolderHeart, Download } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

const Index = () => {
  const { photos, albums, children, addPhotos, deletePhoto, filterPhotos, addAlbum } = usePhotos();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<PhotoCategory | 'all'>('all');
  const [childFilter, setChildFilter] = useState<string | 'all'>('all');
  const [albumFilter, setAlbumFilter] = useState<string | 'all'>('all');
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const filteredPhotos = useMemo(() => {
    return filterPhotos(categoryFilter, childFilter, albumFilter);
  }, [photos, categoryFilter, childFilter, albumFilter, filterPhotos]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
                variant={selectionMode ? 'default' : 'outline'}
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  setSelectedPhotos(new Set());
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                {selectionMode ? 'Cancelar' : 'Baixar Fotos'}
              </Button>
              {selectionMode && selectedPhotos.size > 0 && (
                <Button size="lg" onClick={downloadSelectedPhotos}>
                  Baixar ({selectedPhotos.size})
                </Button>
              )}
            </>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="gallery" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="gallery" className="gap-2">
              <Grid className="w-4 h-4" />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="albums" className="gap-2">
              <FolderHeart className="w-4 h-4" />
              Álbuns
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
              selectionMode={selectionMode}
              selectedPhotos={selectedPhotos}
              onToggleSelect={togglePhotoSelection}
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
                const tabGallery = document.querySelector('[data-state="inactive"][value="gallery"]') as HTMLButtonElement;
                tabGallery?.click();
              }}
              onCreateAlbum={() => setIsCreateAlbumOpen(true)}
              photoCountByAlbum={photoCountByAlbum}
            />
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
      />

      <CreateAlbumModal
        isOpen={isCreateAlbumOpen}
        onClose={() => setIsCreateAlbumOpen(false)}
        onCreateAlbum={addAlbum}
      />

      <PhotoViewer
        photo={viewingPhoto}
        isOpen={!!viewingPhoto}
        onClose={() => setViewingPhoto(null)}
      />
    </div>
  );
};

export default Index;
