import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "mx-auto w-full",
          card: "bg-transparent shadow-none",
        },
      }}
    />
  );
}
