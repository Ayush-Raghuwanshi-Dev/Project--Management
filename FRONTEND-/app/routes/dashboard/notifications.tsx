import { Loader } from "@/components/loader";
import { NoDataFound } from "@/components/no-data-found";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/fetch-utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type NotificationItem = {
  _id: string;
  message?: string;
  readAt?: string | null;
  createdAt: string;
  sender?: { username?: string; email?: string; profilePicture?: string };
  workspace?: { _id?: string; name?: string; color?: string };
  type?: string;
  status?: string;
  pdfUrl?: string;
  imageUrl?: string;
};

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["notifications", "page"],
    queryFn: async () => (await api.get("/user/notifications")).data,
  }) as {
    data?: { data?: NotificationItem[] };
    isPending: boolean;
  };

  const respondMutation = useMutation({
    mutationFn: async ({ notificationId, action }: { notificationId: string; action: "accept" | "reject" }) => {
      const res = await api.post(`/workspaces/invitations/${notificationId}/${action}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Action successful");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  if (isPending) {
    return <Loader />;
  }

  const notifications = data?.data || [];

  if (notifications.length === 0) {
    return (
      <NoDataFound
        title="No notifications"
        description="You are all caught up right now."
        buttonText="Go to Dashboard"
        buttonAction={() => (window.location.href = "/dashboard")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="size-5" />
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Recent updates and invites</p>
        </div>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification._id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={notification.sender?.profilePicture} />
                  <AvatarFallback>
                    {notification.sender?.username?.charAt(0).toUpperCase() || "N"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">
                    {notification.sender?.username || notification.sender?.email || "Notification"}
                  </CardTitle>
                  <CardDescription>{notification.message || "You have a new update."}</CardDescription>
                </div>
              </div>
              <Badge variant={notification.readAt ? "secondary" : "default"}>
                {notification.readAt ? "Read" : "Unread"}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{notification.workspace?.name ? `Workspace: ${notification.workspace.name}` : "Workspace update"}</span>
                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
              </div>
              
              {(notification.pdfUrl || notification.imageUrl) && (
                <div className="mt-2 flex gap-2">
                  {notification.pdfUrl && (
                    <a href={notification.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                      <FileText className="size-4" /> View PDF
                    </a>
                  )}
                  {notification.imageUrl && (
                    <a href={notification.imageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                      <ImageIcon className="size-4" /> View Image
                    </a>
                  )}
                </div>
              )}

              {notification.type === "workspace_invite" && notification.status === "pending" && (
                <div className="flex items-center gap-3 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 sm:flex-none"
                    disabled={respondMutation.isPending}
                    onClick={() =>
                      respondMutation.mutate({
                        notificationId: notification._id,
                        action: "accept",
                      })
                    }
                  >
                    <Check className="mr-2 size-4" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none text-red-500 hover:text-red-600 hover:bg-red-50"
                    disabled={respondMutation.isPending}
                    onClick={() =>
                      respondMutation.mutate({
                        notificationId: notification._id,
                        action: "reject",
                      })
                    }
                  >
                    <X className="mr-2 size-4" /> Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Notifications;