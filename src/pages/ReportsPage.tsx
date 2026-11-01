import React, { useEffect, useState, useCallback } from "react";
import { Item, ReportRecord } from "@/types";
import { deleteReport, getItem, listReports } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useHashRouter } from "@/context/HashRouterContext";
import { ItemDetailSheet } from "@/components/items/ItemDetailSheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReportsPageProps {
  onOpenDeleteAlert: (item: Item) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onOpenDeleteAlert }) => {
  const { isAdmin } = useAuth();
  const { navigate } = useHashRouter();

  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadReports = useCallback(async () => {
    if (!isAdmin) {
      navigate("#/browse");
      return;
    }

    setLoading(true);
    const res = await listReports();
    if (res.error) {
      toast.error(res.error.message || "Failed to load reports");
    } else {
      setReports(res.data || []);
    }
    setLoading(false);
  }, [isAdmin, navigate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleReview = async (itemId: string) => {
    const res = await getItem(itemId);
    if (res.error || !res.data) {
      toast.error("Item not found or already deleted.");
      return;
    }
    setSelectedItem(res.data);
    setIsDetailOpen(true);
  };

  const handleDismiss = async (reportId: string) => {
    const res = await deleteReport(reportId);
    if (res.error) {
      toast.error(res.error.message || "Could not dismiss report");
    } else {
      toast.success("Report dismissed.");
      loadReports();
    }
  };

  const handleDeletePost = async (itemId: string) => {
    const res = await getItem(itemId);
    if (res.error || !res.data) {
      toast.error("Item not found or already deleted.");
      return;
    }
    onOpenDeleteAlert(res.data);
  };

  const formatPosted = (val?: string) => {
    if (!val) return "Just now";
    return new Date(val).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 mb-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
          Admin / moderation
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mb-2">
          REPORTS<span className="text-accent">.</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Review images flagged by signed-in users.
        </p>
      </section>

      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {reports.length} {reports.length === 1 ? "report" : "reports"}
        </h2>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground text-sm font-mono animate-pulse">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-border rounded-2xl bg-card">
          <h2 className="text-xl font-bold mb-2">No reports.</h2>
          <p className="text-sm text-muted-foreground">Nothing needs review right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <article
              key={report.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border bg-card"
            >
              <div className="space-y-1">
                <strong className="text-base font-bold text-foreground">
                  {report.items?.title || "Deleted item"}
                </strong>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.reason}</p>
                <div className="text-xs font-mono text-muted-foreground">
                  {report.profiles?.email || "Unknown reporter"} · {formatPosted(report.created_at)}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReview(report.item_id)}
                  className="font-semibold text-xs"
                >
                  Review
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDismiss(report.id)}
                  className="font-semibold text-xs"
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletePost(report.item_id)}
                  className="font-semibold text-xs"
                >
                  Delete post
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ItemDetailSheet
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }}
        onItemUpdated={loadReports}
      />
    </div>
  );
};
