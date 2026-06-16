import "../globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen text-white">
      <AnimatedBackground />
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <div className="glass w-full max-w-md p-8">{children}</div>
      </div>
    </div>
  );
}
