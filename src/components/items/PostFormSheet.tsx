import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { categories, createItem } from "@/lib/api";
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
import { Camera, Upload, X } from "lucide-react";

const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const postSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().trim().min(1, "Title is required").max(100, "Max 100 characters"),
  description: z.string().max(1000, "Max 1000 characters").optional(),
  category: z.string().min(1, "Category is required"),
  location: z.string().max(120, "Max 120 characters").optional(),
  item_date: z.string().optional(),
  contact: z.string().trim().min(1, "Contact is required").max(180, "Max 180 characters"),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "lost" | "found";
  onSuccess: () => void;
}

export const PostFormSheet: React.FC<PostFormSheetProps> = ({
  isOpen,
  onClose,
  defaultType = "lost",
  onSuccess,
}) => {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      type: defaultType,
      title: "",
      description: "",
      category: categories[0],
      location: "",
      item_date: getLocalToday(),
      contact: "",
    },
  });

  const descriptionValue = form.watch("description") || "";

  const handleSelectFile = (file?: File) => {
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleClearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const onSubmit = async (values: PostFormValues) => {
    if (!user) {
      toast.error("You must be signed in to post an item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createItem(
        {
          type: values.type,
          title: values.title,
          description: values.description?.trim() || null,
          category: values.category,
          location: values.location?.trim() || null,
          item_date: values.item_date || null,
          contact: values.contact,
        },
        selectedPhoto,
        user.id
      );

      if (res.error) throw res.error;

      toast.success("Your post is live.");
      handleClearPhoto();
      form.reset();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not publish post";
      console.error("Post creation error:", err);
      toast.error(message);
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
            Create a post
          </div>
          <SheetTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Help it find its way back.
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground pt-1">
            The useful details are the kindest details.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4">
          {/* Item Type */}
          <div className="space-y-1.5">
            <Label htmlFor="post-type" className="text-xs font-semibold">
              Type
            </Label>
            <Select
              value={form.watch("type")}
              onValueChange={(val) => {
                if (val) form.setValue("type", val as "lost" | "found");
              }}
            >
              <SelectTrigger id="post-type" className="w-full h-11 rounded-xl bg-background border-border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="found">Found</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="post-title" className="text-xs font-semibold">
              Title *
            </Label>
            <Input
              id="post-title"
              placeholder="e.g. Blue water bottle"
              maxLength={100}
              {...form.register("title")}
              className="h-11 rounded-xl bg-background border-border"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="post-description" className="text-xs font-semibold">
                Description
              </Label>
              <span className="text-[11px] font-mono text-muted-foreground">
                {descriptionValue.length} / 1000
              </span>
            </div>
            <Textarea
              id="post-description"
              placeholder="Colour, marks, what was inside…"
              maxLength={1000}
              rows={3}
              {...form.register("description")}
              className="rounded-xl bg-background border-border resize-y min-h-[90px]"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="post-category" className="text-xs font-semibold">
              Category *
            </Label>
            <Select
              value={form.watch("category")}
              onValueChange={(val) => {
                if (val) form.setValue("category", val);
              }}
            >
              <SelectTrigger id="post-category" className="w-full h-11 rounded-xl bg-background border-border">
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

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="post-location" className="text-xs font-semibold">
              Location
            </Label>
            <Input
              id="post-location"
              placeholder="Where was it last seen?"
              maxLength={120}
              {...form.register("location")}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="post-date" className="text-xs font-semibold">
              Date
            </Label>
            <Input
              id="post-date"
              type="date"
              max={getLocalToday()}
              {...form.register("item_date")}
              className="h-11 rounded-xl bg-background border-border"
            />
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            <Label htmlFor="post-contact" className="text-xs font-semibold">
              Contact *
            </Label>
            <Input
              id="post-contact"
              placeholder="Email, phone, or roll number"
              maxLength={180}
              {...form.register("contact")}
              className="h-11 rounded-xl bg-background border-border"
            />
            {form.formState.errors.contact && (
              <p className="text-xs text-destructive">{form.formState.errors.contact.message}</p>
            )}
          </div>

          {/* Notice */}
          <div className="p-3 rounded-lg border-l-4 border-accent bg-accent/10 text-xs text-muted-foreground leading-relaxed">
            Photos of the ITEM only. No people, faces, selfies, memes, screenshots, or joke images.
            Violating posts will be removed.
          </div>

          {/* Photo Picker */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold">
                Photo <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              {selectedPhoto && (
                <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px]">
                  {selectedPhoto.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 font-medium text-xs h-10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Upload photo
              </Button>

              <Button
                type="button"
                variant="outline"
                className="flex-1 font-medium text-xs h-10"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                Take photo
              </Button>

              {selectedPhoto && (
                <Button
                  type="button"
                  variant="destructive"
                  className="font-medium text-xs h-10 px-3"
                  onClick={handleClearPhoto}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleSelectFile(e.target.files?.[0])}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
              onChange={(e) => handleSelectFile(e.target.files?.[0])}
            />

            {photoPreview && (
              <div className="mt-3 rounded-xl overflow-hidden aspect-[16/10] bg-secondary/40 border border-border">
                <img src={photoPreview} alt="Selected preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl"
            >
              {isSubmitting ? "Uploading…" : "Publish post"}
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
