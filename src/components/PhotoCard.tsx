import { useState } from 'react';
import { Photo, categoryLabels } from '@/types/photo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Calendar, ZoomIn } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PhotoCardProps {
  photo: Photo;
  onDelete: (id: string) => void;
  onView: (photo: Photo) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const PhotoCard = ({ photo, onDelete, onView, selectionMode, isSelected, onToggleSelect }: PhotoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formattedDate = format(new Date(photo.date), "d 'de' MMMM, yyyy", {
    locale: ptBR,
  });

  const handleClick = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect(photo.id);
    } else {
      onView(photo);
    }
  };

  return (
    <div
      className={`group relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 animate-scale-in cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={photo.url}
          alt={photo.title || `Foto de ${photo.childName}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {selectionMode && (
        <div className="absolute top-3 left-3">
          <Checkbox checked={isSelected} className="w-6 h-6 bg-card" />
        </div>
      )}

      {!selectionMode && (
        <div
          className={`absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground font-medium">
                  {photo.title || photo.childName}
                </p>
                <div className="flex items-center gap-1 text-primary-foreground/80 text-sm">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-8 h-8"
                  onClick={(e) => { e.stopPropagation(); onView(photo); }}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="w-8 h-8"
                  onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Badge
        className="absolute top-3 right-3 bg-card/90 text-foreground backdrop-blur-sm"
        variant="secondary"
      >
        {categoryLabels[photo.category]}
      </Badge>
    </div>
  );
};
