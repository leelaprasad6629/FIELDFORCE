import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#080C14" }}>
      <div className="glass max-w-md w-full p-8 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-rose-400">
          <AlertCircle className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
        </div>

        <p className="text-sm text-slate-400">
          The requested page does not exist or has been moved.
        </p>

        <a href="/" className="inline-block mt-4 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/25 transition">
          Return to App
        </a>
      </div>
    </div>
  );
}
