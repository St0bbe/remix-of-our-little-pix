import { PhotoCategory, categoryLabels } from '@/types/photo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Users, Heart, Filter } from 'lucide-react';

interface PhotoFiltersProps {
  categoryFilter: PhotoCategory | 'all';
  childFilter: string | 'all';
  children: string[];
  onCategoryChange: (value: PhotoCategory | 'all') => void;
  onChildChange: (value: string | 'all') => void;
}

const categoryIcons: Record<PhotoCategory, React.ReactNode> = {
  'sozinha': <User className="w-4 h-4" />,
  'com-pais': <Heart className="w-4 h-4" />,
  'parentes-amigos': <Users className="w-4 h-4" />,
};

export const PhotoFilters = ({
  categoryFilter,
  childFilter,
  children,
  onCategoryChange,
  onChildChange,
}: PhotoFiltersProps) => {
  const categories: (PhotoCategory | 'all')[] = ['all', 'sozinha', 'com-pais', 'parentes-amigos'];

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-medium text-foreground">Filtros</h2>
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Categoria
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'secondary'}
                size="sm"
                onClick={() => onCategoryChange(cat)}
                className="gap-2 transition-all duration-200"
              >
                {cat !== 'all' && categoryIcons[cat]}
                {cat === 'all' ? 'Todas' : categoryLabels[cat]}
              </Button>
            ))}
          </div>
        </div>

        {/* Child Filter */}
        {children.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Filho(a)
            </label>
            <Select value={childFilter} onValueChange={onChildChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child} value={child}>
                    {child}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
