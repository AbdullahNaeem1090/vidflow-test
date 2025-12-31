"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/page-components/Other-Channels/video-cards";
import { PlaylistCard } from "@/page-components/Other-Channels/playlist-card";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { myAxios } from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChannelVideo } from "@/types/video.types";
import { PlaylistPreview } from "@/types/playlist.types";
import Loader from "@/page-components/Loader";
import { PlaylistVideo } from "@/page-components/Playlists/playlist-videos";
import HorizontalPlaylistVideoList from "@/page-components/Playlists/playlist-videos";

interface channelData {
  name: string;
  subscribers: string;
  profilePic: string;
  bannerImage: string;
  isSubscribed: boolean;
  videos: ChannelVideo[];
  playlists: PlaylistPreview[];
}

export default function ChannelPage() {
  const router=useRouter()
  const { id } = useParams();
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [channelData, setChannelData] = useState<channelData | null>(null);
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const [currentPlaylistVideos, setCurrentPlaylistVideos] = useState<
    PlaylistVideo[]
  >([]);
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);
  const [activePlaylistName, setActivePlaylistName] = useState<string | null>(
    null
  );

  const getChannelData = useCallback(async () => {
    setIsFetchingData(true);

    try {
      const { data } = await myAxios.get(`/auth/channel/${id}`);

      if (data.success) {
        setChannelData(data.data);
        setSubscribed(data.data.isSubscribed);
      }
    } catch (error) {
      console.log("error", error);
      toast.warning("Failed to load channel data");
    } finally {
      setIsFetchingData(false);
    }
  }, [id]);

  const getPlaylistVideos = async (playlistId: string, name: string) => {
    try {
      setIsFetchingVideos(true);
      setActivePlaylistName(name);

      const { data } = await myAxios.get(
        `/playlist/playlistVideos/${playlistId}`
      );

      if (data.success) {
        setCurrentPlaylistVideos(data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetchingVideos(false);
    }
  };

  async function toggleSubscribe() {
    try {
      const { data } = await myAxios.post("/subscription/toggle", {
        channelId: id,
      });
      if (data.success) {
        setSubscribed((s) => !s);
        setChannelData((prev) =>
          prev ? { ...prev, isSubscribed: !prev.isSubscribed } : null
        );
      }
    } catch (error) {
      console.error("Subscription toggle error:", error);
    }
  }

  useEffect(() => {
    if (!id) return;
    getChannelData();
  }, [id, getChannelData]);

  if (isFetchingData || !channelData) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Banner Section */}
      <div className="relative h-[20vh] min-h-40 w-full overflow-hidden md:h-[25vh] rounded-2xl">
        {channelData.bannerImage ? (
          <Image
            height={200}
            width={500}
            src={channelData.bannerImage || "/banner.png"}
            alt="Channel Banner"
            className="h-full w-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
          />
        ) : (
          <Image
            height={200}
            width={500}
            src={"/banner.png"}
            alt="Channel Banner"
            unoptimized
            className="h-full w-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-12 flex flex-col items-center gap-6 sm:-mt-16 sm:flex-row sm:items-end">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl sm:h-40 sm:w-40">
            <AvatarImage
              src={channelData.profilePic || "/user.png"}
              alt={channelData.name}
              className="object-cover"
            />
            <AvatarFallback>{channelData.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:pb-4 sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {channelData.name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {channelData.subscribers} subscribers
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Button
                onClick={toggleSubscribe}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0 gap-8">
              <TabsTrigger
                value="videos"
                className="rounded-t-lg border-b-2 border-transparent px-2 pb-4 pt-2 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                Videos
              </TabsTrigger>
              <TabsTrigger
                value="playlists"
                className="rounded-t-lg border-b-2 border-transparent px-2 pb-4 pt-2 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                Playlists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="mt-8">
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {channelData.videos.map((video) => (
                  <div key={video.id} onClick={()=>router.push(`watch-video/${video.id}`)}>
                  <VideoCard  video={video} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="playlists" className="mt-8">
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {channelData.playlists.map((playlist, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      getPlaylistVideos(playlist.id, playlist.title)
                    }
                  >
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  </div>
                ))}
              </div>
              {activePlaylistName && (
                <section className=" mt-5 p-8 border border-border rounded-3xl ">
                  <h2 className="text-xl font-semibold mb-4">
                    {activePlaylistName}
                  </h2>

                  {isFetchingVideos ? (
                    <Loader />
                  ) : (
                    <HorizontalPlaylistVideoList
                      canRemove={false}
                      videos={currentPlaylistVideos}
                      onRemove={() => {}}
                    />
                  )}
                </section>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="mt-20 border-t py-12 text-center text-sm text-muted-foreground">
        <p>© 2025 {channelData.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
