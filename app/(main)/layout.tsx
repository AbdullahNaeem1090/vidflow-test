"use client"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/page-components/sidebar/AppSidebar"
import SearchBar from "@/page-components/Home/Searchbar"
import {  useEffect } from "react"
import { useAuthStore } from "@/Store/authStore"
import { useRouter } from "next/navigation"
import Loader from "@/page-components/Loader"



export default function MainLayout({ children }: { children: React.ReactNode }) {
const {currUser,checkUser,isLoggedIn}=useAuthStore()
  const router = useRouter();


// const redirectToLogin = useCallback(() => {
//   router.push("/login");
// }, [router]);

const isMobile = useIsMobile();

useEffect(() => {
  if (!currUser) checkUser();
}, [currUser,checkUser]);

  useEffect(() => {
   if(!isLoggedIn && !localStorage.getItem("accessToken")){
    router.replace("/login")
   } 
  }, [isLoggedIn,router]);

  if(!currUser){
    return <Loader />
  }

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />
      {/* Main content */}
      <SidebarInset>
        <header className="flex h-20 shrink-0 items-center justify-center gap-2 px-4">
          <SearchBar />
        </header>

        <div className="flex w-full container mx-auto px-5">
          {children} {/* <- Outlet replacement */}
        </div>

        {isMobile && (
          <Button
            asChild
            size="icon"
            className="bg-accent-foreground/10 fixed right-5 bottom-6 h-12 w-12 rounded-lg shadow-lg backdrop-blur-sm"
          >
            <SidebarTrigger className="text-foreground" />
          </Button>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
