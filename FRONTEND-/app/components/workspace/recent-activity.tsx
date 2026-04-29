import type { WorkspaceActivity } from "@/types";
import { Clock3, User2 } from "lucide-react";

export const RecentActivity = ({
  activityLog = [],
}: {
  activityLog?: WorkspaceActivity[];
}) => {
  const orderedActivity = [...activityLog].sort(
    (first, second) =>
      new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime()
  );

  return (
    <aside className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            A live accountability trail for the workspace.
          </p>
        </div>
        <Clock3 className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {orderedActivity.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No activity yet.
          </div>
        ) : (
          orderedActivity.map((activity, index) => (
            <div key={`${activity._id || activity.timestamp.toString()}-${index}`} className="flex gap-3 rounded-xl border p-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User2 className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium leading-5">{activity.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};