export interface UserData {
    email: string;
    name?: string;
    photoURL?: string;
  }

export interface OutfitItem {
  id: string;
  name: string;
  dateCreated: string;
}

export interface ClosetStats {
 totalOutfits: number;
}