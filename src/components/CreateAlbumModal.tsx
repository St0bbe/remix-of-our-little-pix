import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Album } from '@/types/photo';
import { toast } from 'sonner';
import { Cake, Gift, Plane, Baby, GraduationCap, FolderHeart, Heart, Star, Camera, Music } from 'lucide-react';

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAlbum: (album: Omit<Album, 'id' | 'createdAt'>) => void;
}

const iconOptions = [
  { value: 'cake', icon: <Cake className="w-5 h-5" />, label: 'Aniversário' },
  { value: 'gift', icon: <Gift className="w-5 h-5" />, label: 'Presente' },
  { value: 'plane', icon: <Plane className="w-5 h-5" />, label: 'Viagem' },
  { value: 'baby', icon: <Baby className="w-5 h-5" />, label: 'Bebê' },
  { value: 'graduation-cap', icon: <GraduationCap className="w-5 h-5" />, label: 'Escola' },
  { value: 'heart', icon: <Heart className="w-5 h-5" />, label: 'Amor' },
  { value: 'star', icon: <Star className="w-5 h-5" />, label: 'Especial' },
  { value: 'camera', icon: <Camera className="w-5 h-5" />, label: 'Fotos' },
  { value: 'music', icon: <Music className="w-5 h-5" />, label: 'Música' },
  { value: 'default', icon: <FolderHeart className="w-5 h-5" />, label: 'Geral' },
];

const colorOptions = [
  'hsl(350, 60%, 65%)',
  'hsl(0, 70%, 45%)',
  'hsl(200, 70%, 50%)',
  'hsl(280, 60%, 60%)',
  'hsl(45, 80%, 50%)',
  'hsl(160, 60%, 45%)',
  'hsl(25, 80%, 55%)',
  'hsl(220, 70%, 55%)',
];

export const CreateAlbumModal = ({ isOpen, onClose, onCreateAlbum }: CreateAlbumModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('default');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Informe o nome do álbum');
      return;
    }

    onCreateAlbum({
      name: name.trim(),
      description: description.trim() || undefined,
      icon: selectedIcon,
      color: selectedColor,
    });

    toast.success('Álbum criado com sucesso!');
    setName('');
    setDescription('');
    setSelectedIcon('default');
    setSelectedColor(colorOptions[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Novo Álbum</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Nome do Álbum</Label>
            <Input
              placeholder="Ex: Férias na Praia 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              placeholder="Adicione uma descrição..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedIcon(option.value)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    selectedIcon === option.value 
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  title={option.label}
                >
                  {option.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color ? 'ring-2 ring-foreground ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="gradient-primary">
              Criar Álbum
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
