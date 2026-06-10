export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute -left-40 top-[-10%] h-[480px] w-[480px] rounded-full bg-indigo/30 blur-[120px] animate-blob-one" />
      <div className="absolute right-[-10%] top-[20%] h-[520px] w-[520px] rounded-full bg-cyan/20 blur-[130px] animate-blob-two" />
      <div className="absolute bottom-[-15%] left-[30%] h-[420px] w-[420px] rounded-full bg-indigo/20 blur-[120px] animate-blob-one" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(6,182,212,0.08),transparent_45%)]" />
    </div>
  );
}
