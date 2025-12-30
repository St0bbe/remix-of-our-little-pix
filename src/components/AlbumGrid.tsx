import { Album } from '@/types/photo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Cake, Gift, Plane, Baby, GraduationCap, FolderHeart } from 'lucide-react';

interface AlbumGridProps {
  albums: Album[];
  onSelectAlbum: (albumId: string) => void;
  onCreateAlbum: () => void;
  photoCountByAlbum: Record<string, number>;
}

const iconMap: Record<string, React.ReactNode> = {
  'cake': <Cake className="w-6 h-6" />,
  'gift': <Gift className="w-6 h-6" />,
  'plane': <Plane className="w-6 h-6" />,
  'baby': <Baby className="w-6 h-6" />,
  'graduation-cap': <GraduationCap className="w-6 h-6" />,
  'default': <FolderHeart className="w-6 h-6" />,
};

export const AlbumGrid = ({ albums, onSelectAlbum, onCreateAlbum, photoCountByAlbum }: AlbumGridProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-medium text-foreground">Álbuns</h3>
        <Button variant="outline" size="sm" onClick={onCreateAlbum}>
          <Plus className="w-4 h-4 mr-1" />
          Novo Álbum
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {albums.map((album) => (
          <Card
            key={album.id}
            className="p-4 cursor-pointer hover:shadow-hover transition-all duration-300 group"
            onClick={() => onSelectAlbum(album.id)}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-primary-foreground transition-transform group-hover:scale-110"
              style={{ backgroundColor: album.color }}
            >
              {iconMap[album.icon] || iconMap['default']}
            </div>
            <h4 className="font-medium text-foreground truncate">{album.name}</h4>
            <p className="text-sm text-muted-foreground">
              {photoCountByAlbum[album.id] || 0} fotos
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
