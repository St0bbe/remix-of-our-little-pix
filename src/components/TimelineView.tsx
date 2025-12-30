import { Photo } from '@/types/photo';
import { format, differenceInMonths, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Baby } from 'lucide-react';

interface TimelineViewProps {
  photos: Photo[];
  onViewPhoto: (photo: Photo) => void;
}

export const TimelineView = ({ photos, onViewPhoto }: TimelineViewProps) => {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma foto para exibir na linha do tempo
      </div>
    );
  }

  // Sort photos by date
  const sortedPhotos = [...photos].sort((a, b) => a.date.localeCompare(b.date));
  
  // Get first photo date as birth reference
  const firstPhotoDate = new Date(sortedPhotos[0].date);
  
  // Group by year-month
  const groupedByMonth: Record<string, Photo[]> = {};
  sortedPhotos.forEach(photo => {
    const monthKey = photo.date.substring(0, 7);
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }
    groupedByMonth[monthKey].push(photo);
  });

  const timelineEntries = Object.entries(groupedByMonth).sort(([a], [b]) => a.localeCompare(b));

  const getAgeLabel = (date: string) => {
    const photoDate = new Date(date);
    const months = differenceInMonths(photoDate, firstPhotoDate);
    const years = differenceInYears(photoDate, firstPhotoDate);
    
    if (months === 0) return 'Recém-nascido(a)';
    if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    if (months < 24) return `${years} ano e ${months - 12} ${months - 12 === 1 ? 'mês' : 'meses'}`;
    return `${years} anos`;
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/30" />
      
      <div className="space-y-8">
        {timelineEntries.map(([month, monthPhotos], index) => {
          const monthDate = new Date(month + '-01');
          const monthLabel = format(monthDate, "MMMM 'de' yyyy", { locale: ptBR });
          const ageLabel = getAgeLabel(month + '-01');

          return (
            <div key={month} className="relative pl-20 md:pl-28 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Timeline dot */}
              <div className="absolute left-6 md:left-10 w-4 h-4 rounded-full bg-primary ring-4 ring-background shadow-soft" />
              
              {/* Age indicator */}
              <div className="absolute left-0 top-0 w-12 md:w-16 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                  <Baby className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h3 className="font-display text-lg font-medium text-foreground capitalize">
                    {monthLabel}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {ageLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{monthPhotos.length} foto{monthPhotos.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Photo thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {monthPhotos.slice(0, 6).map((photo) => (
                    <div
                      key={photo.id}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => onViewPhoto(photo)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title || photo.childName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {monthPhotos.length > 6 && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground font-medium">
                      +{monthPhotos.length - 6}
                    </div>
                  )}
                </div>

                {/* Show titles if available */}
                {monthPhotos.some(p => p.title) && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {monthPhotos.filter(p => p.title).slice(0, 3).map((photo) => (
                      <span 
                        key={photo.id}
                        className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                      >
                        {photo.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* End marker */}
      <div className="relative pl-20 md:pl-28 mt-8">
        <div className="absolute left-6 md:left-10 w-4 h-4 rounded-full bg-accent ring-4 ring-background" />
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm">E a história continua...</span>
        </div>
      </div>
    </div>
  );
};
