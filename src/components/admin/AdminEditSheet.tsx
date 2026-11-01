import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Item, ItemStatus, ItemType } from "@/types";
import { categories, getItemContact, updateItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const editSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().max(1000).optional(),
  category: z.string().min(1),
  location: z.string().max(120).optional(),
  item_date: z.string().optional(),
  contact: z.string().trim().min(1, "Contact is required").max(180),
  status: z.enum(["open", "returned"]),
});

type EditFormValues = z.infer<typeof editSchema>;

interface AdminEditSheetProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminEditSheet: React.FC<AdminEditSheetProps> = ({
  item,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      type: "lost",
      title: "",
      description: "",
      category: categories[0],
      location: "",
      item_date: "",
      contact: "",
      status: "open",
    },
  });

  useEffect(() => {
    if (!item || !isOpen) return;

    form.reset({
      type: item.type,
      title: item.title,
      description: item.description || "",
      category: item.category,
      location: item.location || "",
      item_date: item.item_date || "",
      contact: item.contact || "",
      status: item.status,
    });

    if (!item.contact) {
      getItemContact(item.id).then((res) => {
        if (res.data) {
          form.setValue("contact", res.data);
        }
      });
    }
  }, [item, isOpen, form]);

  if (!item || !isAdmin) return null;

  const handleRemoveImage = async () => {
    const res = await updateItem(item.id, { image_url: null });
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Image removed.");
      onSuccess();
      onClose();
    }
  };

  const onSubmit = async (values: EditFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await updateItem(item.id, {
        type: values.type,
        title: values.title.trim(),
        description: values.description?.trim() || null,
        category: values.category,
        location: values.location?.trim() || null,
        item_date: values.item_date || null,
        contact: values.contact.trim(),
        status: values.status,
      });

      if (res.error) throw res.error;

      toast.success("Item updated.");
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not update item";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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
            Admin edit
          </div>
          <SheetTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {item.title}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground pt-1">
            Modify listing attributes or status.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-type" className="text-xs font-semibold">
              Type
            </Label>
            <Select
              value={form.watch("type")}
              onValueChange={(val) => {
                if (val) form.setValue("type", val as ItemType);
              }}
            >
              <SelectTrigger id="edit-type" className="w-full h-11 rounded-xl bg-background border-border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="found">Found</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-title" className="text-xs font-semibold">
              Title *
            </Label>
            <Input
              id="edit-title"
              maxLength={100}
              {...form.register("title")}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className="text-xs font-semibold">
              Description
            </Label>
            <Textarea
              id="edit-description"
              maxLength={1000}
              rows={3}
              {...form.register("description")}
              className="rounded-xl bg-background border-border resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-category" className="text-xs font-semibold">
              Category
            </Label>
            <Select
              value={form.watch("category")}
              onValueChange={(val) => {
                if (val) form.setValue("category", val);
              }}
            >
              <SelectTrigger id="edit-category" className="w-full h-11 rounded-xl bg-background border-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-location" className="text-xs font-semibold">
              Location
            </Label>
            <Input
              id="edit-location"
              maxLength={120}
              {...form.register("location")}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-date" className="text-xs font-semibold">
              Date
            </Label>
            <Input
              id="edit-date"
              type="date"
              {...form.register("item_date")}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-contact" className="text-xs font-semibold">
              Contact *
            </Label>
            <Input
              id="edit-contact"
              maxLength={180}
              {...form.register("contact")}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-status" className="text-xs font-semibold">
              Status
            </Label>
            <Select
              value={form.watch("status")}
              onValueChange={(val) => {
                if (val) form.setValue("status", val as ItemStatus);
              }}
            >
              <SelectTrigger id="edit-status" className="w-full h-11 rounded-xl bg-background border-border">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {item.image_url && (
            <div className="pt-2">
              <Button
                type="button"
                variant="destructive"
                className="w-full font-semibold"
                onClick={handleRemoveImage}
              >
                Remove image
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl"
            >
              {isSubmitting ? "Saving…" : "Save changes"}
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
