"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileVideo, ImageIcon } from "lucide-react"
import { useUploader } from "@/hooks/uploader"
import { zodResolver } from "@hookform/resolvers/zod"
import { videoUploadSchema } from "@/zod/video-schema"
import type { VideoUploadFormData } from "@/types/video.types"
import { useVideoStore } from "@/Store/videoStore"
import { toast } from "sonner"


export function VideoUploadForm() {

    const form = useForm<VideoUploadFormData>({
    resolver: zodResolver(videoUploadSchema),
  })

  const { uploadFile, cancelUpload, progress, isUploading } = useUploader()
  const {SaveVideo}=useVideoStore()



  // const [videoPreview, setVideoPreview] = useState<string>("")
  // const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
 function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.src = url;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration); // duration in seconds
    };

    video.onerror = () => {
      reject("Failed to load video metadata");
    };
  });
}
const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    form.setValue("video", file);

    try {
      const duration = await getVideoDuration(file);
      form.setValue("duration", duration);
    } catch (err) {
      console.error(err);
    }

  }
};

const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("thumbnail", file)
      // setThumbnailPreview(URL.createObjectURL(file))
    }
  }
 


  const onSubmit = async (data: VideoUploadFormData) => {
    toast.info("If Upload Successfull , Reload the app to see the fresh content.")
    await SaveVideo(uploadFile,data,form.reset)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Upload Your Video</h1>
        <p className="text-muted-foreground text-lg">Share your content with the world</p>
      </div>

      <Card className="p-6 md:p-8 border-border">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Video Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Video File</Label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              disabled={isUploading}
              className="hidden"
              id="video-input"
            />
            <label htmlFor="video-input" className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer">
              <FileVideo className="w-8 h-8 text-muted-foreground mb-2" />
              <span>{form.watch("video")?.name || "Click to upload"}</span>
            </label>
            {form.formState.errors.video && (
              <p className="text-sm text-destructive">{form.formState.errors.video.message}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Thumbnail Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              disabled={isUploading}
              className="hidden"
              id="thumbnail-input"
            />
            <label htmlFor="thumbnail-input" className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer">
              <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <span>{form.watch("thumbnail")?.name || "Click to upload"}</span>
            </label>
            {form.formState.errors.thumbnail && (
              <p className="text-sm text-destructive">{form.formState.errors.thumbnail.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-3">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              placeholder="Enter title"
              disabled={isUploading}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={4}
              disabled={isUploading}
              {...form.register("description")}
              className="w-full px-3 py-2 border rounded-md"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
              <div className="flex justify-between">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isUploading} className="flex-1">
              {isUploading ? "Uploading..." : "Upload Video"}
            </Button>
            {isUploading && (
              <Button type="button" variant="outline" onClick={cancelUpload}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}