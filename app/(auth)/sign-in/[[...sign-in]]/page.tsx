"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/15 text-cyan ring-1 ring-cyan/30">
          <Zap className="h-6 w-6" fill="currentColor" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to access the FieldForce 360 control pane.</p>
      </div>
      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-cyan/50"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-cyan/50"
        />
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-full rounded-xl bg-gradient-to-r from-cyan to-indigo px-5 py-3 text-sm font-semibold text-white shadow-glow-cyan transition-shadow hover:shadow-glow-indigo"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
