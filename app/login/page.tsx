"use client"

import LoginForm from "@/page-components/Login";
import { useAuthStore } from "@/Store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function LoginPage() {

  const {currUser}=useAuthStore()
  const router = useRouter();

  useEffect(()=>{
    console.log(currUser)
   if(currUser) router.push("/")
  }, [currUser, router])

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm  />
      </div>
    </div>
  )
}