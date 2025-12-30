import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PhotoFilters } from '@/components/PhotoFilters';
import { PhotoGrid } from '@/components/PhotoGrid';
import { UploadModal } from '@/components/UploadModal';
import { PhotoViewer } from '@/components/PhotoViewer';
import { usePhotos } from '@/hooks/usePhotos';
import { Button } from '@/components/ui/button';
import { Photo, PhotoCategory } from '@/types/photo';
import { Plus, Camera, Heart } from 'lucide-react';

const Index = () => {
  const { photos, children, addPhotos, deletePhoto, filterPhotos } = usePhotos();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<PhotoCategory | 'all'>('all');
  const [childFilter, setChildFilter] = useState<string | 'all'>('all');
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);

  const filteredPhotos = useMemo(() => {
    return filterPhotos(categoryFilter, childFilter, 'all');
  }, [photos, categoryFilter, childFilter, filterPhotos]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-2 bg-secondary/50 px-4 py-2 rounded-full mb-4">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              {photos.length} memória{photos.length !== 1 ? 's' : ''} guardada{photos.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Momentos Especiais
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Guarde as memórias mais preciosas da sua família em um só lugar
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            onClick={() => setIsUploadOpen(true)}
            className="gradient-primary shadow-soft hover:shadow-hover transition-all duration-300 gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Fotos
          </Button>
        </div>

        {/* Filters */}
        {photos.length > 0 && (
          <div className="mb-8">
            <PhotoFilters
              categoryFilter={categoryFilter}
              childFilter={childFilter}
              children={children}
              onCategoryChange={setCategoryFilter}
              onChildChange={setChildFilter}
            />
          </div>
        )}

        {/* Photo Grid */}
        <PhotoGrid
          photos={filteredPhotos}
          onDelete={deletePhoto}
          onView={setViewingPhoto}
        />

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
