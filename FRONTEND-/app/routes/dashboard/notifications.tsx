import { Loader } from "@/components/loader";
import { NoDataFound } from "@/components/no-data-found";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/fetch-utils";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

type NotificationItem = {
  _id: string;
  message?: string;
  readAt?: string | null;
  createdAt: string;
  sender?: { username?: string; email?: string; profilePicture?: string };
  workspace?: { name?: string; color?: string };
};

const Notifications = () => {
  const { data, isPending } = useQuery({
    queryKey: ["notifications", "page"],
    queryFn: async () => (await api.get("/user/notifications")).data,
  }) as {
    data?: { data?: NotificationItem[] };
    isPending: boolean;
  };

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
            <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{notification.workspace?.name ? `Workspace: ${notification.workspace.name}` : "Workspace update"}</span>
              <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Notifications;