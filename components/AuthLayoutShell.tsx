import AnimatedBackground from "@/components/AnimatedBackground";

export default function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <div className="auth-clerk w-full max-w-md rounded-2xl p-8 shadow-2xl">{children}</div>
      </div>
    </div>
  );
}
