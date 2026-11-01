import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useHashRouter } from "@/context/HashRouterContext";
import { Plus } from "lucide-react";

interface BottomNavProps {
  onOpenPost: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenPost }) => {
  const { user } = useAuth();
  const { route, navigate } = useHashRouter();

  const handlePostClick = () => {
    if (user) {
      onOpenPost();
    } else {
      sessionStorage.setItem("campus-intent", "post");
      navigate("#/login");
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-card/95 border-t border-border backdrop-blur-md px-6 flex items-center justify-around pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary navigation"
    >
      <a
        href="#/browse"
        className={`flex flex-col items-center gap-1 text-[11px] uppercase tracking-wider font-medium transition-colors ${
          route === "browse" ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="text-lg leading-none">◌</span>
        <span>Browse</span>
      </a>

      <button
        type="button"
        onClick={handlePostClick}
        aria-label="Post an item"
        className="w-13 h-13 -mt-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7 text-white stroke-[2.5]" />
      </button>

      <a
        href={user ? "#/mine" : "#/login"}
        className={`flex flex-col items-center gap-1 text-[11px] uppercase tracking-wider font-medium transition-colors ${
          route === "mine" ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="text-lg leading-none">▦</span>
        <span>{user ? "My posts" : "Sign in"}</span>
      </a>
    </nav>
  );
};
