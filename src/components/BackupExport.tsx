import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Photo, Album } from '@/types/photo';
import { Download, FileArchive, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface BackupExportProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  albums: Album[];
}

export const BackupExport = ({ isOpen, onClose, photos, albums }: BackupExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const exportBackup = async () => {
    if (photos.length === 0) {
      toast.error('Não há fotos para exportar');
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setStatus('Preparando backup...');

    try {
      const zip = new JSZip();
      const photosFolder = zip.folder('fotos');
      const dataFolder = zip.folder('dados');

      // Export metadata
      setStatus('Exportando metadados...');
      const metadata = {
        exportDate: new Date().toISOString(),
        totalPhotos: photos.length,
        albums: albums,
        photos: photos.map(p => ({
          ...p,
          url: undefined, // Remove base64 from metadata
          fileName: `${p.id}.jpg`
        }))
      };
      dataFolder?.file('metadata.json', JSON.stringify(metadata, null, 2));
      setProgress(10);

      // Export photos
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setStatus(`Exportando foto ${i + 1} de ${photos.length}...`);
        
        // Extract base64 data
        const base64Data = photo.url.split(',')[1];
        if (base64Data) {
          const fileName = `${photo.date}_${photo.childName.replace(/\s/g, '-')}_${photo.id.slice(0, 8)}.jpg`;
          photosFolder?.file(fileName, base64Data, { base64: true });
        }
        
        setProgress(10 + Math.floor((i + 1) / photos.length * 80));
      }

      // Generate ZIP
      setStatus('Gerando arquivo ZIP...');
      setProgress(90);
      
      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      // Download
      setStatus('Iniciando download...');
      setProgress(100);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `album-familia-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Backup exportado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar backup');
    } finally {
      setIsExporting(false);
      setProgress(0);
      setStatus('');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Estimate size (rough calculation)
  const estimatedSize = photos.reduce((acc, p) => {
    const base64 = p.url.split(',')[1];
    return acc + (base64 ? base64.length * 0.75 : 0);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <FileArchive className="w-6 h-6 text-primary" />
            Exportar Backup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isExporting ? (
            <>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium">O backup incluirá:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {photos.length} foto{photos.length !== 1 ? 's' : ''} em alta qualidade
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {albums.length} álbum{albums.length !== 1 ? 's' : ''}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Títulos, descrições e datas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Categorias e favoritos
                  </li>
                </ul>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Tamanho estimado: ~{formatSize(estimatedSize)}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={exportBackup} 
                  className="flex-1 gradient-primary"
                  disabled={photos.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-medium">{status}</p>
                <p className="text-sm text-muted-foreground mt-1">{progress}%</p>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
