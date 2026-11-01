import { AuthProvider } from "@/context/AuthContext";
import { HashRouterProvider, useHashRouter } from "@/context/HashRouterContext";
import { Toaster } from "@/components/ui/sonner";

function AppContent() {
  const { route } = useHashRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">CampusTech</h1>
        <p className="text-muted-foreground mt-2">Current Route: {route}</p>
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouterProvider>
        <AppContent />
      </HashRouterProvider>
    </AuthProvider>
  );
}
