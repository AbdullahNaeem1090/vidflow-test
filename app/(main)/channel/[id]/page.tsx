"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/page-components/Other-Channels/video-cards";
import { PlaylistCard } from "@/page-components/Other-Channels/playlist-card";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { myAxios } from "@/lib/axios";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ChannelVideo } from "@/types/video.types";
import { PlaylistPreview } from "@/types/playlist.types";
import Loader from "@/page-components/Loader";

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
  const { id } = useParams();
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [channelData, setChannelData] = useState<channelData | null>(null);
  const [subscribed, setSubscribed] = useState<boolean>(false);

  console.log(channelData?.isSubscribed);

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
            src={channelData.bannerImage|| "/banner.png"}
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
                className="rounded-none border-b-2 border-transparent px-2 pb-4 pt-2 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                Videos
              </TabsTrigger>
              <TabsTrigger
                value="playlists"
                className="rounded-none border-b-2 border-transparent px-2 pb-4 pt-2 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                Playlists
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="rounded-none border-b-2 border-transparent px-2 pb-4 pt-2 text-base font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="mt-8">
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {channelData.videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="playlists" className="mt-8">
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {channelData.playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-8">
              <div className="mx-auto max-w-3xl py-8">
                <h2 className="text-2xl font-bold">About {channelData.name}</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Im a developer passionate about crafting accessible,
                  pixel-perfect user interfaces that blend thoughtful design
                  with robust engineering. My favorite work lies at the
                  intersection of design and development, creating experiences
                  that not only look great but are meticulously built for
                  performance and usability.
                </p>
                <div className="mt-8 border-t pt-8">
                  <h3 className="font-semibold">Stats</h3>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium">Oct 12, 2018</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total views</p>
                      <p className="font-medium">12,456,789 views</p>
                    </div>
                  </div>
                </div>
              </div>
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
