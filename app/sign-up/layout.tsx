import AuthLayoutShell from "@/components/AuthLayoutShell";

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutShell>{children}</AuthLayoutShell>;
}
