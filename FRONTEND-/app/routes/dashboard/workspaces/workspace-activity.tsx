import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceActivityQuery } from "@/hooks/use-workspace";
import type { ActivityLog } from "@/types";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

const WorkspaceActivity = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useWorkspaceActivityQuery(workspaceId, page, 20) as {
    data?: { data?: ActivityLog[]; pagination?: any };
    isLoading: boolean;
  };

  const items = useMemo(() => data?.data || [], [data]);
  const pagination = data?.pagination;

  if (isLoading) return <Loader />;
  if (!workspaceId) return <div>No workspace selected</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Activity Logs</h1>
          <p className="text-sm text-muted-foreground">
            Workspace audit trail (admin only).
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/workspaces/${workspaceId}`}>Back to workspace</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No activity yet.</div>
          ) : (
            items.map((log) => (
              <div key={log._id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {(log.user?.fullName || log.user?.name || log.user?.username || "User") as any}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.action} · {log.resourceType}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
                {log.details?.description && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {log.details.description}
                  </div>
                )}
              </div>
            ))
          )}

          {pagination && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceActivity;

