import { Photo, categoryLabels } from '@/types/photo';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User, Download, Heart, Share2, Check, Edit, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface PhotoViewerProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (id: string) => void;
  onShare?: (photoId: string) => string;
  onEdit?: (photo: Photo) => void;
  onSlideshow?: () => void;
}

const downloadPhoto = (photo: Photo) => {
  const link = document.createElement('a');
  link.href = photo.url;
  link.download = `${photo.childName}-${photo.date}${photo.title ? '-' + photo.title : ''}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const PhotoViewer = ({ 
  photo, 
  isOpen, 
  onClose, 
  onToggleFavorite, 
  onShare,
  onEdit,
  onSlideshow 
}: PhotoViewerProps) => {
  const [copied, setCopied] = useState(false);

  if (!photo) return null;

  const formattedDate = format(new Date(photo.date), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const handleShare = () => {
    if (onShare) {
      const linkId = onShare(photo.id);
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${linkId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card">
        <div className="relative">
          <img
            src={photo.url}
            alt={photo.title || `Foto de ${photo.childName}`}
            className="w-full max-h-[70vh] object-contain bg-foreground/5"
          />
          {photo.isFavorite && (
            <div className="absolute top-4 left-4">
              <Heart className="w-8 h-8 text-primary fill-primary drop-shadow-lg" />
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <span className="font-display text-xl font-medium">{photo.childName}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {categoryLabels[photo.category]}
              </Badge>
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

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {onToggleFavorite && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onToggleFavorite(photo.id)}
              >
                <Heart className={`w-4 h-4 mr-1 ${photo.isFavorite ? 'fill-primary text-primary' : ''}`} />
                {photo.isFavorite ? 'Favorita' : 'Favoritar'}
              </Button>
            )}
            {onEdit && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit(photo);
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
            {onSlideshow && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  onClose();
                  onSlideshow();
                }}
              >
                <Play className="w-4 h-4 mr-1" />
                Slideshow
              </Button>
            )}
            {onShare && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleShare}
              >
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Share2 className="w-4 h-4 mr-1" />}
                {copied ? 'Copiado!' : 'Compartilhar'}
              </Button>
            )}
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
      </DialogContent>
    </Dialog>
  );
};
