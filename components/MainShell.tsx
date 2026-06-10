import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-zinc-100">
      <AnimatedBackground />
      <Sidebar />
      <div className="lg:pl-16">
        <Header />
        <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
