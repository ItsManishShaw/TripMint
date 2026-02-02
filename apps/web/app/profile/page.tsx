"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, updateProfile } from "../../lib/api";
import { useAppStore } from "../../lib/store";

export default function ProfilePage() {
  const router = useRouter();
  const authToken = useAppStore((s) => s.authToken);
  const user = useAppStore((s) => s.user);
  const setAuth = useAppStore((s) => s.setAuth);
  const clearAuth = useAppStore((s) => s.clearAuth);

  const [name, setName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authToken) return;
    (async () => {
      const me = await getMe(authToken);
      setAuth(authToken, me);
      setName(me.name ?? "");
    })();
  }, [authToken, setAuth]);

  if (!authToken) {
    return (
      <main className="space-y-3">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-neutral-600">Please sign in to manage your profile.</p>
        <button
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => router.push("/login?next=/profile")}
        >
          Sign in
        </button>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-neutral-600">Update your name and manage account access.</p>
      </header>

      <div className="rounded-2xl border border-neutral-200 p-4 space-y-2">
        <div className="text-xs text-neutral-600">Email</div>
        <div className="font-semibold">{user?.email}</div>
      </div>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!authToken) return;
          setErr(null);
          setSaved(false);
          setLoading(true);
          try {
            const updated = await updateProfile(authToken, { name: name || undefined });
            setAuth(authToken, updated);
            setSaved(true);
          } catch (ex: any) {
            setErr(ex?.message ?? "Something went wrong");
          } finally {
            setLoading(false);
          }
        }}
      >
        <label className="space-y-1">
          <div className="text-xs text-neutral-600">Full name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2"
          />
        </label>

        {err ? <div className="text-sm text-red-600">{err}</div> : null}
        {saved ? <div className="text-sm text-green-700">Profile updated.</div> : null}

        <button
          className="w-full rounded-xl bg-neutral-900 py-3 text-center text-sm font-semibold text-white"
          type="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>

      <button
        className="w-full rounded-xl border border-neutral-200 py-2 text-sm"
        onClick={() => {
          clearAuth();
          router.push("/");
        }}
      >
        Sign out
      </button>
    </main>
  );
}
