import { useState } from 'react';
import { Photo } from '@/types/photo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Printer, Grid, LayoutGrid, Square } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrintModeProps {
  photos: Photo[];
  isOpen: boolean;
  onClose: () => void;
}

type LayoutType = '1' | '2' | '4' | '6' | '9';

export const PrintMode = ({ photos, isOpen, onClose }: PrintModeProps) => {
  const [layout, setLayout] = useState<LayoutType>('4');
  const [showTitles, setShowTitles] = useState(true);
  const [showDates, setShowDates] = useState(true);
  const [showBorders, setShowBorders] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getGridClass = () => {
    switch (layout) {
      case '1': return 'grid-cols-1';
      case '2': return 'grid-cols-2';
      case '4': return 'grid-cols-2';
      case '6': return 'grid-cols-3';
      case '9': return 'grid-cols-3';
      default: return 'grid-cols-2';
    }
  };

  const getPhotoSize = () => {
    switch (layout) {
      case '1': return 'aspect-[4/3]';
      case '2': return 'aspect-square';
      case '4': return 'aspect-square';
      case '6': return 'aspect-square';
      case '9': return 'aspect-square';
      default: return 'aspect-square';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Controls - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
            <h2 className="font-display text-xl font-medium">Modo de Impressão</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Layout selector */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Layout:</Label>
              <Select value={layout} onValueChange={(v) => setLayout(v as LayoutType)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <span className="flex items-center gap-2">
                      <Square className="w-4 h-4" /> 1 foto
                    </span>
                  </SelectItem>
                  <SelectItem value="2">
                    <span className="flex items-center gap-2">
                      <Grid className="w-4 h-4" /> 2 fotos
                    </span>
                  </SelectItem>
                  <SelectItem value="4">
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" /> 4 fotos
                    </span>
                  </SelectItem>
                  <SelectItem value="6">
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" /> 6 fotos
                    </span>
                  </SelectItem>
                  <SelectItem value="9">
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" /> 9 fotos
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={showTitles} onCheckedChange={setShowTitles} id="titles" />
                <Label htmlFor="titles" className="text-sm">Títulos</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showDates} onCheckedChange={setShowDates} id="dates" />
                <Label htmlFor="dates" className="text-sm">Datas</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showBorders} onCheckedChange={setShowBorders} id="borders" />
                <Label htmlFor="borders" className="text-sm">Bordas</Label>
              </div>
            </div>

            <Button onClick={handlePrint} className="gradient-primary">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Print Preview */}
      <div className="container mx-auto p-8 print:p-0">
        <div className={`grid ${getGridClass()} gap-4 print:gap-2`}>
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className={`bg-card rounded-lg overflow-hidden print:rounded-none ${
                showBorders ? 'border-2 border-border print:border print:border-gray-300' : ''
              }`}
            >
              <div className={`${getPhotoSize()} overflow-hidden`}>
                <img
                  src={photo.url}
                  alt={photo.title || photo.childName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {(showTitles || showDates) && (
                <div className="p-2 print:p-1 text-center">
                  {showTitles && (
                    <p className="font-medium text-sm print:text-xs truncate">
                      {photo.title || photo.childName}
                    </p>
                  )}
                  {showDates && (
                    <p className="text-xs text-muted-foreground print:text-gray-500">
                      {format(new Date(photo.date), "d 'de' MMM, yyyy", { locale: ptBR })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-20 print:hidden">
            <p className="text-muted-foreground">Nenhuma foto selecionada para impressão</p>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          @page {
            margin: 0.5cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};
