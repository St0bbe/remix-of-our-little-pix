import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Photo, PhotoCategory, categoryLabels, Album } from '@/types/photo';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface EditPhotoModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Photo>) => void;
  albums: Album[];
}

export const EditPhotoModal = ({ photo, isOpen, onClose, onSave, albums }: EditPhotoModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<PhotoCategory>('sozinha');
  const [albumId, setAlbumId] = useState<string>('none');

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || '');
      setDescription(photo.description || '');
      setDate(photo.date);
      setCategory(photo.category);
      setAlbumId(photo.albumId || 'none');
    }
  }, [photo]);

  const handleSave = () => {
    if (!photo) return;

    onSave(photo.id, {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      date,
      category,
      albumId: albumId !== 'none' ? albumId : undefined,
    });

    toast.success('Foto atualizada!');
    onClose();
  };

  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Editar Foto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-secondary">
            <img
              src={photo.url}
              alt={photo.title || photo.childName}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ex: Primeiro sorriso"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Conte a história dessa foto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as PhotoCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Álbum</Label>
              <Select value={albumId} onValueChange={setAlbumId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um álbum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} className="gradient-primary">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
