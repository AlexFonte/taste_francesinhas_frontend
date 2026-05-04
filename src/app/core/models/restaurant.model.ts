export interface Restaurant {
  id: number;
  proposedByEmail: string;
  name: string;
  address?: string;
  city: string;
  phone?: string;
  totalFrancesinhas: number;
  createdAt: string;
}

export interface RestaurantRequest {
  name:     string;
  city:     string;
  address?: string;
  phone?:   string;
}