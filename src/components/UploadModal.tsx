import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoCategory, categoryLabels, Album } from '@/types/photo';
import { Upload, X, Image, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (photos: Array<{
    url: string;
    date: string;
    category: PhotoCategory;
    childName: string;
    title?: string;
    description?: string;
    albumId?: string;
  }>, onPhotosAdded?: (count: number) => void) => void;
  existingChildren: string[];
  albums: Album[];
  onPhotosAdded?: (count: number) => void;
}

interface PendingPhoto {
  file: File;
  preview: string;
  title: string;
  description: string;
}

export const UploadModal = ({ isOpen, onClose, onUpload, existingChildren, albums, onPhotosAdded }: UploadModalProps) => {
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<PhotoCategory>('sozinha');
  const [childName, setChildName] = useState('');
  const [albumId, setAlbumId] = useState<string>('none');
  const [isNewChild, setIsNewChild] = useState(existingChildren.length === 0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingPhotos(prev => [...prev, {
          file,
          preview: event.target?.result as string,
          title: '',
          description: '',
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPendingPhotos(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const updatePhotoDetails = (index: number, updates: Partial<PendingPhoto>) => {
    setPendingPhotos(prev => prev.map((p, i) => 
      i === index ? { ...p, ...updates } : p
    ));
  };

  const handleSubmit = () => {
    if (pendingPhotos.length === 0) {
      toast.error('Adicione pelo menos uma foto');
      return;
    }

    if (!childName.trim()) {
      toast.error('Informe o nome do filho(a)');
      return;
    }

    const photos = pendingPhotos.map(p => ({
      url: p.preview,
      date,
      category,
      childName: childName.trim(),
      title: p.title || undefined,
      description: p.description || undefined,
      albumId: albumId !== 'none' ? albumId : undefined,
    }));

    onUpload(photos, onPhotosAdded);
    toast.success(`${photos.length} foto(s) adicionada(s) com sucesso!`);
    
    // Reset form
    setPendingPhotos([]);
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('sozinha');
    setChildName('');
    setAlbumId('none');
    setEditingIndex(null);
    onClose();
  };

  const handleClose = () => {
    setPendingPhotos([]);
    setEditingIndex(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Adicionar Fotos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">Clique para selecionar fotos</p>
            <p className="text-sm text-muted-foreground mt-1">ou arraste e solte aqui</p>
          </div>

          {/* Preview Grid with Edit Option */}
          {pendingPhotos.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Clique em uma foto para adicionar título e descrição
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {pendingPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-square rounded-lg overflow-hidden group cursor-pointer ring-2 transition-all ${
                      editingIndex === index ? 'ring-primary' : 'ring-transparent hover:ring-primary/50'
                    }`}
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  >
                    <img
                      src={photo.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {photo.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-foreground/70 text-primary-foreground text-xs p-1 truncate">
                        {photo.title}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>

              {/* Edit Selected Photo */}
              {editingIndex !== null && (
                <div className="bg-secondary/50 rounded-xl p-4 space-y-3 animate-scale-in">
                  <h4 className="font-medium text-sm">Detalhes da Foto {editingIndex + 1}</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Título (ex: Primeiro sorriso)"
                      value={pendingPhotos[editingIndex].title}
                      onChange={(e) => updatePhotoDetails(editingIndex, { title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Descrição (ex: Foi nesse dia que ela riu pela primeira vez...)"
                      value={pendingPhotos[editingIndex].description}
                      onChange={(e) => updatePhotoDetails(editingIndex, { description: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label>Data da Foto</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Category */}
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

            {/* Album */}
            <div className="space-y-2">
              <Label>Álbum (opcional)</Label>
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

            {/* Child Name */}
            <div className="space-y-2">
              <Label>Nome do Filho(a)</Label>
              {existingChildren.length > 0 && !isNewChild ? (
                <div className="flex gap-2">
                  <Select value={childName} onValueChange={setChildName}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingChildren.map((child) => (
                        <SelectItem key={child} value={child}>
                          {child}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsNewChild(true);
                      setChildName('');
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Novo
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do filho(a)"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="flex-1"
                  />
                  {existingChildren.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewChild(false)}
                    >
                      Existente
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="gradient-primary">
              <Image className="w-4 h-4 mr-2" />
              Salvar {pendingPhotos.length > 0 && `(${pendingPhotos.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
