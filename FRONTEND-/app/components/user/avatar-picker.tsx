import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/provider/auth-context";
import { api } from "@/lib/fetch-utils";
import { toast } from "sonner";
import { Check } from "lucide-react";

const AVATAR_URLS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Bandit",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Mimi",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Loki",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Sammy",
];

export const AvatarPicker = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { user, updateUser } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = React.useState(user?.profilePicture || AVATAR_URLS[0]);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.put("/user/profile-picture", { profilePicture: selectedAvatar });
      updateUser({ ...(user as any), ...(data.user || {}), profilePicture: selectedAvatar });
      toast.success("Profile picture updated");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile picture");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Choose an Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[55vh] grid-cols-4 gap-3 overflow-y-auto py-3">
          {AVATAR_URLS.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedAvatar(url)}
              className="relative rounded-md border bg-slate-50 p-1 hover:border-blue-500"
            >
              <img src={url} alt="Avatar option" className="w-full rounded-md" />
              {selectedAvatar === url && <Check className="absolute right-1 top-1 size-4 rounded-full bg-blue-600 p-0.5 text-white" />}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white hover:bg-blue-700">
            {isSaving ? "Saving..." : "Save Avatar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
