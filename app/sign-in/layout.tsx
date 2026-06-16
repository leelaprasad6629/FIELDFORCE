import AuthLayoutShell from "@/components/AuthLayoutShell";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutShell>{children}</AuthLayoutShell>;
}
