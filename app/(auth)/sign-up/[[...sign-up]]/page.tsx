"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "" });

  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">FieldForce 360</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Create your account.</h1>
        <p className="mt-2 text-sm text-slate-300">Enter a mock identity and access the management dashboard instantly.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-surface p-6 shadow-xl shadow-violet-500/10">
        <div className="space-y-4">
          <input
            type="text"
            value={data.name}
            onChange={(event) => setData({ ...data, name: event.target.value })}
            placeholder="Full name"
            className="w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none transition focus:border-violet-400"
          />
          <input
            type="email"
            value={data.email}
            onChange={(event) => setData({ ...data, email: event.target.value })}
            placeholder="Email"
            className="w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none transition focus:border-violet-400"
          />
          <input
            type="password"
            value={data.password}
            onChange={(event) => setData({ ...data, password: event.target.value })}
            placeholder="Password"
            className="w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none transition focus:border-violet-400"
          />
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-3xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
