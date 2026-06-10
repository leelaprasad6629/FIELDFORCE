import "../globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-white">
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-sm backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
