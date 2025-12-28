import { UploadResult } from "@/hooks/uploader";
import { myAxios } from "@/lib/axios";
import type { IComment, ICurrentVideo, IHomeVideo, VideoUploadFormData } from "@/types/video.types";
import type { DeepPartial } from "react-hook-form";
import { toast } from "sonner";
import { create } from "zustand";


type TVideoStore = {

  SaveVideo: (
    uploadFile: (file: File, bucket?: string) => Promise<UploadResult>,
    formdata: VideoUploadFormData,
    reset: (values?: DeepPartial<VideoUploadFormData>) => void
  ) => Promise<void>;
  
  HomeVideos: IHomeVideo[];
  nextCursor: string | null;
  isfetchingHomeVideos: boolean;
  hasMore: boolean;
  
  fetchVideos: () => Promise<void>;

  fetchCurrentVideo:(id:string)=>void
  isFetchingCurrVideo:boolean;
  CurrentVideo: null | ICurrentVideo;

  VideoComments:IComment[]
  isFetchingComments:boolean;
  removeVideo:(id:string)=>void

  GetVideoComments:(videoId:string)=>Promise<void>
  CreateComment:(videoId:string,text:string,username:string,avatar:string|undefined)=>Promise<void>
  deleteComment:(commentId:string)=>Promise<void>
};

export const useVideoStore = create<TVideoStore>((set, get) => ({
  
  HomeVideos: [],
  nextCursor: null,
  isfetchingHomeVideos: false,
  hasMore: true,
  isFetchingCurrVideo:false,
  CurrentVideo:null,
  isFetchingComments:false,
VideoComments:[],

  SaveVideo: async (uploadFile, formdata, reset) => {
    try {
      const { publicUrl: VidUrl } = await uploadFile(formdata.video, "Videos");
      const { publicUrl: ThumbnailUrl } = await uploadFile(
        formdata.thumbnail,
        "thumbnails"
      );

      console.log("Uploaded video:", VidUrl);
      console.log("Uploaded thumbnail:", ThumbnailUrl);

      const videoData = {
        title: formdata.title,
        description: formdata.description,
        videoURL: VidUrl,
        thumbnail: ThumbnailUrl,
        duration: formdata.duration,
      };
      const { data } = await myAxios.post("/video/save-video", videoData);

      console.log(data);
      if (data.success) {
        reset();
        toast.success("Upload completed successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  },

  fetchVideos: async () => {
    const { isfetchingHomeVideos, hasMore, nextCursor, HomeVideos } = get();
    if (isfetchingHomeVideos || !hasMore) return;

    set({ isfetchingHomeVideos: true });

    try {
      const { data } = await myAxios.get(
        `/video/get-videos/${nextCursor || ""}`
      );
      const newVideos = data.data.videos;
      const newCursor = data.data.nextCursor;

      set({
        HomeVideos: [...HomeVideos, ...newVideos],
        nextCursor: newCursor,
        hasMore: !!newCursor,
      });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isfetchingHomeVideos: false });
    }
  },

  removeVideo: (id) =>
    set((state) => ({
      HomeVideos: state.HomeVideos.filter(video => video.id !== id),
    })),

  fetchCurrentVideo: async (videoId) => {
 
    try {
      set({isFetchingCurrVideo:true})
      const {data}=await myAxios.get(`/video/watch/${videoId}`);
      if(data.success){
        await myAxios.post('/history',{videoId:videoId});
        set({CurrentVideo:data.data})
      }
    } catch (error) {
      console.log(error); 
    }finally{
      set({isFetchingCurrVideo:false})
    }

  },

  GetVideoComments:async(id)=>{
    try {
      set({isFetchingComments:true})
      const {data}=await myAxios.get(`/comment/${id}`);
      if(data.success){
        set({VideoComments:data.data})
      }
    } catch (error) {
      console.log(error);
    }finally{
      set({isFetchingComments:false})
    }
  },

  CreateComment: async (videoId, text,username,avatar) => {
    try {
      const { data } = await myAxios.post("/comment", { videoId, comment:text });
      if (data.success) {
        // Optionally update local state or refetch comments
        toast.success("Comment added successfully!");
        const newComment={
          id: data.data._id,
          author: username,
          avatar: avatar??"",
          time: "Just now",
          text: text
        }
        set((state) => ({
          VideoComments: [newComment, ...state.VideoComments],
        }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  },

  deleteComment: async (commentId) => {
    try {
      const { data } = await myAxios.delete(`/comment/${commentId}`);
      if (data.success) {
        set((state) => ({
          VideoComments: state.VideoComments.filter(
            (comment) => comment.id !== commentId
          ),
        }));
        toast.success("Comment deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  },

  // resetVideos: () => set({ HomeVideos: [], nextCursor: null, hasMore: true }),
}));
