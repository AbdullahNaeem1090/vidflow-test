"use client"

import LoginForm from "@/page-components/Login";
import { useAuthStore } from "@/Store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function LoginPage() {
const {isLoggedIn,checkUser}=useAuthStore()
  const router = useRouter();

  useEffect(()=>{
   if(isLoggedIn) router.replace("/")
    else checkUser()
     
  }, [isLoggedIn,router,checkUser])

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm  />
      </div>
    </div>
  )
}