import React, { useEffect, useState } from "react";
import { Item } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useHashRouter } from "@/context/HashRouterContext";
import { getItemContact, updateItem } from "@/lib/api";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Share2 } from "lucide-react";

interface ItemDetailSheetProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReturn?: (item: Item) => void;
  onOpenEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onOpenReport?: (itemId: string) => void;
  onItemUpdated?: () => void;
}

export const ItemDetailSheet: React.FC<ItemDetailSheetProps> = ({
  item,
  isOpen,
  onClose,
  onOpenReturn,
  onOpenEdit,
  onDelete,
  onOpenReport,
  onItemUpdated,
}) => {
  const { user, isAdmin } = useAuth();
  const { navigate } = useHashRouter();
  const [fetchedContact, setFetchedContact] = useState<string | null>(null);
  const [loadingContact, setLoadingContact] = useState<boolean>(false);
  const [isRemoveImageOpen, setIsRemoveImageOpen] = useState(false);

  useEffect(() => {
    if (!item || !isOpen || item.contact || !user) {
      return;
    }

    let isMounted = true;
    getItemContact(item.id).then((res) => {
      if (isMounted) {
        setFetchedContact(res.data);
        setLoadingContact(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [item, isOpen, user]);

  if (!item) return null;

  const isOwner = !!user && item.user_id === user.id;
  const contact = item.contact || fetchedContact;

  const formatDate = (val?: string | null) => {
    if (!val) return "Date not set";
    return new Date(`${val}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPosted = (val?: string) => {
    if (!val) return "Just now";
    return new Date(val).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#item=${item.id}`;
    if (navigator.share) {
      navigator.share({ title: item.title, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Link copied to clipboard");
      });
    }
  };

  const handleContactLogin = () => {
    sessionStorage.setItem("campus-return-hash", `#item=${item.id}`);
    onClose();
    navigate("#/login");
  };

  const handleRemoveImage = async () => {
    if (!isAdmin) return;
    const res = await updateItem(item.id, { image_url: null });
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Image removed.");
      onClose();
      onItemUpdated?.();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto sm:max-w-xl sm:rounded-2xl sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] border-border bg-card p-6 sm:p-8"
      >
        <SheetHeader className="text-left space-y-1 pb-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            {item.type} / {item.category}
          </div>
          <SheetTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {item.title}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
            {item.description || "No description provided."}
          </SheetDescription>
        </SheetHeader>

        {item.image_url && (
          <div className="my-4 rounded-xl overflow-hidden aspect-[16/10] bg-secondary/40 border border-border/60">
            <img
              src={item.image_url}
              alt={`Photo of ${item.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Metadata Grid */}
        <dl className="grid grid-cols-2 gap-4 my-5 py-4 border-y border-border/40 text-sm">
          <div>
            <dt className="text-xs font-mono uppercase text-muted-foreground">Location</dt>
            <dd className="font-medium mt-1 text-foreground">{item.location || "Not provided"}</dd>
          </div>
          <div>
            <dt className="text-xs font-mono uppercase text-muted-foreground">Date</dt>
            <dd className="font-medium mt-1 text-foreground">{formatDate(item.item_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-mono uppercase text-muted-foreground">Posted</dt>
            <dd className="font-medium mt-1 text-foreground">{formatPosted(item.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-mono uppercase text-muted-foreground">Status</dt>
            <dd className="font-medium mt-1 text-foreground capitalize">
              {item.status === "returned" ? "Returned" : "Open"}
            </dd>
          </div>
        </dl>

        {/* Contact Details (Protected) */}
        <div className="my-5 p-4 rounded-xl border border-dashed border-border bg-background">
          {user ? (
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Contact Information
              </div>
              <div className="text-base font-semibold text-foreground break-words">
                {loadingContact ? "Loading contact..." : contact || "No contact provided"}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Contact details are private.</p>
              <Button
                variant="default"
                size="sm"
                onClick={handleContactLogin}
                className="w-full sm:w-auto font-semibold"
              >
                Sign in with Google to see contact
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {isOwner && item.status === "open" && (
            <div className="flex flex-wrap gap-2">
              {onOpenReturn && (
                <Button
                  onClick={() => onOpenReturn(item)}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white font-semibold"
                >
                  Mark as returned
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => onDelete(item)}
                  className="font-semibold"
                >
                  Delete
                </Button>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              {onOpenEdit && (
                <Button
                  variant="outline"
                  onClick={() => onOpenEdit(item)}
                  className="flex-1 font-semibold"
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => onDelete(item)}
                  className="font-semibold"
                >
                  Delete
                </Button>
              )}
              {item.image_url && (
                <Button
                  variant="destructive"
                  onClick={() => setIsRemoveImageOpen(true)}
                  className="font-semibold"
                >
                  Remove image
                </Button>
              )}
            </div>
          )}

          {user && !isAdmin && item.image_url && onOpenReport && (
            <Button
              variant="outline"
              onClick={() => onOpenReport(item.id)}
              className="w-full text-xs font-mono uppercase tracking-wider text-muted-foreground"
            >
              Report image
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share item
          </Button>
        </div>

        {/* Remove Image Confirmation */}
        <AlertDialog open={isRemoveImageOpen} onOpenChange={setIsRemoveImageOpen}>
          <AlertDialogContent className="bg-card border-border sm:rounded-2xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">Remove this image?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                This will remove the photo from the post immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 gap-2">
              <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setIsRemoveImageOpen(false);
                  handleRemoveImage();
                }}
                className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-semibold"
              >
                Remove image
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
};
