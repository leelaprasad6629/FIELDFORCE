import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { ClerkProvider, SignIn, SignUp, useAuth, useUser } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRole } from "./hooks/useRole";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import Requests from "./pages/Requests";
import Analytics from "./pages/Analytics";
import TechnicianView from "./pages/TechnicianView";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
  const publicPaths = ["/", "/sign-in", "/sign-up", "/onboarding/role"];
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
  const { isSignedIn } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {isSignedIn ? <Redirect to="/dashboard" /> : <Landing />}
      </Route>

      <Route path="/sign-in">
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#080C14" }}>
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#06B6D4" }} />
            <div className="auth-clerk">
              <SignIn routing="hash" afterSignInUrl="/dashboard" signUpUrl="/sign-up" />
            </div>
          </div>
        </div>
      </Route>

      <Route path="/sign-up">
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#080C14" }}>
          <div className="relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#6366F1" }} />
            <div className="auth-clerk">
              <SignUp routing="hash" afterSignUpUrl="/onboarding/role" signInUrl="/sign-in" />
            </div>
          </div>
        </div>
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
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
