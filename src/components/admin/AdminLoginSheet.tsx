import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHashRouter } from "@/context/HashRouterContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AdminLoginSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginSheet: React.FC<AdminLoginSheetProps> = ({ isOpen, onClose }) => {
  const { signInWithAdminPassword } = useAuth();
  const { navigate } = useHashRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsSubmitting(true);
    const res = await signInWithAdminPassword(password);
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error.message || "Wrong password");
    } else {
      toast.success("Signed in as Admin.");
      setPassword("");
      onClose();
      navigate("#/browse");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] sm:max-w-md sm:rounded-2xl sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 border-border bg-card p-6 sm:p-8"
      >
        <SheetHeader className="text-left space-y-1 pb-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            Restricted access
          </div>
          <SheetTitle className="text-2xl font-black tracking-tight text-foreground">
            Admin sign in
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground pt-1">
            Use the administrator password.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-xs font-semibold">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
