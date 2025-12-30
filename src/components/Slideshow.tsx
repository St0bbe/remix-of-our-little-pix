import { useState, useEffect, useCallback } from 'react';
import { Photo } from '@/types/photo';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Play, Pause, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SlideshowProps {
  photos: Photo[];
  isOpen: boolean;
  onClose: () => void;
  startIndex?: number;
}

export const Slideshow = ({ photos, isOpen, onClose, startIndex = 0 }: SlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const currentPhoto = photos[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Auto-advance
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const interval = setInterval(goNext, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, isOpen, goNext]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goNext, goPrev, onClose]);

  // Hide controls after inactivity
  useEffect(() => {
    if (!isOpen) return;

    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
      setIsPlaying(true);
    }
  }, [isOpen, startIndex]);

  if (!isOpen || photos.length === 0) return null;

  const formattedDate = currentPhoto 
    ? format(new Date(currentPhoto.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-foreground">
      {/* Photo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          key={currentPhoto.id}
          src={currentPhoto.url}
          alt={currentPhoto.title || currentPhoto.childName}
          className="max-w-full max-h-full object-contain animate-fade-in"
        />
      </div>

      {/* Overlay gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-foreground/50 via-transparent to-foreground/70 pointer-events-none transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Top controls */}
      <div 
        className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-start transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          {currentPhoto.isFavorite && (
            <Heart className="w-6 h-6 text-primary fill-primary" />
          )}
          <span className="text-primary-foreground font-medium">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>
        
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Side navigation */}
      <button
        onClick={goPrev}
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-all ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={goNext}
        className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-all ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Bottom info & controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-2xl mx-auto text-center">
          {/* Photo info */}
          <div className="mb-4">
            <h2 className="font-display text-2xl font-semibold text-primary-foreground mb-1">
              {currentPhoto.title || currentPhoto.childName}
            </h2>
            {currentPhoto.description && (
              <p className="text-primary-foreground/80 mb-2">{currentPhoto.description}</p>
            )}
            <p className="text-primary-foreground/60 text-sm">{formattedDate}</p>
          </div>

          {/* Play/Pause */}
          <div className="flex justify-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Reproduzir
                </>
              )}
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-4 flex-wrap max-w-md mx-auto">
            {photos.slice(0, 20).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-primary-foreground/40 hover:bg-primary-foreground/60'
                }`}
              />
            ))}
            {photos.length > 20 && (
              <span className="text-primary-foreground/60 text-xs ml-2">
                +{photos.length - 20}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
