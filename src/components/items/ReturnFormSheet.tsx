import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Item } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { createReturn } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const returnSchema = z.object({
  returned_to_name: z.string().trim().min(1, "Recipient name is required"),
  returned_to_contact: z.string().trim().optional(),
  returned_on: z.string().min(1, "Return date is required"),
  handover_location: z.string().trim().optional(),
  verification_notes: z.string().trim().optional(),
});

type ReturnFormValues = z.infer<typeof returnSchema>;

interface ReturnFormSheetProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnFormSheet: React.FC<ReturnFormSheetProps> = ({
  item,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      returned_to_name: "",
      returned_to_contact: "",
      returned_on: getLocalToday(),
      handover_location: "",
      verification_notes: "",
    },
  });

  if (!item) return null;

  const onSubmit = async (values: ReturnFormValues) => {
    if (!user) {
      toast.error("You must be signed in to record a return.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createReturn({
        item_id: item.id,
        recorded_by: user.id,
        returned_to_name: values.returned_to_name,
        returned_to_contact: values.returned_to_contact || null,
        returned_on: values.returned_on,
        handover_location: values.handover_location || null,
        verification_notes: values.verification_notes || null,
      });

      if (res.error) throw res.error;

      toast.success("Return recorded.");
      form.reset();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not record return";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto sm:max-w-xl sm:rounded-2xl sm:inset-x-auto sm:right-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] border-border bg-card p-6 sm:p-8"
      >
        <SheetHeader className="text-left space-y-1 pb-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            Record a return
          </div>
          <SheetTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {item.title}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground pt-1">
            Keep the audit trail honest and accurate.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4">
          <div className="space-y-1.5">
            <Label htmlFor="returned_to_name" className="text-xs font-semibold">
              Returned to name *
            </Label>
            <Input
              id="returned_to_name"
              placeholder="e.g. Alex Chen"
              {...form.register("returned_to_name")}
              className="h-11 rounded-xl bg-background border-border"
            />
            {form.formState.errors.returned_to_name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.returned_to_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="returned_to_contact" className="text-xs font-semibold">
              Their contact or roll number
            </Label>
            <Input
              id="returned_to_contact"
              placeholder="e.g. alex@campus.edu or +1..."
              {...form.register("returned_to_contact")}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="returned_on" className="text-xs font-semibold">
              Returned on *
            </Label>
            <Input
              id="returned_on"
              type="date"
              max={getLocalToday()}
              {...form.register("returned_on")}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="handover_location" className="text-xs font-semibold">
              Handover location
            </Label>
            <Input
              id="handover_location"
              placeholder="e.g. Library front desk"
              {...form.register("handover_location")}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="verification_notes" className="text-xs font-semibold">
              How was ownership verified?
            </Label>
            <Textarea
              id="verification_notes"
              placeholder="e.g. Unlocked phone with passcode, student ID matched name..."
              rows={3}
              {...form.register("verification_notes")}
              className="rounded-xl bg-background border-border resize-y"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl"
            >
              {isSubmitting ? "Recording…" : "Mark as returned"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-5 rounded-xl font-semibold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

