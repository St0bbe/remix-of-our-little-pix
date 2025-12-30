import { Album } from '@/types/photo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Cake, Gift, Plane, Baby, GraduationCap, FolderHeart, Heart, Star, Camera, Music, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface AlbumGridProps {
  albums: Album[];
  onSelectAlbum: (albumId: string) => void;
  onCreateAlbum: () => void;
  onShareAlbum?: (albumId: string) => string;
  photoCountByAlbum: Record<string, number>;
}

const iconMap: Record<string, React.ReactNode> = {
  'cake': <Cake className="w-6 h-6" />,
  'gift': <Gift className="w-6 h-6" />,
  'plane': <Plane className="w-6 h-6" />,
  'baby': <Baby className="w-6 h-6" />,
  'graduation-cap': <GraduationCap className="w-6 h-6" />,
  'heart': <Heart className="w-6 h-6" />,
  'star': <Star className="w-6 h-6" />,
  'camera': <Camera className="w-6 h-6" />,
  'music': <Music className="w-6 h-6" />,
  'default': <FolderHeart className="w-6 h-6" />,
};

export const AlbumGrid = ({ albums, onSelectAlbum, onCreateAlbum, onShareAlbum, photoCountByAlbum }: AlbumGridProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (e: React.MouseEvent, albumId: string) => {
    e.stopPropagation();
    if (onShareAlbum) {
      const linkId = onShareAlbum(albumId);
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${linkId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(albumId);
      toast.success('Link do álbum copiado!');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

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
            className="p-4 cursor-pointer hover:shadow-hover transition-all duration-300 group relative"
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
            
            {onShareAlbum && (photoCountByAlbum[album.id] || 0) > 0 && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleShare(e, album.id)}
              >
                {copiedId === album.id ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
