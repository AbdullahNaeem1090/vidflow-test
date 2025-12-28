import { myAxios } from "@/lib/axios";
import type { IPlaylist } from "@/types/playlist.types";
import { toast } from "sonner";
import { create } from "zustand";

interface IPlaylistStore {
  getPlaylists: (categories: string) => void;
  Playlists:{
    Personal:IPlaylist[],
    PublicAndPrivate:IPlaylist[]
  }
  isFecthingPlaylists: boolean;
  CreatePlaylist: (
    playlistName: string,
    category: "Public" | "Private" | "Personal",
    tempPlaylist: IPlaylist
  ) => Promise<void>;
  ToggleVideoInPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  removeVideoFromAllPlaylists: (videoId: string) => void;
  DeletePlaylist: (playlistId: string) => Promise<void>;
  isCreatingPlaylist?: boolean;
  UpdatePlaylist:(playlistId: string, updates: { title?: string; category?: "Public" | "Private" | "Personal" }) => Promise<void>;
}

export const usePlaylistStore = create<IPlaylistStore>((set) => ({
  isFecthingPlaylists: false,
  Playlists:{
    Personal:[],
    PublicAndPrivate:[]
  },

  isCreatingPlaylist: false,

  // getPlaylists: async (categories) => {
  //   try {
  //     // Convert array → "Public,Private"
  //     set({ isFecthingPlaylists: true });
  //     const { data } = await myAxios.get(`/playlist?category=${categories}`);

  //     if (data.success) {
  //       set({ PersonalPlaylists: data.data });
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch playlists:", error);
  //   } finally {
  //     set({ isFecthingPlaylists: false });
  //   }
  // },


  getPlaylists: async (categories: string) => {
  try {
    set({ isFecthingPlaylists: true })

    const { data } = await myAxios.get(
      `/playlist?category=${categories}`
    )

    if (data.success) {
      const categoryArray = categories.split(",")

      set((state) => {
        const updates: Partial<typeof state.Playlists> = {}

        if (categoryArray.includes("Personal")) {
          updates.Personal = data.data.filter(
            (p: IPlaylist) => p.category === "Personal"
          )
        }

        if (
          categoryArray.includes("Public") ||
          categoryArray.includes("Private")
        ) {
          updates.PublicAndPrivate = data.data.filter(
            (p: IPlaylist) =>
              p.category === "Public" || p.category === "Private"
          )
        }

        return {
          Playlists: {
            ...state.Playlists,
            ...updates,
          },
        }
      })
    }
  } catch (error) {
    console.error("Failed to fetch playlists:", error)
  } finally {
    set({ isFecthingPlaylists: false })
  }
},


 CreatePlaylist: async (
  playlistName: string,
  category: "Public" | "Private" | "Personal",
  tempPlaylist: IPlaylist
) => {
  try {
    set({ isCreatingPlaylist: true })
    const { data } = await myAxios.post(`/playlist/create`, {
      title: playlistName,
      category,
      videoId: tempPlaylist.videoIds[0] ?? "",
    })

    if (data.success) {
      const createdPlaylist: IPlaylist = {
        ...tempPlaylist,
        id: data.data._id,
        category,
      }

      set((state) => {
        if (category === "Personal") {
          return {
            Playlists: {
              ...state.Playlists,
              Personal: [...state.Playlists.Personal, createdPlaylist],
            },
          }
        }

        // Public or Private
        return {
          Playlists: {
            ...state.Playlists,
            PublicAndPrivate: [
              ...state.Playlists.PublicAndPrivate,
              createdPlaylist,
            ],
          },
        }
      })
      toast.success("Playlist created")
    }
  } catch (error) {
    console.error("Failed to create playlist:", error)
  }finally{
    set({ isCreatingPlaylist: false })
  }
},

removeVideoFromAllPlaylists: (videoId: string) =>
  set((state) => ({
    Playlists: {
      Personal: state.Playlists.Personal.map((playlist) => ({
        ...playlist,
        videos: playlist.videoIds.filter(
          (id) => id !== videoId
        ),
      })),
      PublicAndPrivate: state.Playlists.PublicAndPrivate.map((playlist) => ({
        ...playlist,
        videos: playlist.videoIds.filter(
          (id) => id !== videoId
        ),
      })),
    },
  })),


  DeletePlaylist: async (playlistId: string) => {
  try {
    const { data } = await myAxios.delete(`/playlist/${playlistId}`)

    if (data.success) {
      set((state) => ({
        Playlists: {
          Personal: state.Playlists.Personal.filter(
            (p) => p.id !== playlistId
          ),
          PublicAndPrivate: state.Playlists.PublicAndPrivate.filter(
            (p) => p.id !== playlistId
          ),
        },
      }))
      toast.success("Playlist deleted")
    }
  } catch (error) {
    console.error("Failed to delete playlist:", error)
  }
},

  ToggleVideoInPlaylist: async (playlistId: string, videoId: string) => {
  try {

    const { data } = await myAxios.post(
      `/playlist/${playlistId}/toggle`,
      { videoId }
    )

    if (data.success) {
      set((state) => {
        const update = (playlists: IPlaylist[]) =>
          playlists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist

            const alreadyExists = playlist.videoIds.includes(videoId)

            return {
              ...playlist,
              videoIds: alreadyExists
                ? playlist.videoIds.filter((id) => id !== videoId)
                : [...playlist.videoIds, videoId],
              videosCount: alreadyExists
                ? playlist.videosCount - 1
                : playlist.videosCount + 1,
            }
          })

        return {
          Playlists: {
            Personal: update(state.Playlists.Personal),
            PublicAndPrivate: update(state.Playlists.PublicAndPrivate),
          },
        }
      })
    }
  } catch (error) {
    console.error("Failed to toggle video in playlist:", error)
  }
},

UpdatePlaylist: async (
  playlistId: string,
  updates: { title?: string; category?: "Public" | "Private" | "Personal" }
) => {
  try {
    const { data } = await myAxios.put(
      `/playlist/${playlistId}`,
      updates
    )

    if (data.success) {
      set((state) => {
        const updatePlaylist = (list: IPlaylist[]) =>
          list.map((p) =>
            p.id === playlistId
              ? { ...p, name: updates.title ?? p.name, category: updates.category ?? p.category }
              : p
          )

        let personal = updatePlaylist(state.Playlists.Personal)
        let pubPriv = updatePlaylist(state.Playlists.PublicAndPrivate)

        const movedFromPersonal = state.Playlists.Personal.find(p => p.id === playlistId)
        const movedFromPubPriv = state.Playlists.PublicAndPrivate.find(p => p.id === playlistId)

        if (updates.category) {
          if (updates.category === "Personal" && movedFromPubPriv) {
            pubPriv = pubPriv.filter(p => p.id !== playlistId)
            personal = [...personal, { ...movedFromPubPriv, ...updates }]
          }

          if (
            (updates.category === "Public" || updates.category === "Private") &&
            movedFromPersonal
          ) {
            personal = personal.filter(p => p.id !== playlistId)
            pubPriv = [...pubPriv, { ...movedFromPersonal, ...updates }]
          }
        }

        return {
          Playlists: {
            Personal: personal,
            PublicAndPrivate: pubPriv,
          },
        }
      })
    }
  } catch (error) {
    console.error("Failed to update playlist:", error)
  }
}




}));
