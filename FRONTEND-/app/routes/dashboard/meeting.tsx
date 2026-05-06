import { useState } from "react";
import { useSearchParams } from "react-router";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useAuth } from "@/provider/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

const MeetingPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  
  const defaultRoom = workspaceId ? `TaskHub-Workspace-${workspaceId}` : "TaskHub-General-Meeting";
  
  const [roomName, setRoomName] = useState(defaultRoom);
  const [isJoined, setIsJoined] = useState(false);

  if (isJoined) {
    return (
      <div className="flex flex-col h-[80vh] w-full rounded-lg overflow-hidden border shadow-sm mt-4">
        <div className="bg-muted px-4 py-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm">Meeting Room: {roomName}</span>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setIsJoined(false)}>
            Leave Meeting
          </Button>
        </div>
        <div className="flex-1 w-full bg-black">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={roomName}
            configOverwrite={{
              startWithAudioMuted: true,
              disableModeratorIndicator: true,
              startScreenSharing: true,
              enableEmailInStats: false,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            }}
            userInfo={{
              displayName: user?.name || user?.username || "Guest",
              email: user?.email || "",
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "100%";
              iframeRef.style.width = "100%";
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 p-4">
      <Card className="border-2 shadow-md">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto bg-blue-100 dark:bg-blue-900/40 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Video className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Video Meeting</CardTitle>
          <CardDescription className="text-base mt-2">
            Start or join a secure video conference with your team members directly from TaskHub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 bg-muted/30 p-6 rounded-xl border">
            <label className="text-sm font-semibold">Meeting Room Name</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                value={roomName} 
                onChange={(e) => setRoomName(e.target.value)} 
                placeholder="Enter a unique room name..."
                className="h-12 text-md"
              />
              <Button 
                onClick={() => setIsJoined(true)} 
                className="h-12 px-8 min-w-[140px] font-medium"
              >
                Join Meeting
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this exact room name with your team members so they can join you.
              {workspaceId && " By default, this is your workspace's dedicated meeting room."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingPage;
