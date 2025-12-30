import { Photo, Album, categoryLabels } from '@/types/photo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SharedViewProps {
  type: 'photo' | 'album';
  photo?: Photo;
  album?: Album;
  photos?: Photo[];
  onViewPhoto?: (photo: Photo) => void;
}

export const SharedView = ({ type, photo, album, photos, onViewPhoto }: SharedViewProps) => {
  if (type === 'photo' && photo) {
    const formattedDate = format(new Date(photo.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full overflow-hidden animate-scale-in">
          <div className="relative">
            <img
              src={photo.url}
              alt={photo.title || photo.childName}
              className="w-full max-h-[60vh] object-contain bg-foreground/5"
            />
            {photo.isFavorite && (
              <Heart className="absolute top-4 left-4 w-8 h-8 text-primary fill-primary" />
            )}
          </div>
          
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-display text-2xl font-semibold">
                {photo.title || photo.childName}
              </h2>
              <Badge variant="secondary">{categoryLabels[photo.category]}</Badge>
            </div>
            
            {photo.description && (
              <p className="text-muted-foreground">{photo.description}</p>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Compartilhado do Álbum da Família ❤️
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (type === 'album' && album && photos) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div 
              className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-4 text-primary-foreground"
              style={{ backgroundColor: album.color }}
            >
              <Heart className="w-8 h-8" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
              {album.name}
            </h1>
            {album.description && (
              <p className="text-muted-foreground max-w-md mx-auto">{album.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              {photos.length} foto{photos.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className="overflow-hidden cursor-pointer hover:shadow-hover transition-all"
                onClick={() => onViewPhoto?.(photo)}
              >
                <div className="aspect-square">
                  <img
                    src={photo.url}
                    alt={photo.title || photo.childName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {photo.title && (
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{photo.title}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Compartilhado do Álbum da Família ❤️
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Link não encontrado</h2>
        <p className="text-muted-foreground">Este link de compartilhamento não existe ou expirou.</p>
      </Card>
    </div>
  );
};
