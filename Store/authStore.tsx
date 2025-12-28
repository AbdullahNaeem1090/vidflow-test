import { myAxios } from "@/lib/axios";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { TloginFormData, TsignUpFormData } from "@/zod/auth-schema";
import { ChannelVideo } from "@/types/video.types";
import { PlaylistPreview } from "@/types/playlist.types";

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
type ChannelDataResponse = {
  videos: ChannelVideo[];
  playlists: PlaylistPreview[];
};
type TAuthStore = {
  currUser: null | User;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isCheckingAuth: boolean;
  checkUser: () => void;
  signup: (data: TsignUpFormData) => void;
  login: (data: TloginFormData) => void;
  logout: () => void;
  setCurrUser: (data: User) => void;
  isVerifyingEmail: boolean;
  verifyEmail: (token: string) => void;
  isVerificationPassed: boolean;
  isSendingEmail: boolean;
  resendVerificationEmail: (email: string) => void;
  isUpdatingProfile: boolean;
  isChangingPassword: boolean;
  updateProfile: (UpdatedData: { username: string; avatarUrl: string }) => void;
  changePassword: (passData: {
    currentPassword?: string;
    newPassword?: string;
  }) => void;
  isGettingChannelData: boolean;
  ChannelData:ChannelDataResponse;
  getUserChannelData: (
    userId: string
  ) => Promise<void>;
};

export const useAuthStore = create<TAuthStore>((set) => ({
  currUser: null,
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: false,
  isVerifyingEmail: false,
  isVerificationPassed: false,
  isSendingEmail: false,
  isChangingPassword: false,
  isUpdatingProfile: false,
  isGettingChannelData: false,
  ChannelData:{ videos: [], playlists: [] },

  setCurrUser: (user) => {
    set({ currUser: user });
  },

  checkUser: async function () {
    try {
      set({ isCheckingAuth: true });
      const { data } = await myAxios.get("/auth/check");
      if(data.success){
        set({ currUser: data.data });
          localStorage.setItem("accessToken", data.accessToken);
      }

    } catch (err) {
      console.log(err);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async function (formData: TsignUpFormData) {
    try {
      set({ isSigningUp: true });
      const { data } = await myAxios.post("/auth/signup", formData);
      toast.success(data.data.username, {
        description: data.message,
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.log(err);
        toast.error("Oops!", {
          description:
            err?.response?.data.message ?? "Server maitainence is going on.",
        });
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async function (formData: TloginFormData) {
    try {
      set({ isLoggingIn: true });

      const { data } = await myAxios.post("/auth/login", formData);

      if (data.success) {
        set({ currUser: data.data });
        localStorage.setItem("accessToken", data.accessToken);
        toast.success("Login Successful");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.log(err);
        toast.error("Oops!", {
          description:
            err?.response?.data.message ?? "Server maintainance is going on.",
        });
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  verifyEmail: async function (token: string) {
    try {
      set({ isVerifyingEmail: true });
      const { data } = await myAxios.get(`/auth/verify/${token}`);
      if (data.success) {
        set({ isVerificationPassed: true });
        toast.success(data.message);
      }
    } catch (err) {
      if (isAxiosError(err)) console.log(err.response?.data.message);
    } finally {
      set({ isVerifyingEmail: false });
    }
  },

  logout: async function () {
    try {
      const { data } = await myAxios.post("/auth/logout");
      if (data.success) {
        set({ currUser: null });
        localStorage.removeItem("accessToken");
        toast.success("Logged out Successfully");
        window.location.href = "/login";
      }
      sessionStorage.clear();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.log(err);
        toast.error("Oops!", {
          description:
            err?.response?.data.message ?? "Server maintainance is going on.",
        });
      }
    }
  },

  resendVerificationEmail: async (email: string) => {
    try {
      set({ isSendingEmail: true });
      const { data } = await myAxios.post("/auth/resend-email", { email });
      if (data.success) toast.success(data.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err);
        toast.error("Oops!", {
          description:
            err?.response?.data.message ?? "Server maintainance is going on.",
        });
      }
    } finally {
      set({ isSendingEmail: false });
    }
  },

  updateProfile: async (UpdatedData: {
    username?: string;
    avatarUrl?: string;
  }) => {
    try {
      set({ isUpdatingProfile: true });

      const { data } = await myAxios.post("/auth/update-profile", UpdatedData);

      if (data.success) {
        set((state) => ({
          currUser: state.currUser
            ? {
                ...state.currUser, // Preserve all existing properties first
                ...(UpdatedData.username
                  ? { username: UpdatedData.username }
                  : {}), // Changed 'name' to 'username'
                ...(UpdatedData.avatarUrl
                  ? { avatar: UpdatedData.avatarUrl }
                  : {}),
              }
            : state.currUser, // Handle null/undefined case
        }));
        toast.success("Updated");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.warning("Updation failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  changePassword: async (passData) => {
    set({ isChangingPassword: true });

    try {
      const { data } = await myAxios.post("/auth/change-password", passData);
      if (data.success) {
        console.log("changed");
        toast.success("Password changed");
      }
    } catch (error) {
      console.log("error", error);
      toast.warning("Updation failed");
    } finally {
      set({ isChangingPassword: false });
    }
  },

getUserChannelData: async (userId: string) => {
  set({ isGettingChannelData: true });

  try {
    const { data } = await myAxios.get(`/auth/channel/${userId}`);

    if (data.success) {
      set({ ChannelData: data.data });
    }
  } catch (error) {
    console.log("error", error);
    toast.warning("Failed to load channel data");
  } finally {
    set({ isGettingChannelData: false });
  }
},

}));
