"use client";

import { useEffect, useState, useRef } from "react";
import { supabase, Profile } from "@/lib/supabase";
import { Camera, Save, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfileSettings() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      }
    };
    load();
  }, [router]);

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getAvatar = () =>
    avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-[var(--cream)]">
      <div className="max-w-lg mx-auto">
        <Link
          href="/chat"
          className="flex items-center gap-2 text-[var(--charcoal)]/50 hover:text-[var(--charcoal)] text-sm font-serif mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Chat
        </Link>

        <h1 className="font-display text-4xl uppercase tracking-widest text-[var(--charcoal)] mb-2">
          Profile Settings
        </h1>
        <p className="font-serif italic text-[var(--charcoal)]/50 mb-10 text-sm">
          Update your name and profile picture
        </p>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <Image
              src={getAvatar()}
              alt="Profile"
              width={120}
              height={120}
              className="rounded-full object-cover border-4 border-[var(--gold)]/30"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[var(--gold)] text-white rounded-full p-2 hover:bg-[var(--charcoal)] transition-colors"
            >
              <Camera size={16} />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={uploadAvatar}
          />
          {uploading && (
            <p className="text-[var(--gold)] text-xs font-serif mt-3 animate-pulse">
              Uploading...
            </p>
          )}
          <p className="text-[var(--charcoal)]/40 text-xs font-serif mt-2">
            Click the camera to change your photo
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--charcoal)]/60 mb-2">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-[var(--gold)]/30 bg-white px-4 py-3 font-serif text-[var(--charcoal)] outline-none focus:border-[var(--gold)] transition-colors"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--charcoal)]/60 mb-2">
              Role
            </label>
            <div className="w-full border border-[var(--gold)]/10 bg-white/50 px-4 py-3 font-serif text-[var(--charcoal)]/40 text-sm">
              {profile?.role === "director" ? "🎯 Director" : "⚡ Operative"} — assigned by admin
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[var(--charcoal)] text-[var(--cream)] py-4 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[var(--gold)] transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
