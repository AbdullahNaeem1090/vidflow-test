"use client"

import React, { useEffect, useState } from "react"
import { Music } from "lucide-react"
import { usePlaylistStore } from "@/Store/playlistStore"
import Loader from "@/page-components/Loader"
import { PlaylistCard } from "@/page-components/Playlists/playlist-card"
import { PlaylistVideo } from "@/page-components/MyChannel/PlaylistManager"
import { myAxios } from "@/lib/axios"
import HorizontalPlaylistVideoList from "@/page-components/Playlists/playlist-videos"
import { toast } from "sonner"

export default function PlaylistsPage() {
  const { getPlaylists, isFecthingPlaylists, Playlists, DeletePlaylist, ToggleVideoInPlaylist } =
    usePlaylistStore()

  const [currentPlaylistVideos, setCurrentPlaylistVideos] = useState<PlaylistVideo[]>([])
  const [isFetchingVideos, setIsFetchingVideos] = useState(false)
  const [activePlaylistName, setActivePlaylistName] = useState<string | null>(null)
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)

  useEffect(() => {
    getPlaylists("Personal")
  }, [getPlaylists])

  const getPlaylistVideos = async (playlistId: string, name: string) => {
    try {
      setIsFetchingVideos(true)
      setActivePlaylistName(name)
      setActivePlaylistId(playlistId)


      const { data } = await myAxios.get(
        `/playlist/playlistVideos/${playlistId}`
      )

      if (data.success) {
        setCurrentPlaylistVideos(data.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsFetchingVideos(false)
    }
  }


   const removeVideo = (videoId: string) => {

    if(!activePlaylistId) return;
    ToggleVideoInPlaylist(activePlaylistId, videoId);
    setCurrentPlaylistVideos((prev) =>
      prev.filter((v) => v.id !== videoId)
    );
    toast.success("Video removed");
  };


  if (isFecthingPlaylists) return <Loader />

  return (
    <main className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-10 space-y-14">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Your Playlists</h1>
          <p className="text-muted-foreground mt-1">
            Manage and play your collections
          </p>
        </div>

        {/* Playlists Grid */}
        {Playlists.Personal.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Playlists.Personal.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() =>
                  getPlaylistVideos(playlist.id, playlist.name)
                }
              >
                <PlaylistCard
                  {...playlist}
                  onDelete={() => DeletePlaylist(playlist.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No playlists yet</p>
          </div>
        )}

        {/* Playlist Videos Section */}
        {activePlaylistName && (
          <section className="p-8 border border-border rounded-3xl ">
            <h2 className="text-xl font-semibold mb-4">
              {activePlaylistName}
            </h2>

            {isFetchingVideos ? (
              <Loader />
            ) : (
              <HorizontalPlaylistVideoList canRemove={true} videos={currentPlaylistVideos} onRemove={removeVideo} />
            )}
          </section>
        )}
      </div>
    </main>
  )
}
