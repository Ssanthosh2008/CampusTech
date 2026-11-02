import React from "react";
import { ItemFilters, ItemType } from "@/types";
import { categories } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface BrowseFiltersProps {
  filters: ItemFilters;
  onChange: (updated: ItemFilters) => void;
}

export const BrowseFilters: React.FC<BrowseFiltersProps> = ({ filters, onChange }) => {
  return (
    <section className="space-y-3 sticky top-16 md:top-20 z-20 py-3 bg-background/95 backdrop-blur-md border-b border-border/40">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value.toLowerCase() })}
          className="pl-10 h-11 rounded-full bg-card border-border shadow-xs text-base md:text-sm"
        />
      </div>

      {/* Type Toggle & Returned Switch */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <ToggleGroup
          value={[filters.type]}
          onValueChange={(val) => {
            const last = (val as string[])[(val as string[]).length - 1];
            if (last) {
              onChange({ ...filters, type: last as "all" | ItemType });
            }
          }}
          className="justify-start gap-1.5"
        >
          <ToggleGroupItem
            value="all"
            size="sm"
            className="rounded-full px-3.5 py-1 text-xs font-mono uppercase data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[pressed]:bg-accent data-[pressed]:text-accent-foreground"
          >
            All
          </ToggleGroupItem>
          <ToggleGroupItem
            value="lost"
            size="sm"
            className="rounded-full px-3.5 py-1 text-xs font-mono uppercase data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[pressed]:bg-accent data-[pressed]:text-accent-foreground"
          >
            Lost
          </ToggleGroupItem>
          <ToggleGroupItem
            value="found"
            size="sm"
            className="rounded-full px-3.5 py-1 text-xs font-mono uppercase data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[pressed]:bg-accent data-[pressed]:text-accent-foreground"
          >
            Found
          </ToggleGroupItem>
        </ToggleGroup>

        <button
          type="button"
          onClick={() => onChange({ ...filters, returned: !filters.returned })}
          className={`h-8 whitespace-nowrap rounded-full border px-3 text-xs font-mono uppercase transition-colors ${
            filters.returned
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          }`}
        >
          Show returned
        </button>
      </div>

      {/* Category Chips Bar with scroll hint */}
      <div className="relative group">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pr-6 scrollbar-none">
          <Badge
            variant={filters.category === "all" ? "default" : "outline"}
            onClick={() => onChange({ ...filters, category: "all" })}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-mono uppercase whitespace-nowrap transition-colors ${
              filters.category === "all"
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "border-border bg-card text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
            }`}
          >
            Everything
          </Badge>

          {categories.map((c) => (
            <Badge
              key={c}
              variant={filters.category === c ? "default" : "outline"}
              onClick={() => onChange({ ...filters, category: c })}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-mono uppercase whitespace-nowrap transition-colors ${
                filters.category === c
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
              }`}
            >
              {c}
            </Badge>
          ))}
        </div>
        {/* Visual scroll hint gradient on right edge */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-background via-background/80 to-transparent" />
      </div>
    </section>
  );
};
