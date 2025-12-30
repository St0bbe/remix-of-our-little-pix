export type PhotoCategory = 'sozinha' | 'com-pais' | 'parentes-amigos';

export type ChildName = string;

export interface Photo {
  id: string;
  url: string;
  date: string;
  category: PhotoCategory;
  childName: ChildName;
  createdAt: string;
}

export const categoryLabels: Record<PhotoCategory, string> = {
  'sozinha': 'Sozinha',
  'com-pais': 'Com os Pais',
  'parentes-amigos': 'Parentes e Amigos',
};
