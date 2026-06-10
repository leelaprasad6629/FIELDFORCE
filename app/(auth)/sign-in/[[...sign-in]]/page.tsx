"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">FieldForce 360</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Welcome back.</h1>
        <p className="mt-2 text-sm text-slate-300">Sign in with any credentials to explore the demo workspace immediately.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-surface p-6 shadow-xl shadow-violet-500/10">
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none transition focus:border-violet-400"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none transition focus:border-violet-400"
          />
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-3xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
