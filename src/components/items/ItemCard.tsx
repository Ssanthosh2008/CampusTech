import React from "react";
import { Item } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ItemCardProps {
  item: Item;
  onOpenDetail: (item: Item) => void;
  onOpenEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onOpenReport?: (itemId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onOpenDetail,
  onOpenEdit,
  onDelete,
  onOpenReport,
}) => {
  const { user, isAdmin } = useAuth();

  const formatPosted = (val?: string) => {
    if (!val) return "Just now";
    return new Date(val).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      onClick={() => onOpenDetail(item)}
      className="group cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-foreground/40 hover:shadow-md"
    >
      <div className="relative w-full aspect-[16/10] bg-secondary/50 flex items-center justify-center overflow-hidden border-b border-border/50">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={`Photo of ${item.title}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="text-muted-foreground text-3xl font-light">◌</span>
        )}
      </div>

      <CardContent className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                item.type === "lost"
                  ? "border-accent/40 text-accent bg-accent/5"
                  : "border-emerald-600/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                  item.type === "lost" ? "bg-accent" : "border border-current"
                }`}
              />
              {item.type}
            </Badge>

            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full"
            >
              {item.category}
            </Badge>

            {item.status === "returned" && (
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider border-dashed border-border text-muted-foreground px-2 py-0.5 rounded-full"
              >
                ✓ returned
              </Badge>
            )}
          </div>

          <h3 className="font-bold text-lg leading-snug line-clamp-1 text-foreground mb-1">
            {item.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {item.description || "No description provided."}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40 font-mono">
            <span className="truncate max-w-[55%]">{item.location || "Location not set"}</span>
            <span>{formatPosted(item.created_at)}</span>
          </div>

          {user && !isAdmin && onOpenReport && item.image_url && (
            <div className="mt-3 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReport(item.id);
                }}
                className="text-[11px] font-mono uppercase tracking-wider text-accent hover:underline"
              >
                Report image
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
              {onOpenEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs font-semibold h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEdit(item);
                  }}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 text-xs font-semibold h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

