import type { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { inviteMemberSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Mail, Paperclip, Upload, X } from "lucide-react";
import { useInviteMemberMutation } from "@/hooks/use-workspace";
import { toast } from "sonner";
import { useRef, useState, useEffect, type ChangeEvent } from "react";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export const InviteMemberDialog = ({ isOpen, onOpenChange, workspaceId }: InviteMemberDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [attachmentData, setAttachmentData] = useState<{ fileName: string; fileUrl: string; isImage: boolean } | null>(null);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      username: "",
      message: "I would like to invite you to collaborate in this workspace.",
      pdfUrl: "",
      imageUrl: "",
    },
  });

  const { mutate, isPending } = useInviteMemberMutation();

  const handleAttachmentChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      setAttachmentError("Only image and PDF files are allowed.");
      event.target.value = "";
      clearAttachment();
      return;
    }

    if (isImage && file.size > 2 * 1024 * 1024) {
      setAttachmentError("Image files must be smaller than 2 MB.");
      event.target.value = "";
      clearAttachment();
      return;
    }

    if (isPdf && file.size > 4 * 1024 * 1024) {
      setAttachmentError("PDF files must be smaller than 4 MB.");
      event.target.value = "";
      clearAttachment();
      return;
    }

    const fileUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read attachment"));
      reader.readAsDataURL(file);
    });

    setAttachmentError(null);
    setAttachmentData({ fileName: file.name, fileUrl, isImage });
    if (isPdf) {
      form.setValue("pdfUrl", fileUrl);
      form.setValue("imageUrl", "");
    } else {
      form.setValue("imageUrl", fileUrl);
      form.setValue("pdfUrl", "");
    }
  };

  const clearAttachment = () => {
    setAttachmentError(null);
    setAttachmentData(null);
    form.setValue("pdfUrl", "");
    form.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        username: "",
        message: "I would like to invite you to collaborate in this workspace.",
        pdfUrl: "",
        imageUrl: "",
      });
      clearAttachment();
    }
  }, [isOpen, form]);

  const onSubmit = async (data: InviteMemberFormData) => {
    mutate(
      { workspaceId, ...data },
      {
        onSuccess: () => {
          toast.success("Invitation sent successfully");
          form.reset();
          onOpenChange(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Could not send invitation"),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Workspace</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unique Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="teammate_123" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-2">
              <FormLabel>Attachment (optional)</FormLabel>
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleAttachmentChange}
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Add document</p>
                    <p className="text-xs text-muted-foreground">PDFs under 4 MB, Images under 2 MB.</p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="shrink-0 gap-2">
                    <Upload className="size-4" />
                    Choose File
                  </Button>
                </div>
                {attachmentData && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <Paperclip className="size-4 text-blue-600" />
                      <span className="truncate">{attachmentData.fileName}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={clearAttachment} className="gap-2">
                      <X className="size-4" />
                      Remove
                    </Button>
                  </div>
                )}
                {attachmentError && (
                  <p className="mt-2 text-sm text-destructive">{attachmentError}</p>
                )}
              </div>
            </div>
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isPending}>
              <Mail className="mr-2 size-4" />
              {isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
