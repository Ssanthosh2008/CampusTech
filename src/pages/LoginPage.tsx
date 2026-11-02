import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHashRouter } from "@/context/HashRouterContext";
import { Button } from "@/components/ui/button";
import { AdminLoginSheet } from "@/components/admin/AdminLoginSheet";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, resumePendingIntent } = useAuth();
  const { navigate } = useHashRouter();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      if (!resumePendingIntent()) {
        navigate("#/browse");
      }
    }
  }, [user, navigate, resumePendingIntent]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    const res = await signInWithGoogle();
    setIsSigningIn(false);

    if (res.error) {
      toast.error(res.error.message || "Sign-in failed. Try again.");
    } else {
      toast.success("Welcome to CampusTech!");
      if (!resumePendingIntent()) {
        navigate("#/browse");
      }
    }
  };

  return (
    <section className="min-h-[calc(100dvh-5rem)] flex items-center justify-center py-8">
      <div className="w-full max-w-sm px-4 text-center">
        {/* Animated 9x9 Signal Matrix */}
        <div
          aria-hidden="true"
          className="grid grid-cols-9 gap-2.5 justify-center w-fit mx-auto my-6"
        >
          {Array.from({ length: 81 }, (_, i) => {
            const isHot = i === 40;
            return (
              <span
                key={i}
                style={{ animationDelay: `${(i % 9) * 0.06}s` }}
                className={`w-2 h-2 rounded-full transition-all ${
                  isHot
                    ? "bg-accent shadow-sm shadow-accent animate-pulse scale-125"
                    : "bg-muted/40 animate-pulse"
                }`}
              />
            );
          })}
        </div>

        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
          CampusTech / Lost &amp; Found
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-3">
          LOST.<br />FOUND.<br />RETURNED<span className="text-accent">.</span>
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-xs mx-auto">
          One small signal can find its way home.
        </p>

        <div className="space-y-3">
          <Button
            size="lg"
            disabled={isSigningIn}
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm shadow-sm"
          >
            <span className="text-accent mr-2 text-base">●</span>
            {isSigningIn ? "Connecting…" : "Continue with Google"}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setIsAdminOpen(true)}
            className="w-full h-12 rounded-xl border-border bg-card hover:bg-secondary/60 text-foreground font-semibold text-sm"
          >
            Admin
          </Button>

          <a
            href="#/browse"
            className="block pt-2 text-xs text-muted-foreground underline hover:text-foreground transition-colors"
          >
            Continue as guest
          </a>

          <div className="text-[10px] font-mono tracking-widest text-muted-foreground/80 uppercase pt-4">
            ANY GOOGLE ACCOUNT WORKS.
          </div>
        </div>
      </div>

      <AdminLoginSheet isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </section>
  );
};

