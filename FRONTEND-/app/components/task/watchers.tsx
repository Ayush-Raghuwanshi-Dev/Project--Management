import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const displayName = (user: User) => `@${user.username}`;

export const Watchers = ({ watchers }: { watchers: User[] }) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
      <h3 className="text-lg font-medium mb-4">Watchers</h3>

      <div className="space-y-2">
        {watchers && watchers.length > 0 ? (
          watchers.map((watcher) => (
            <div key={watcher._id} className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={watcher.profilePicture} />
                <AvatarFallback>{(watcher.name || watcher.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <p className="text-sm text-muted-foreground">{displayName(watcher)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No watchers</p>
        )}
      </div>
    </div>
  );
};