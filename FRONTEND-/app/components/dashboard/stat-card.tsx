import type { StatsCardProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
  const items = [
    ["Projects", data.totalProjects],
    ["Tasks", data.totalTasks],
    ["In Progress", data.totalTaskInProgress],
    ["Completed", data.totalTaskCompleted],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <Card key={label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
