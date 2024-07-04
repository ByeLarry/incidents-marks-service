export interface MarkRecvDto {
  id: number;
  lat: number;
  lng: number;
  title: string;
  description: string;
  categoryId: number;
  createdAt: Date;
  userId: string;
  distance: number;
}
