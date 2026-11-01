import React from "react";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { DemoBanner } from "./DemoBanner";

interface LayoutProps {
  children: React.ReactNode;
  onOpenPost: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onOpenPost }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent/20 selection:text-accent">
      <DemoBanner />
      <Topbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 pb-28 md:pb-16 focus:outline-none">
        {children}
      </main>
      <BottomNav onOpenPost={onOpenPost} />
    </div>
  );
};
