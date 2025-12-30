import { useMemo } from 'react';
import { Photo, categoryLabels, PhotoCategory } from '@/types/photo';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Camera, Heart, Calendar, Users, TrendingUp } from 'lucide-react';

interface StatsViewProps {
  photos: Photo[];
  children: string[];
}

const COLORS = [
  'hsl(350, 60%, 65%)',
  'hsl(25, 80%, 70%)',
  'hsl(200, 70%, 50%)',
  'hsl(280, 60%, 60%)',
  'hsl(45, 80%, 50%)',
  'hsl(160, 60%, 45%)',
];

export const StatsView = ({ photos, children }: StatsViewProps) => {
  const stats = useMemo(() => {
    // Photos by month
    const byMonth: Record<string, number> = {};
    photos.forEach(p => {
      const monthKey = p.date.substring(0, 7);
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    });

    const monthData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({
        month: format(new Date(month + '-01'), 'MMM yy', { locale: ptBR }),
        fotos: count,
      }));

    // Photos by category
    const byCategory: Record<PhotoCategory, number> = {
      'sozinha': 0,
      'com-pais': 0,
      'parentes-amigos': 0,
    };
    photos.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });

    const categoryData = Object.entries(byCategory).map(([key, value]) => ({
      name: categoryLabels[key as PhotoCategory],
      value,
    }));

    // Photos by child
    const byChild: Record<string, number> = {};
    photos.forEach(p => {
      byChild[p.childName] = (byChild[p.childName] || 0) + 1;
    });

    const childData = Object.entries(byChild).map(([name, value]) => ({
      name,
      value,
    }));

    // Favorites count
    const favorites = photos.filter(p => p.isFavorite).length;

    // Most active month
    const mostActiveMonth = Object.entries(byMonth).sort(([, a], [, b]) => b - a)[0];

    return {
      monthData,
      categoryData,
      childData,
      favorites,
      totalPhotos: photos.length,
      mostActiveMonth: mostActiveMonth ? {
        month: format(new Date(mostActiveMonth[0] + '-01'), "MMMM 'de' yyyy", { locale: ptBR }),
        count: mostActiveMonth[1],
      } : null,
    };
  }, [photos]);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-xl font-medium mb-2">Sem estatísticas ainda</h3>
        <p className="text-muted-foreground">Adicione fotos para ver as estatísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Camera className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-3xl font-display font-bold text-foreground">{stats.totalPhotos}</p>
          <p className="text-sm text-muted-foreground">Total de Fotos</p>
        </Card>
        
        <Card className="p-4 text-center">
          <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-3xl font-display font-bold text-foreground">{stats.favorites}</p>
          <p className="text-sm text-muted-foreground">Favoritas</p>
        </Card>
        
        <Card className="p-4 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-3xl font-display font-bold text-foreground">{children.length}</p>
          <p className="text-sm text-muted-foreground">Filho(s)</p>
        </Card>
        
        <Card className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-lg font-display font-bold text-foreground capitalize">
            {stats.mostActiveMonth?.month.split(' ')[0]}
          </p>
          <p className="text-sm text-muted-foreground">
            Mês mais ativo ({stats.mostActiveMonth?.count})
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photos by Month */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Fotos por Mês
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="fotos" 
                  fill="hsl(350, 60%, 65%)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Photos by Category */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Fotos por Categoria
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {stats.categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Photos by Child */}
      {children.length > 1 && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-medium mb-4">Fotos por Filho(a)</h3>
          <div className="space-y-3">
            {stats.childData.map((child, index) => (
              <div key={child.name} className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-medium"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                >
                  {child.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{child.name}</span>
                    <span className="text-muted-foreground">{child.value} fotos</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${(child.value / stats.totalPhotos) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
