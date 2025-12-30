import { Heart } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <Heart className="w-6 h-6 text-primary fill-primary" />
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
            Álbum da Família
          </h1>
          <Heart className="w-6 h-6 text-primary fill-primary" />
        </div>
      </div>
    </header>
  );
};
