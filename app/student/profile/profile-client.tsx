"use client";

import { useRef, useState, type DragEvent } from "react";
import { Camera, CheckCircle2, Loader2, LockKeyhole, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type StudentProfileClientProps = {
  initialProfile: {
    fullName: string;
    email: string;
    mobilePhone: string;
    profilePhotoUrl: string;
    studentId: string;
  };
  readonlyInfo: {
    schools: string[];
    years: string[];
    assignedSubjects: string[];
  };
};

export function StudentProfileClient({ initialProfile, readonlyInfo }: StudentProfileClientProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [email, setEmail] = useState(initialProfile.email);
  const [mobilePhone, setMobilePhone] = useState(initialProfile.mobilePhone);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialProfile.profilePhotoUrl);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S";

  async function uploadPhoto(file: File | null | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please upload an image file.");
      return;
    }

    setIsUploading(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/student/profile/photo-upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to upload photo.");
      }

      setProfilePhotoUrl(String(data.url || ""));
      setProfileMessage("Photo uploaded. Save profile to keep it.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to upload photo.");
    } finally {
      setIsUploading(false);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function saveProfile() {
    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const response = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, mobilePhone, profilePhotoUrl }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setProfileMessage("Profile updated.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function changePassword() {
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed.");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to change password.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    void uploadPhoto(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="portal-page-width space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f6fff]">Student profile</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Edit Profile</h1>
        <p className="mt-2 text-sm font-medium text-[#64789c]">Manage your account information and password.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-[28px] border-[#dce6ff] bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                disabled={isUploading}
                className={cn(
                  "relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-[#cfe0f7] bg-[#f7faff] text-[#2f6fff]",
                  isDragging && "border-[#2f6fff] bg-[#eef4ff]"
                )}
              >
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Profile photo" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-black">{initials}</span>
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/70 py-2 text-xs font-bold text-white">
                  {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                  Photo
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(event) => void uploadPhoto(event.target.files?.[0])}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">Profile photo</p>
                <p className="mt-1 text-sm text-[#64789c]">Drag and drop an image, or click the photo box to choose one.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  {profilePhotoUrl ? (
                    <Button type="button" variant="outline" onClick={() => setProfilePhotoUrl("")} disabled={isUploading}>
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Full name</label>
                <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Email</label>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Mobile phone optional</label>
                <Input value={mobilePhone} onChange={(event) => setMobilePhone(event.target.value)} placeholder="+62..." />
              </div>
            </div>

            {profileError ? <p className="text-sm font-semibold text-red-600">{profileError}</p> : null}
            {profileMessage ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {profileMessage}
              </p>
            ) : null}

            <Button type="button" onClick={() => void saveProfile()} disabled={isSavingProfile} className="rounded-full">
              {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[28px] border-[#dce6ff] bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle>School Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ReadonlyLine label="School" value={readonlyInfo.schools.join(", ") || "Not assigned"} />
              <ReadonlyLine label="Year / class" value={readonlyInfo.years.join(", ") || "Assigned curriculum"} />
              <ReadonlyLine label="Student ID" value={initialProfile.studentId} />
              <ReadonlyLine label="Assigned subjects" value={readonlyInfo.assignedSubjects.join(", ") || "No subjects assigned"} />
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[#dce6ff] bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5 text-[#2f6fff]" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
              />
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password"
                autoComplete="new-password"
              />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              {passwordError ? <p className="text-sm font-semibold text-red-600">{passwordError}</p> : null}
              {passwordMessage ? <p className="text-sm font-semibold text-emerald-600">{passwordMessage}</p> : null}
              <Button
                type="button"
                onClick={() => void changePassword()}
                disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full rounded-full"
              >
                {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReadonlyLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-800">{value}</p>
    </div>
  );
}
