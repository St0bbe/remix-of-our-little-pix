import { Photo, categoryLabels } from '@/types/photo';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User, Download } from 'lucide-react';

interface PhotoViewerProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
}

const downloadPhoto = (photo: Photo) => {
  const link = document.createElement('a');
  link.href = photo.url;
  link.download = `${photo.childName}-${photo.date}${photo.title ? '-' + photo.title : ''}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const PhotoViewer = ({ photo, isOpen, onClose }: PhotoViewerProps) => {
  if (!photo) return null;

  const formattedDate = format(new Date(photo.date), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card">
        <div className="relative">
          <img
            src={photo.url}
            alt={photo.title || `Foto de ${photo.childName}`}
            className="w-full max-h-[70vh] object-contain bg-foreground/5"
          />
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <span className="font-display text-xl font-medium">{photo.childName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {categoryLabels[photo.category]}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => downloadPhoto(photo)}
              >
                <Download className="w-4 h-4 mr-1" />
                Baixar
              </Button>
            </div>
          </div>

          {photo.title && (
            <h3 className="font-display text-lg font-medium text-foreground">
              {photo.title}
            </h3>
          )}

          {photo.description && (
            <p className="text-muted-foreground leading-relaxed">
              {photo.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
