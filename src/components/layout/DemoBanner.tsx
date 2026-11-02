import React from "react";
import { isDemo } from "@/lib/config";

export const DemoBanner: React.FC = () => {
  if (!isDemo) return null;

  return (
    <div className="bg-accent/15 text-accent border-b border-accent/25 px-4 py-2 text-center text-xs tracking-wide font-medium">
      DEMO MODE <span className="text-muted-foreground ml-2">Local sample data · sign in to connect</span>
    </div>
  );
};

