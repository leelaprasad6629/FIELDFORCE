import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "mx-auto w-full",
          card: "bg-transparent shadow-none",
        },
      }}
    />
  );
}
