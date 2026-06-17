import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { ClerkProvider, SignIn, SignUp, useAuth, useUser } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useRole } from "./hooks/useRole";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import Requests from "./pages/Requests";
import Analytics from "./pages/Analytics";
import TechnicianView from "./pages/TechnicianView";
import Expenses from "./pages/Expenses";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Modal backdrop + slide-in for auth modals
const backdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modal = { hidden: { opacity: 0, y: 24, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 12, scale: 0.97 } };

function AuthModal({ view, onClose }: { view: "sign-in" | "sign-up"; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        variants={backdrop}
        initial="hidden" animate="visible" exit="exit"
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          key="modal"
          variants={modal}
          initial="hidden" animate="visible" exit="exit"
          transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
          className="pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {view === "sign-in"
            ? <SignIn routing="hash" afterSignInUrl="/dashboard" signUpUrl="#sign-up" />
            : <SignUp routing="hash" afterSignUpUrl="/onboarding/role" signInUrl="#sign-in" />
          }
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function PublicLanding() {
  const { isSignedIn, isLoaded } = useAuth();
  const [authView, setAuthView] = useState<"sign-in" | "sign-up" | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080C14" }}>
        <div className="w-8 h-8 border-2 border-cyan-500/40 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (isSignedIn) return <Redirect to="/dashboard" />;

  return (
    <>
      <Landing onSignIn={() => setAuthView("sign-in")} onSignUp={() => setAuthView("sign-up")} />
      {authView && (
        <AuthModal view={authView} onClose={() => setAuthView(null)} />
      )}
    </>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [location] = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080C14" }}>
        <div className="w-8 h-8 border-2 border-cyan-500/40 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/" />;

  const role = user?.publicMetadata?.role as string | undefined;
  const publicPaths = ["/", "/onboarding/role"];
  if (!role && !publicPaths.includes(location)) {
    return <Redirect to="/onboarding/role" />;
  }
  if (role && location === "/onboarding/role") {
    return <Redirect to={role === "manager" ? "/dashboard" : "/technician"} />;
  }

  return <>{children}</>;
}

function ManagerOnly({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  if (role === "technician") return <Redirect to="/technician" />;
  return <>{children}</>;
}

function TechnicianOnly({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  if (role === "manager") return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/">
        <PublicLanding />
      </Route>

      <Route path="/onboarding/role">
        <AuthGate>
          <Onboarding />
        </AuthGate>
      </Route>

      <Route path="/dashboard">
        <AuthGate>
          <ManagerOnly>
            <Layout>
              <Dashboard />
            </Layout>
          </ManagerOnly>
        </AuthGate>
      </Route>

      <Route path="/map">
        <AuthGate>
          <Layout>
            <MapPage />
          </Layout>
        </AuthGate>
      </Route>

      <Route path="/requests">
        <AuthGate>
          <ManagerOnly>
            <Layout>
              <Requests />
            </Layout>
          </ManagerOnly>
        </AuthGate>
      </Route>

      <Route path="/analytics">
        <AuthGate>
          <ManagerOnly>
            <Layout>
              <Analytics />
            </Layout>
          </ManagerOnly>
        </AuthGate>
      </Route>

      <Route path="/expenses">
        <AuthGate>
          <ManagerOnly>
            <Layout>
              <Expenses />
            </Layout>
          </ManagerOnly>
        </AuthGate>
      </Route>

      <Route path="/technician">
        <AuthGate>
          <TechnicianOnly>
            <Layout>
              <TechnicianView />
            </Layout>
          </TechnicianOnly>
        </AuthGate>
      </Route>

      <Route>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#080C14" }}>
          <div className="text-center">
            <p className="text-6xl font-bold text-white mb-4">404</p>
            <p className="text-slate-400">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  if (!PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080C14" }}>
        <div className="glass p-8 text-center max-w-sm">
          <p className="text-rose-400 font-semibold mb-2">Missing Clerk Key</p>
          <p className="text-slate-400 text-sm">Set VITE_CLERK_PUBLISHABLE_KEY in environment secrets.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
