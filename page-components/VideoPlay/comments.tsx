"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../Loader";
import { useVideoStore } from "@/Store/videoStore";
import { useAuthStore } from "@/Store/authStore";
import { useParams } from "next/navigation";

export function Comments() {
  const [text, setText] = useState("");
  const {
    GetVideoComments,
    VideoComments,
    deleteComment,
    CreateComment,
    isFetchingComments,
  } = useVideoStore();
  const { currUser } = useAuthStore();
  const {VideoId} = useParams<{VideoId:string}>()

  useEffect(() => {
    if (!VideoId) return;
    GetVideoComments(VideoId);
  }, [VideoId, GetVideoComments]);

  function addComment() {
    const trimmed = text.trim();
    if (!trimmed || !VideoId) return;
    CreateComment(VideoId, trimmed, currUser!.username, currUser!.avatar);
    setText("");
  }

console.log(currUser)

  if (isFetchingComments) {
    return <Loader />;
  }

  return (
    <section aria-label="Comments" className="space-y-4">
      <h2 className="text-lg font-semibold">Comments</h2>

      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={currUser?.avatar||"/user.png"} alt="Your avatar" />
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-20"
          />
          <div className="mt-2 flex items-center gap-2">
            <Button onClick={addComment} disabled={!text.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Comment
            </Button>
            <Button variant="ghost" onClick={() => setText("")}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <ul className="space-y-4">
        {VideoComments.map((c) =>{
          const canDelete = currUser?.username === c.author 
        return (
          <li key={c.id} className="flex items-start gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={c.avatar || "/user.png"}
                alt={`${c.author} avatar`}
              />
              <AvatarFallback>
                {c.author
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{c.author}</span>
                  <span className="text-muted-foreground">{c.time}</span>
                </div>

                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteComment(c.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <p className="mt-1 text-sm leading-relaxed">{c.text}</p>
            </div>
          </li>
        )})}
      </ul>
    </section>
  );
}
