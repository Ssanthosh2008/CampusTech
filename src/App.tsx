import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { HashRouterProvider, useHashRouter } from "@/context/HashRouterContext";
import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";

function AppContent() {
  const { route } = useHashRouter();
  const [isPostOpen, setIsPostOpen] = useState(false);

  return (
    <Layout onOpenPost={() => setIsPostOpen(true)}>
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">CampusTech / Lost &amp; Found</h1>
        <p className="text-muted-foreground">Current Route: {route} | Post Dialog Open: {String(isPostOpen)}</p>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouterProvider>
        <AppContent />
        <Toaster richColors position="bottom-center" />
      </HashRouterProvider>
    </AuthProvider>
  );
}
