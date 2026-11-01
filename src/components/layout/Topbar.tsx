import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useHashRouter } from "@/context/HashRouterContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Topbar: React.FC = () => {
  const { user, isAdmin, signOutUser } = useAuth();
  const { route, navigate } = useHashRouter();

  const handleAuthAction = async () => {
    if (user) {
      await signOutUser();
      toast.success("Signed out.");
      navigate("#/browse");
    } else {
      navigate("#/login");
    }
  };

  const isLoginRoute = route === "login";

  return (
    <header className="sticky top-0 z-30 h-16 md:h-20 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        <a
          href="#/browse"
          aria-label="CampusTech home"
          className="flex items-center gap-2.5 text-foreground font-bold tracking-tight text-xl hover:opacity-90 transition-opacity"
        >
          <span className="w-6 h-6 rounded-md bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-black">
            ●
          </span>
          <span>CampusTech</span>
        </a>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {isAdmin && (
            <>
              <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold border-accent/50 text-accent">
                Admin
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                onClick={() => navigate("#/reports")}
              >
                Reports
              </Button>
            </>
          )}

          {user && (
            <Avatar className="w-8 h-8 border border-border text-xs bg-secondary">
              <AvatarFallback className="font-semibold text-secondary-foreground">
                {(user.user_metadata?.full_name || user.email || "U").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {!isLoginRoute && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground font-medium"
              onClick={handleAuthAction}
            >
              {user ? "Sign out" : "Sign in"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
