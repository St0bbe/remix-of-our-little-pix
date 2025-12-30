import { Photo } from '@/types/photo';
import { PhotoCard } from './PhotoCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Camera } from 'lucide-react';

interface PhotoGridProps {
  photos: Photo[];
  onDelete: (id: string) => void;
  onView: (photo: Photo) => void;
  selectionMode?: boolean;
  selectedPhotos?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export const PhotoGrid = ({ photos, onDelete, onView, selectionMode, selectedPhotos, onToggleSelect }: PhotoGridProps) => {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Camera className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-display text-xl font-medium text-foreground mb-2">
          Nenhuma foto ainda
        </h3>
        <p className="text-muted-foreground max-w-md">
          Clique no botão "Adicionar Fotos" para começar a criar memórias lindas da sua família!
        </p>
      </div>
    );
  }

  const groupedPhotos = photos.reduce((acc, photo) => {
    const monthKey = photo.date.substring(0, 7);
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  const sortedMonths = Object.keys(groupedPhotos).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      {sortedMonths.map((month) => {
        const monthDate = new Date(month + '-01');
        const monthLabel = format(monthDate, "MMMM 'de' yyyy", { locale: ptBR });

        return (
          <div key={month} className="animate-slide-up">
            <h3 className="font-display text-xl font-medium text-foreground mb-4 capitalize">
              {monthLabel}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedPhotos[month]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onDelete={onDelete}
                    onView={onView}
                    selectionMode={selectionMode}
                    isSelected={selectedPhotos?.has(photo.id)}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
