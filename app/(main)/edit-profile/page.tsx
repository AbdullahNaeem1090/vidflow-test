"use client"

import React, { useState } from "react";
import { Camera, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploader } from "@/hooks/uploader";
import { toast } from "sonner";
import Image from "next/image";
import { useAuthStore } from "@/Store/authStore";

export default function ProfileSettings() {
  const { changePassword, updateProfile, currUser ,isUpdatingProfile,isChangingPassword} = useAuthStore();
  const { uploadFile,isUploading } = useUploader();

  const [profileImage, setProfileImage] = useState<string>(
    currUser?.avatar || "/api/placeholder/150/150"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [username, setUsername] = useState(currUser?.username || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // -----------------------------
  // Handle image file select
  // -----------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // -----------------------------
  // Update username + optional avatar
  // -----------------------------
  const handleProfileUpdate = async () => {
      
      let avatarUrl="" ;

      // Upload file if currUser selected a new one
      if (selectedFile) {
        const uploadRes = await uploadFile(selectedFile, "thumbnails");
        avatarUrl = uploadRes.publicUrl;
      }


      if ((username === currUser?.username || !username.trim()) && !avatarUrl) {
  return; 
}

      console.log(username,avatarUrl)

      await updateProfile({
        username:username.trim(),
        avatarUrl,
      });
  };

  // -----------------------------
  // Change password
  // -----------------------------
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
        toast.warning("Please fill all fields")
        return;
    }
    if (newPassword !== confirmPassword) {
         toast.warning("New Passwords dont match")
        return;
    };
    if (newPassword.length < 6) {
         toast.warning("Must Contain 6 characters")
        return;
    };
    
      await changePassword({
        currentPassword,
        newPassword,
      });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 mx-auto">
      <div className="mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold">Profile Settings</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        {/* PROFILE CARD */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* Avatar */}
              <div className="relative group">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-foreground shadow-lg">
                  <Image
                  height={160}
                  width={160}
                    src={profileImage|| "/user.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Username */}
              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1"
                      placeholder="Enter username"
                    />
                    <Button disabled={isUpdatingProfile||isUploading} onClick={handleProfileUpdate}>
                      {isUpdatingProfile||isUploading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* PASSWORD CARD */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">

              {/* Current Password */}
              <InputWithEyeToggle
                label="Current Password"
                value={currentPassword}
                setValue={setCurrentPassword}
            
              />

              {/* New Password */}
              <InputWithEyeToggle
                label="New Password"
                value={newPassword}
                setValue={setNewPassword}
             
              />

              {/* Confirm Password */}
              <InputWithEyeToggle
                label="Confirm Password"
                value={confirmPassword}
                setValue={setConfirmPassword}
            
              />

              <Button disabled={isChangingPassword} onClick={handlePasswordChange} className="w-full">
                <Lock className="w-4 h-4 mr-2" />
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ---------------------------------------------
// Reusable Password Input Component
// ---------------------------------------------
function InputWithEyeToggle({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;

}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          type={"password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pr-10"
        />
      </div>
    </div>
  );
}
