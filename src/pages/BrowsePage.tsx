import React, { useEffect, useState, useCallback } from "react";
import { Item, ItemFilters } from "@/types";
import { listItems, reportImage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useHashRouter } from "@/context/HashRouterContext";
import { HeroSection } from "@/components/layout/HeroSection";
import { BrowseFilters } from "@/components/filters/BrowseFilters";
import { ItemGrid } from "@/components/items/ItemGrid";
import { ItemDetailSheet } from "@/components/items/ItemDetailSheet";
import { PostFormSheet } from "@/components/items/PostFormSheet";
import { ReturnFormSheet } from "@/components/items/ReturnFormSheet";
import { AdminEditSheet } from "@/components/admin/AdminEditSheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BrowsePageProps {
  isPostOpen: boolean;
  onClosePost: () => void;
  onOpenPost: () => void;
  onOpenDeleteAlert: (item: Item) => void;
}

export const BrowsePage: React.FC<BrowsePageProps> = ({
  isPostOpen,
  onClosePost,
  onOpenPost,
  onOpenDeleteAlert,
}) => {
  const { user } = useAuth();
  const { itemId, navigate } = useHashRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);

  const [filters, setFilters] = useState<ItemFilters>({
    query: "",
    type: "all",
    category: "all",
    returned: false,
  });

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [returnItem, setReturnItem] = useState<Item | null>(null);
  const [isReturnOpen, setIsReturnOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const loadData = useCallback(async (initial = false) => {
    const currentOffset = initial ? 0 : offset;
    const res = await listItems({ limit: 20, offset: currentOffset });
    if (res.error) {
      toast.error(res.error.message || "Failed to load items");
      setLoading(false);
      return;
    }

    const fetched = res.data || [];
    setItems((prev) => (initial ? fetched : [...prev, ...fetched]));
    setOffset(currentOffset + fetched.length);
    setHasMore(fetched.length === 20);
    setLoading(false);
  }, [offset]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Deep linking for #item=<id>
  useEffect(() => {
    if (itemId && items.length > 0) {
      const match = items.find((x) => x.id === itemId);
      if (match) {
        setSelectedItem(match);
        setIsDetailOpen(true);
      }
    }
  }, [itemId, items]);

  const visibleItems = items.filter((x) => {
    const matchesQuery = !filters.query || x.title.toLowerCase().includes(filters.query);
    const matchesType = filters.type === "all" || x.type === filters.type;
    const matchesCategory = filters.category === "all" || x.category === filters.category;
    const matchesReturned = filters.returned || x.status !== "returned";
    return matchesQuery && matchesType && matchesCategory && matchesReturned;
  });

  const handleReportImage = async (id: string) => {
    if (!user) return;
    const reason = window.prompt(
      "Why should this image be reviewed?",
      "It may contain a person or inappropriate content."
    );
    if (!reason?.trim()) return;

    const res = await reportImage(id, reason.trim(), user.id);
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Image reported to admins.");
    }
  };

  const handleReportLost = () => {
    if (user) {
      onOpenPost();
    } else {
      sessionStorage.setItem("campus-intent", "lost");
      navigate("#/login");
    }
  };

  return (
    <div className="space-y-6">
      <HeroSection onReportLost={handleReportLost} />

      <BrowseFilters filters={filters} onChange={setFilters} />

      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Recent posts</h2>
        <span className="text-xs font-mono text-muted-foreground">
          {visibleItems.length} {visibleItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground text-sm font-mono animate-pulse">
          Loading items from signal...
        </div>
      ) : (
        <ItemGrid
          items={visibleItems}
          onOpenDetail={(item) => {
            setSelectedItem(item);
            setIsDetailOpen(true);
          }}
          onOpenEdit={(item) => {
            setEditItem(item);
            setIsEditOpen(true);
          }}
          onDelete={(item) => onOpenDeleteAlert(item)}
          onOpenReport={handleReportImage}
          onOpenPost={user ? onOpenPost : () => navigate("#/login")}
        />
      )}

      {hasMore && !loading && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            onClick={() => loadData(false)}
            className="h-11 px-6 rounded-xl font-semibold"
          >
            Load more
          </Button>
        </div>
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
        onOpenReport={handleReportImage}
        onItemUpdated={() => loadData(true)}
      />

      <PostFormSheet
        isOpen={isPostOpen}
        onClose={onClosePost}
        onSuccess={() => loadData(true)}
      />

      <ReturnFormSheet
        item={returnItem}
        isOpen={isReturnOpen}
        onClose={() => {
          setIsReturnOpen(false);
          setReturnItem(null);
        }}
        onSuccess={() => loadData(true)}
      />

      <AdminEditSheet
        item={editItem}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditItem(null);
        }}
        onSuccess={() => loadData(true)}
      />
    </div>
  );
};
