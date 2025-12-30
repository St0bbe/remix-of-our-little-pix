export type PhotoCategory = 'sozinha' | 'com-pais' | 'parentes-amigos';

export type ChildName = string;

export interface Photo {
  id: string;
  url: string;
  date: string;
  category: PhotoCategory;
  childName: ChildName;
  title?: string;
  description?: string;
  albumId?: string;
  createdAt: string;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  color: string;
  icon: string;
  createdAt: string;
}

export const categoryLabels: Record<PhotoCategory, string> = {
  'sozinha': 'Sozinha',
  'com-pais': 'Com os Pais',
  'parentes-amigos': 'Parentes e Amigos',
};

export const defaultAlbums: Omit<Album, 'id' | 'createdAt'>[] = [
  { name: 'Aniversários', color: 'hsl(350, 60%, 65%)', icon: 'cake' },
  { name: 'Natal', color: 'hsl(0, 70%, 45%)', icon: 'gift' },
  { name: 'Viagens', color: 'hsl(200, 70%, 50%)', icon: 'plane' },
  { name: 'Primeiros Momentos', color: 'hsl(280, 60%, 60%)', icon: 'baby' },
  { name: 'Escola', color: 'hsl(45, 80%, 50%)', icon: 'graduation-cap' },
];
