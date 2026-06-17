import type { Appearance } from "@clerk/types";

/**
 * High-contrast Clerk theme for FieldForce dark auth pages.
 * Solid backgrounds and explicit text colors keep every field readable.
 */
const clerkAppearance: Appearance = {
  variables: {
    colorBackground: "#0B1018",
    colorInputBackground: "#121A28",
    colorInputText: "#FFFFFF",
    colorText: "#FFFFFF",
    colorTextSecondary: "#E2E8F0",
    colorTextOnPrimaryBackground: "#FFFFFF",
    colorPrimary: "#06B6D4",
    colorDanger: "#FCA5A5",
    colorSuccess: "#86EFAC",
    colorWarning: "#FCD34D",
    colorNeutral: "#CBD5E1",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "mx-auto w-full text-white",
    card: "bg-[#0B1018] border border-white/20 shadow-2xl p-6 gap-6 text-white",
    headerTitle: "text-white text-2xl font-bold",
    headerSubtitle: "text-slate-200",
    main: "gap-6 text-white",
    socialButtonsBlockButton:
      "border border-white/30 bg-[#121A28] text-white hover:bg-[#1a2436]",
    socialButtonsBlockButtonText: "text-white font-semibold",
    dividerLine: "bg-white/30",
    dividerText: "text-slate-200 font-medium",
    formFieldLabel: "text-white font-semibold !text-white",
    formFieldInput:
      "bg-[#121A28] text-white border-2 border-white/30 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40",
    formFieldInputShowPasswordButton: "text-slate-200 hover:text-white",
    formFieldHintText: "text-slate-300",
    formFieldErrorText: "text-red-300 font-medium",
    formFieldSuccessText: "text-green-300 font-medium",
    formFieldInfoText: "text-slate-200",
    formButtonPrimary:
      "bg-cyan-500 hover:bg-cyan-400 text-white font-bold shadow-lg",
    formButtonReset: "text-slate-200 hover:text-white",
    footerActionText: "text-slate-200",
    footerActionLink: "text-cyan-300 hover:text-cyan-200 font-semibold",
    identityPreviewText: "text-white font-medium",
    identityPreviewEditButton: "text-cyan-300 hover:text-cyan-200",
    formHeaderTitle: "text-white font-bold text-xl",
    formHeaderSubtitle: "text-slate-200",
    otpCodeFieldInput:
      "bg-[#121A28] text-white border-2 border-white/30 focus:border-cyan-400",
    formResendCodeLink: "text-cyan-300 hover:text-cyan-200 font-medium",
    alertText: "text-white",
    alert: "border border-white/25 bg-[#121A28] text-white",
    selectButton:
      "bg-[#121A28] text-white border-2 border-white/30 hover:bg-[#1a2436]",
    selectButtonText: "text-white font-medium",
    selectOptionsContainer:
      "bg-[#121A28] border border-white/30 text-white shadow-2xl",
    selectOption: "text-white hover:bg-white/15",
    phoneInputBox: "bg-[#121A28] border-2 border-white/30 text-white",
    formFieldRow__username: "text-white",
    formFieldRow__phoneNumber: "text-white",
    formFieldRow__emailAddress: "text-white",
    formFieldRow__password: "text-white",
    formFieldRow__confirmPassword: "text-white",
    formFieldRow__firstName: "text-white",
    formFieldRow__lastName: "text-white",
    badge: "bg-white/15 text-white border border-white/25",
    alternativeMethodsBlockButton:
      "border border-white/30 text-white hover:bg-white/10",
    backLink: "text-cyan-300 hover:text-cyan-200",
    navbarButton: "text-slate-200 hover:text-white",
    captcha:
      "flex justify-center items-center min-h-[78px] w-full my-3 overflow-visible bg-[#121A28] rounded-lg border border-white/20",
    logoBox: "text-white",
    logoImage: "brightness-200",
  },
};

export default clerkAppearance;
