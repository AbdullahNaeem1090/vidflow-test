"use client"


import { VideoUploadForm } from "@/page-components/video-upload/upload-form";

export default function VideoUploadPage() {

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12 w-full">
      <div className="mx-auto">
        <VideoUploadForm/>
      </div>
    </main>
  )
}
