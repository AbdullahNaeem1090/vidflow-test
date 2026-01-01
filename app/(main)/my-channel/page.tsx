"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelHeader } from "@/page-components/MyChannel/channel-header";
import { useAuthStore } from "@/Store/authStore";
import { VideoGrid } from "@/page-components/MyChannel/video-grid";
import { PlaylistManager } from "@/page-components/MyChannel/PlaylistManager";
import { usePlaylistStore } from "@/Store/playlistStore";
import Loader from "@/page-components/Loader";
import { useVideoStore } from "@/Store/videoStore";
import { myAxios } from "@/lib/axios";

export default function MyChannelPage() {
  const [activeTab, setActiveTab] = useState<"videos" | "playlists">("videos");
  const { isGettingChannelData, currUser } = useAuthStore();
  const { HomeVideos } = useVideoStore();
  const { getPlaylists } = usePlaylistStore();
  const [subscribersCount, setSubscribersCount] = useState<number>(0);

  const videos =
    HomeVideos.filter((video) => video.channel === currUser?.username) ?? [];

  // Separate effect for subscribers
  useEffect(() => {
    const getSubscribers = async () => {
      if (!currUser?._id) return;
      
      try {
        const { data } = await myAxios.get(`/subscription/count/${currUser._id}`);
        if (data.success) {
          console.log(data.subscribers)
          setSubscribersCount(data.subscribers);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getSubscribers();
  }, [currUser?._id]);

  // Separate effect for playlists
  useEffect(() => {
    getPlaylists("Public,Private");
  }, []); // Empty dependency array - only run once on mount


  if (isGettingChannelData) {
    return <Loader />;
  }

  return (
    <main className="min-h-screen w-full bg-background">
      {/* Channel Header */}
      <ChannelHeader subscribersCount={subscribersCount} />

      {/* Content Section */}
      <div className=" md:px-8 lg:px-12 py-8">
        <div className="w-full mx-auto">
          {/* Tabs Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "videos" | "playlists")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-xs bg-muted">
              <TabsTrigger
                value="videos"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Videos
              </TabsTrigger>
              <TabsTrigger
                value="playlists"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Playlists
              </TabsTrigger>
            </TabsList>

            {/* Videos Tab Content */}
            <TabsContent value="videos" className="mt-8">
              <VideoGrid videos={videos} />
            </TabsContent>

            {/* Playlists Tab Content */}
            <TabsContent value="playlists" className="mt-8">
              <PlaylistManager ChannelVideos={videos} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}