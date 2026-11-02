import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface HeroSectionProps {
  onReportLost: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onReportLost }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-accent/10 p-6 sm:p-8 md:p-10 mb-6">
      <div className="relative z-10 max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
          CampusTech / Lost &amp; Found
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none mb-3">
          <span className="block">Lost it? Cool.</span>
          <span className="block text-foreground">We&apos;ve got it. Probably.</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-6">
          Post it here. Help it find its way back.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={onReportLost}
            className="h-11 px-5 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm shadow-sm"
          >
            Report a lost item
            <ArrowUpRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
          </Button>
          <span className="text-xs font-mono text-muted-foreground">Be specific. Be helpful.</span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute -right-6 -top-6 text-7xl md:text-9xl font-mono text-accent/10 select-none pointer-events-none transform -rotate-12"
      >
        ·⠂
      </div>
    </section>
  );
};

