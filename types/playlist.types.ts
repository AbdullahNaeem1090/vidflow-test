export interface IPlaylist{
  id: string;
  name: string;
  description: string;
  videosCount: number;
  image: string;
  category: "Public" | "Private" | "Personal";
  videoIds: string[];
}


export interface  PlaylistPreview {
  id: number
  title: string
  thumbnail: string
  videoCount: number
}
