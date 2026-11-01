import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { HashRouterProvider, useHashRouter } from "@/context/HashRouterContext";
import { Layout } from "@/components/layout/Layout";
import { BrowsePage } from "@/pages/BrowsePage";
import { LoginPage } from "@/pages/LoginPage";
import { MinePage } from "@/pages/MinePage";
import { ReportsPage } from "@/pages/ReportsPage";
import { PostFormSheet } from "@/components/items/PostFormSheet";
import { Toaster } from "@/components/ui/sonner";
import { Item } from "@/types";
import { deleteItem } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function AppRoutes() {
  const { route } = useHashRouter();
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await deleteItem(deleteTarget.id);
    if (res.error) {
      toast.error(res.error.message || "Could not delete post");
    } else {
      toast.success("Post deleted.");
      // Trigger a soft reload or window hash re-trigger
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    setDeleteTarget(null);
  };

  return (
    <Layout onOpenPost={() => setIsPostOpen(true)}>
      {route === "login" && <LoginPage />}

      {route === "mine" && (
        <MinePage
          isPostOpen={isPostOpen}
          onClosePost={() => setIsPostOpen(false)}
          onOpenPost={() => setIsPostOpen(true)}
          onOpenDeleteAlert={setDeleteTarget}
        />
      )}

      {route === "reports" && <ReportsPage onOpenDeleteAlert={setDeleteTarget} />}

      {route === "browse" && (
        <BrowsePage
          isPostOpen={isPostOpen}
          onClosePost={() => setIsPostOpen(false)}
          onOpenPost={() => setIsPostOpen(true)}
          onOpenDeleteAlert={setDeleteTarget}
        />
      )}

      {/* Global Post Form Sheet accessible from FAB or header */}
      <PostFormSheet
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        onSuccess={() => {
          setIsPostOpen(false);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }}
      />

      {/* Global Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border sm:rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete this post?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. It will permanently remove &quot;{deleteTarget?.title}&quot;
              and all associated return or report records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-semibold"
            >
              Delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouterProvider>
        <AppRoutes />
        <Toaster richColors position="bottom-center" />
      </HashRouterProvider>
    </AuthProvider>
  );
}
