import { Photo, categoryLabels } from '@/types/photo';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User } from 'lucide-react';

interface PhotoViewerProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
}

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
            alt={`Foto de ${photo.childName}`}
            className="w-full max-h-[70vh] object-contain bg-foreground/5"
          />
        </div>
        
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <span className="font-display text-xl font-medium">{photo.childName}</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {categoryLabels[photo.category]}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
