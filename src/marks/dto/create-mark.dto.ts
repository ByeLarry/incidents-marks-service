export interface CreateMarkDto {
  userId: string;
  csrf_token: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  categoryId: number;
}
