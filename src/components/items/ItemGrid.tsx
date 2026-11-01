import React from "react";
import { Item } from "@/types";
import { ItemCard } from "./ItemCard";
import { Button } from "@/components/ui/button";

interface ItemGridProps {
  items: Item[];
  onOpenDetail: (item: Item) => void;
  onOpenEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onOpenReport?: (itemId: string) => void;
  onOpenPost?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ItemGrid: React.FC<ItemGridProps> = ({
  items,
  onOpenDetail,
  onOpenEdit,
  onDelete,
  onOpenReport,
  onOpenPost,
  emptyTitle = "Nothing here yet.",
  emptyDescription = "Be the helpful person who starts the trail.",
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4 border border-dashed border-border rounded-2xl bg-card">
        <div className="text-3xl text-accent mb-3 font-mono">
          · · ·<br />· ● ·<br />· · ·
        </div>
        <h2 className="text-xl font-bold mb-2">{emptyTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{emptyDescription}</p>
        {onOpenPost && (
          <Button onClick={onOpenPost} className="bg-accent hover:bg-accent/90 text-white font-semibold">
            Post an item
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onOpenDetail={onOpenDetail}
          onOpenEdit={onOpenEdit}
          onDelete={onDelete}
          onOpenReport={onOpenReport}
        />
      ))}
    </div>
  );
};
