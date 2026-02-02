"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, registerUser } from "../../lib/api";
import { useAppStore } from "../../lib/store";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const setAuth = useAppStore((s) => s.setAuth);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">{mode === "login" ? "Sign in" : "Create account"}</h1>
        <p className="text-sm text-neutral-600">Secure access to your bookings and profile.</p>
      </header>

      <div className="flex gap-2">
        <button
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
            mode === "login" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"
          }`}
          onClick={() => setMode("login")}
        >
          Sign in
        </button>
        <button
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
            mode === "register" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"
          }`}
          onClick={() => setMode("register")}
        >
          Create account
        </button>
      </div>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          setLoading(true);
          try {
            if (mode === "register") {
              const { token, user } = await registerUser({
                email,
                password,
                name: name || undefined,
              });
              setAuth(token, user);
            } else {
              const { token, user } = await loginUser({ email, password });
              setAuth(token, user);
            }
            router.push(next);
          } catch (ex: any) {
            setErr(ex?.message ?? "Something went wrong");
          } finally {
            setLoading(false);
          }
        }}
      >
        {mode === "register" ? (
          <label className="space-y-1">
            <div className="text-xs text-neutral-600">Full name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2"
              placeholder="Priya Sharma"
            />
          </label>
        ) : null}

        <label className="space-y-1">
          <div className="text-xs text-neutral-600">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2"
            placeholder="you@example.com"
            type="email"
            required
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-neutral-600">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2"
            type="password"
            required
          />
        </label>

        {err ? <div className="text-sm text-red-600">{err}</div> : null}

        <button
          className="w-full rounded-xl bg-neutral-900 py-3 text-center text-sm font-semibold text-white"
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </main>
  );
}
