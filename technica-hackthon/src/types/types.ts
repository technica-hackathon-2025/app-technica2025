export interface UserData {
    email: string;
    name?: string;
    photoURL?: string;
  }

export interface OutfitItem {
  id: string;
  imageUrl: string;
  name: string;
  category?: string;
  dateCreated: Date;
  tags?: string[];
}

export interface ClosetStats {
  totalItems: number;
  totalOutfits: number;
  favoriteItems: number;
  recentlyAdded: number;
}