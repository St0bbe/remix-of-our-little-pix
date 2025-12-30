import { Heart, User } from 'lucide-react';

interface HeaderProps {
  userEmail?: string;
}

export const Header = ({ userEmail }: HeaderProps) => {
  // Extract name from email (before @)
  const userName = userEmail ? userEmail.split('@')[0] : '';
  
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center justify-center gap-3">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
              Álbum da Família
            </h1>
            <Heart className="w-6 h-6 text-primary fill-primary" />
          </div>
          <div className="flex-1 flex justify-end">
            {userName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline capitalize">{userName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
