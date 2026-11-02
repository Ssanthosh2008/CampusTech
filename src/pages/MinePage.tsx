import React, { useEffect, useState, useCallback } from "react";
import { Item } from "@/types";
import { listUserItems } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useHashRouter } from "@/context/HashRouterContext";
import { ItemGrid } from "@/components/items/ItemGrid";
import { ItemDetailSheet } from "@/components/items/ItemDetailSheet";
import { ReturnFormSheet } from "@/components/items/ReturnFormSheet";
import { AdminEditSheet } from "@/components/admin/AdminEditSheet";
import { PostFormSheet } from "@/components/items/PostFormSheet";
import { toast } from "sonner";

interface MinePageProps {
  onOpenDeleteAlert: (item: Item) => void;
  isPostOpen: boolean;
  onClosePost: () => void;
  onOpenPost: () => void;
}

export const MinePage: React.FC<MinePageProps> = ({
  onOpenDeleteAlert,
  isPostOpen,
  onClosePost,
  onOpenPost,
}) => {
  const { user } = useAuth();
  const { navigate } = useHashRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [returnItem, setReturnItem] = useState<Item | null>(null);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadMine = useCallback(async () => {
    if (!user) {
      navigate("#/login");
      return;
    }

    setLoading(true);
    const res = await listUserItems(user.id);
    if (res.error) {
      toast.error(res.error.message || "Failed to load posts");
    } else {
      setItems(res.data || []);
    }
    setLoading(false);
  }, [user, navigate]);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 mb-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
          Your activity
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mb-2">
          MY POSTS<span className="text-accent">.</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Keep the signal moving. Manage items you posted.
        </p>
      </section>

      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {items.length} {items.length === 1 ? "post" : "posts"}
        </h2>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground text-sm font-mono animate-pulse">
          Loading your posts...
        </div>
      ) : (
        <ItemGrid
          items={items}
          onOpenDetail={(item) => {
            setSelectedItem(item);
            setIsDetailOpen(true);
          }}
          onOpenEdit={(item) => {
            setEditItem(item);
            setIsEditOpen(true);
          }}
          onDelete={(item) => onOpenDeleteAlert(item)}
          onOpenPost={onOpenPost}
          emptyTitle="No posts yet."
          emptyDescription="You haven't posted any lost or found items yet."
        />
      )}

      {/* Sheets / Modals */}
      <ItemDetailSheet
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }}
        onOpenReturn={(item) => {
          setIsDetailOpen(false);
          setReturnItem(item);
          setIsReturnOpen(true);
        }}
        onOpenEdit={(item) => {
          setIsDetailOpen(false);
          setEditItem(item);
          setIsEditOpen(true);
        }}
        onDelete={(item) => {
          setIsDetailOpen(false);
          onOpenDeleteAlert(item);
        }}
        onItemUpdated={loadMine}
      />

      <ReturnFormSheet
        item={returnItem}
        isOpen={isReturnOpen}
        onClose={() => {
          setIsReturnOpen(false);
          setReturnItem(null);
        }}
        onSuccess={loadMine}
      />

      <AdminEditSheet
        item={editItem}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditItem(null);
        }}
        onSuccess={loadMine}
      />

      <PostFormSheet
        isOpen={isPostOpen}
        onClose={onClosePost}
        onSuccess={loadMine}
      />
    </div>
  );
};

