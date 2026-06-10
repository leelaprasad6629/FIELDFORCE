"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "" });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/15 text-cyan ring-1 ring-cyan/30">
          <Zap className="h-6 w-6" fill="currentColor" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-400">Set up your identity and access the management dashboard.</p>
      </div>
      <div className="space-y-4">
        <input
          type="text"
          value={data.name}
          onChange={(event) => setData({ ...data, name: event.target.value })}
          placeholder="Full name"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-cyan/50"
        />
        <input
          type="email"
          value={data.email}
          onChange={(event) => setData({ ...data, email: event.target.value })}
          placeholder="Email"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-cyan/50"
        />
        <input
          type="password"
          value={data.password}
          onChange={(event) => setData({ ...data, password: event.target.value })}
          placeholder="Password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-cyan/50"
        />
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-full rounded-xl bg-gradient-to-r from-cyan to-indigo px-5 py-3 text-sm font-semibold text-white shadow-glow-cyan transition-shadow hover:shadow-glow-indigo"
        >
          Create account
        </button>
      </div>
    </div>
  );
}
