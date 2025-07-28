import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  Plus,
  Clock,
  Search,
  Filter,
  Play,
  Pause,
  History,
  Eye,
  Zap,
  CheckCircle,
  XCircle,
  Trash2,
  Settings,
  Database,
  FileText,
  Link,
  RefreshCw,
} from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiLinkedin,
  SiTiktok,
  SiYoutube,
  SiDiscord,
  SiTelegram,
} from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface PostSchedule {
  id: number;
  userId: string;
  name: string;
  description?: string;
  creationMode: string;
  selectedPlatforms: string[];
  platformConfigs: any;
  scheduleType: string;
  scheduleConfig: any;
  links?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastExecutedAt?: string;
  aiSubject?: string;
  title?: string;
  content?: string;
  executionMode?: string;
  totalExecutions?: number;
  successfulExecutions?: number;
}

interface ScheduleExecution {
  id: number;
  scheduleId: number;
  userId: string;
  executedAt: string;
  status: string;
  message: string | null;
  platformsExecuted: string[] | null;
  executionDuration: number | null;
}

// Platform configurations
const platformConfigs = [
  {
    id: "facebook",
    name: "Facebook",
    icon: SiFacebook,
    color: "#1877F2",
    bgClass: "bg-blue-600",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: SiInstagram,
    color: "#E4405F",
    bgClass: "bg-gradient-to-tr from-purple-500 to-pink-500",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: SiLinkedin,
    color: "#0A66C2",
    bgClass: "bg-blue-700",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: SiTiktok,
    color: "#000000",
    bgClass: "bg-black",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: SiYoutube,
    color: "#FF0000",
    bgClass: "bg-red-600",
  },
  {
    id: "discord",
    name: "Discord",
    icon: SiDiscord,
    color: "#5865F2",
    bgClass: "bg-indigo-600",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: SiTelegram,
    color: "#26A5E4",
    bgClass: "bg-sky-500",
  },
];

// Helper functions
function calculateNextRunTime(schedule: PostSchedule): Date | null {
  if (!schedule.isActive) return null;
  const now = new Date();
  const nextRuns: Date[] = [];

  if (schedule.scheduleConfig?.type === "daily") {
    schedule.scheduleConfig.daily?.forEach((daily: any) => {
      if (daily.hour === undefined || daily.minute === undefined) return; // Skip if time is missing
      const next = new Date();
      next.setHours(daily.hour, daily.minute, 0, 0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      nextRuns.push(next);
    });
  }

  if (schedule.scheduleConfig?.type === "weekly") {
    schedule.scheduleConfig.weekly?.forEach((weekly: any) => {
      // Handle both 'day' and 'dayOfWeek' field names for compatibility
      const dayValue = weekly.day || weekly.dayOfWeek;
      if (!dayValue) return; // Skip if no day is specified

      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const targetDay = dayNames.indexOf(dayValue.toLowerCase());
      if (targetDay === -1) return; // Skip if invalid day name

      const next = new Date();
      const currentDay = next.getDay();
      let daysUntilTarget = targetDay - currentDay;
      if (
        daysUntilTarget <= 0 ||
        (daysUntilTarget === 0 &&
          next.getHours() >= weekly.hour &&
          next.getMinutes() >= weekly.minute)
      ) {
        daysUntilTarget += 7;
      }
      next.setDate(next.getDate() + daysUntilTarget);
      next.setHours(weekly.hour || 0, weekly.minute || 0, 0, 0);
      nextRuns.push(next);
    });
  }

  if (schedule.scheduleConfig?.type === "monthly") {
    schedule.scheduleConfig.monthly?.forEach((monthly: any) => {
      if (
        monthly.day === undefined ||
        monthly.hour === undefined ||
        monthly.minute === undefined
      )
        return; // Skip if missing data
      const next = new Date();
      next.setDate(monthly.day);
      next.setHours(monthly.hour, monthly.minute, 0, 0);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      nextRuns.push(next);
    });
  }

  if (schedule.scheduleConfig?.type === "calendar") {
    schedule.scheduleConfig.calendar?.forEach((calendar: any) => {
      if (
        !calendar.date ||
        calendar.hour === undefined ||
        calendar.minute === undefined
      )
        return; // Skip if missing data
      const next = new Date(calendar.date);
      next.setHours(calendar.hour, calendar.minute, 0, 0);
      if (next > now) {
        nextRuns.push(next);
      }
    });
  }

  const validNextRuns = nextRuns
    .filter((date: Date) => date > now)
    .sort((a: Date, b: Date) => a.getTime() - b.getTime());
  return validNextRuns.length > 0 ? validNextRuns[0] : null;
}

function formatScheduleInfo(schedule: PostSchedule) {
  const type = schedule.scheduleType;
  switch (type) {
    case "daily":
      return `Daily at ${schedule.scheduleConfig?.daily?.[0] ? `${String(schedule.scheduleConfig.daily[0].hour).padStart(2, "0")}:${String(schedule.scheduleConfig.daily[0].minute).padStart(2, "0")}` : "configured times"}`;
    case "weekly":
      return `Weekly on ${schedule.scheduleConfig?.weekly?.[0]?.day || "configured days"}`;
    case "monthly":
      return `Monthly on day ${schedule.scheduleConfig?.monthly?.[0]?.day || "configured days"}`;
    case "calendar":
      return `Calendar dates (${schedule.scheduleConfig?.calendar?.length || 0} scheduled)`;
    default:
      return "Custom schedule";
  }
}

function getPlatformConfig(platformId: string) {
  return (
    platformConfigs.find((p) => p.id === platformId) || {
      id: platformId,
      name: platformId,
      icon: SiFacebook,
      color: "#666",
      bgClass: "bg-gray-500",
    }
  );
}

export default function PostSchedule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [historyScheduleId, setHistoryScheduleId] = useState<number | null>(
    null,
  );
  const [runningScheduleId, setRunningScheduleId] = useState<number | null>(
    null,
  );
  const [configDetailsSchedule, setConfigDetailsSchedule] =
    useState<PostSchedule | null>(null);
  const [isConfigDetailsModalOpen, setIsConfigDetailsModalOpen] =
    useState(false);

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["/api/post-schedules"],
  });

  // Fetch social media configs for connection status
  const { data: socialConfigs = [], refetch: refetchSocialConfigs } = useQuery({
    queryKey: ["/api/social-media-configs"],
    staleTime: 0, // Always fetch fresh data for social media configs
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refetch every 10 seconds to keep data fresh
  });

  // Fetch execution history
  const { data: executionHistory = [], isLoading: isLoadingHistory } = useQuery(
    {
      queryKey: ["/api/post-schedules", historyScheduleId, "history"],
      queryFn: async () => {
        if (!historyScheduleId) return [];
        const response = await fetch(
          `/api/post-schedules/${historyScheduleId}/history`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error("Failed to fetch execution history");
        return response.json();
      },
      enabled: !!historyScheduleId,
    },
  );

  // Check if platform is connected
  const isPlatformConnected = (platformId: string) => {
    if (!socialConfigs || !Array.isArray(socialConfigs)) return false;
    const config = socialConfigs.find(
      (config: any) => config.platformId === platformId,
    );
    return config && config.apiKey && config.testStatus === "connected";
  };

  // Check if any platform is disconnected
  const hasDisconnectedPlatforms = () => {
    if (!schedules || !Array.isArray(schedules)) return false;
    const allPlatforms = new Set<string>();
    (schedules as PostSchedule[]).forEach((schedule: PostSchedule) => {
      if (
        schedule.selectedPlatforms &&
        Array.isArray(schedule.selectedPlatforms)
      ) {
        schedule.selectedPlatforms.forEach((platform) =>
          allPlatforms.add(platform),
        );
      }
    });
    return Array.from(allPlatforms).some(
      (platform) => !isPlatformConnected(platform),
    );
  };

  // Mutations
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/post-schedules/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/post-schedules"] });
      toast({ title: "Schedule updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update schedule", variant: "destructive" });
    },
  });

  const runScheduleMutation = useMutation({
    mutationFn: async (scheduleId: number) => {
      setRunningScheduleId(scheduleId);
      return apiRequest("POST", `/api/post-schedules/${scheduleId}/run`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/post-schedules"] });
      toast({ title: "Schedule executed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to execute schedule", variant: "destructive" });
    },
    onSettled: () => {
      setRunningScheduleId(null);
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (scheduleId: number) => {
      return apiRequest("DELETE", `/api/post-schedules/${scheduleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/post-schedules"] });
      toast({ title: "Schedule deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete schedule", variant: "destructive" });
    },
  });

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    if (!schedules || !Array.isArray(schedules)) return [];
    return schedules.filter((schedule: PostSchedule) => {
      const matchesSearch = schedule.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "active" && schedule.isActive) ||
        (filterBy === "inactive" && !schedule.isActive) ||
        (filterBy === "ai" && schedule.creationMode === "ai") ||
        (filterBy === "manual" && schedule.creationMode === "manual");

      return matchesSearch && matchesFilter;
    });
  }, [schedules, searchQuery, filterBy]);

  if (isLoading) {
    return (
      <Layout>
        <div className="page-content">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  function renderScheduleContent() {
    if (filteredSchedules.length === 0) {
      return (
        <Card className="text-center py-8">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <CardTitle className="text-xl mb-2">No Schedules Found</CardTitle>
            <CardDescription className="mb-6">
              {searchQuery || filterBy !== "all"
                ? "No schedules match your current filters. Try adjusting your search or filter settings."
                : "You haven't created any post schedules yet. Get started by creating your first automated schedule!"}
            </CardDescription>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setLocation("/post-schedule-wizard")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilterBy("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-8">
        {filteredSchedules.map((schedule: PostSchedule) => (
          <Card
            key={schedule.id}
            className="modern-card hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-800 dark:via-gray-800/70 dark:to-gray-800"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <CardTitle className="text-standard text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {schedule.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-sm bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300"
                    >
                      #{schedule.id}
                    </Badge>
                  </div>
                  {schedule.description && (
                    <div className="mb-4">
                      <p className="text-base text-muted-foreground italic">
                        {schedule.description}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 flex-wrap mb-5">
                    <Badge
                      variant={
                        schedule.creationMode === "ai" ? "default" : "secondary"
                      }
                      className={`text-base ${
                        schedule.creationMode === "ai"
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {schedule.creationMode === "ai"
                        ? "🤖 AI Generated Content"
                        : "✍️ Manual Content"}
                    </Badge>
                    <CardDescription className="text-lg text-muted font-medium">
                      {formatScheduleInfo(schedule)}
                    </CardDescription>
                  </div>

                  {/* Platform Icons and Action Buttons in same line */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base text-muted font-medium">
                        Platforms:
                      </span>
                      <div className="flex items-center gap-1">
                        {schedule.selectedPlatforms?.map(
                          (platformId: string) => {
                            const platformConfig =
                              getPlatformConfig(platformId);
                            const Icon = platformConfig.icon;
                            const isConnected = isPlatformConnected(platformId);
                            return (
                              <TooltipProvider key={platformId}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`p-1.5 rounded-lg border transition-all duration-300 relative ${
                                        isConnected
                                          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transform hover:scale-110"
                                          : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60 cursor-pointer hover:opacity-80 hover:scale-105"
                                      }`}
                                      onClick={() =>
                                        !isConnected &&
                                        setLocation("/social-media")
                                      }
                                    >
                                      <Icon
                                        className="h-6 w-6"
                                        style={{
                                          color: isConnected
                                            ? platformConfig.color
                                            : "#9CA3AF",
                                        }}
                                      />
                                      {/* Connection Status Indicator */}
                                      {isConnected ? (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                      ) : (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {platformConfig.name}{" "}
                                      {isConnected
                                        ? "(Connected)"
                                        : "(Not Connected - Click to configure)"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - Right side of the same line */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`font-semibold transition-all duration-300 text-sm px-4 py-2 rounded-lg ${
                          !schedule.isActive
                            ? "bg-gray-50 hover:bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                            : "bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-300 text-green-700 shadow-md hover:shadow-lg transform hover:scale-105"
                        }`}
                        onClick={() => runScheduleMutation.mutate(schedule.id)}
                        disabled={
                          runningScheduleId === schedule.id ||
                          !schedule.isActive
                        }
                      >
                        {runningScheduleId === schedule.id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            {!schedule.isActive
                              ? "Scheduler Inactive"
                              : "Run Now"}
                          </>
                        )}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-300 text-blue-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm px-4 py-2 rounded-lg"
                            onClick={() => setHistoryScheduleId(schedule.id)}
                          >
                            <History className="h-4 w-4 mr-2" />
                            Run History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Run History - {schedule.name}
                            </DialogTitle>
                            <DialogDescription>
                              View execution history and performance details for
                              this schedule
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {isLoadingHistory ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                              </div>
                            ) : !executionHistory ||
                              !Array.isArray(executionHistory) ||
                              executionHistory.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">
                                  No execution history
                                </p>
                                <p className="text-sm">
                                  This schedule hasn't been executed yet.
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                    Execution History Overview
                                  </h4>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-blue-700 dark:text-blue-300 font-medium">
                                        Total Runs:
                                      </span>
                                      <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                        {
                                          (
                                            executionHistory as ScheduleExecution[]
                                          ).length
                                        }
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-green-700 dark:text-green-300 font-medium">
                                        Successful:
                                      </span>
                                      <div className="text-lg font-bold text-green-800 dark:text-green-200">
                                        {
                                          (
                                            executionHistory as ScheduleExecution[]
                                          ).filter(
                                            (e) => e.status === "success",
                                          ).length
                                        }
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-red-700 dark:text-red-300 font-medium">
                                        Failed:
                                      </span>
                                      <div className="text-lg font-bold text-red-800 dark:text-red-200">
                                        {
                                          (
                                            executionHistory as ScheduleExecution[]
                                          ).filter((e) => e.status === "failed")
                                            .length
                                        }
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {(executionHistory as ScheduleExecution[])
                                    .sort(
                                      (a, b) =>
                                        new Date(b.executedAt).getTime() -
                                        new Date(a.executedAt).getTime(),
                                    )
                                    .map((execution: ScheduleExecution) => (
                                      <div
                                        key={execution.id}
                                        className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <Badge
                                              variant={
                                                execution.status === "success"
                                                  ? "default"
                                                  : execution.status ===
                                                      "failed"
                                                    ? "destructive"
                                                    : "secondary"
                                              }
                                              className="text-xs"
                                            >
                                              {execution.status ===
                                              "success" ? (
                                                <>
                                                  <CheckCircle className="h-3 w-3 mr-1" />
                                                  Success
                                                </>
                                              ) : execution.status ===
                                                "failed" ? (
                                                <>
                                                  <XCircle className="h-3 w-3 mr-1" />
                                                  Failed
                                                </>
                                              ) : (
                                                <>
                                                  <Clock className="h-3 w-3 mr-1" />
                                                  Pending
                                                </>
                                              )}
                                            </Badge>
                                            <div className="flex flex-col">
                                              <span className="text-sm font-medium text-standard">
                                                {new Date(
                                                  execution.executedAt,
                                                ).toLocaleDateString(
                                                  undefined,
                                                  {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                  },
                                                )}
                                              </span>
                                              <span className="text-xs text-muted">
                                                {new Date(
                                                  execution.executedAt,
                                                ).toLocaleTimeString(
                                                  undefined,
                                                  {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                  },
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            {execution.executionDuration && (
                                              <div className="text-sm text-muted">
                                                <Clock className="h-3 w-3 inline mr-1" />
                                                {execution.executionDuration <
                                                1000
                                                  ? `${execution.executionDuration}ms`
                                                  : `${(execution.executionDuration / 1000).toFixed(1)}s`}
                                              </div>
                                            )}
                                            <div className="text-xs text-muted">
                                              ID: {execution.id}
                                            </div>
                                          </div>
                                        </div>

                                        {execution.platformsExecuted &&
                                          execution.platformsExecuted.length >
                                            0 && (
                                            <div>
                                              <span className="text-sm font-medium text-muted mb-2 block">
                                                Platforms Executed:
                                              </span>
                                              <div className="flex flex-wrap gap-2">
                                                {execution.platformsExecuted.map(
                                                  (platformId) => {
                                                    const config =
                                                      getPlatformConfig(
                                                        platformId,
                                                      );
                                                    const Icon = config.icon;
                                                    const isConnected =
                                                      isPlatformConnected(
                                                        platformId,
                                                      );
                                                    return (
                                                      <div
                                                        key={platformId}
                                                        className={`${isConnected ? config.bgClass : "bg-gray-400 dark:bg-gray-600"} text-white text-xs flex items-center gap-1 px-2 py-1 rounded-md shadow-sm transition-all ${
                                                          !isConnected
                                                            ? "opacity-70 cursor-pointer hover:opacity-90 hover:scale-105 hover:shadow-lg transform"
                                                            : ""
                                                        }`}
                                                        onClick={
                                                          !isConnected
                                                            ? () =>
                                                                setLocation(
                                                                  "/social-media",
                                                                )
                                                            : undefined
                                                        }
                                                        title={
                                                          !isConnected
                                                            ? "Click to configure this platform"
                                                            : undefined
                                                        }
                                                      >
                                                        <Icon
                                                          className="h-3 w-3"
                                                          style={{
                                                            color: config.color,
                                                          }}
                                                        />
                                                        {config.name}
                                                      </div>
                                                    );
                                                  },
                                                )}
                                              </div>
                                            </div>
                                          )}

                                        {execution.message && (
                                          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                                            <span className="text-sm font-medium text-muted mb-1 block">
                                              Message:
                                            </span>
                                            <p className="text-sm text-standard">
                                              {execution.message}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog
                        open={isConfigDetailsModalOpen}
                        onOpenChange={setIsConfigDetailsModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-semibold bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-300 text-purple-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm px-4 py-2 rounded-lg"
                            onClick={() => setConfigDetailsSchedule(schedule)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Config Details
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* Delete and Toggle Buttons - Top Right */}
                <div className="flex items-center gap-2 ml-4">
                  <TooltipProvider>
                    <Tooltip>
                      <Dialog>
                        <DialogTrigger asChild>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-red-300 text-red-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-xs px-2 py-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Schedule</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to permanently delete "
                              {schedule.name}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline">Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                deleteScheduleMutation.mutate(schedule.id)
                              }
                              disabled={deleteScheduleMutation.isPending}
                            >
                              {deleteScheduleMutation.isPending ? (
                                <>
                                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <TooltipContent side="left">
                        <p>Delete Schedule</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted">
                      {schedule.isActive ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={(checked) =>
                        updateScheduleMutation.mutate({
                          id: schedule.id,
                          isActive: checked,
                        })
                      }
                      disabled={updateScheduleMutation.isPending}
                    />
                  </div>
                </div>

              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                      Next Run
                    </p>
                    <p className="text-base font-semibold text-orange-700 dark:text-orange-300">
                      {(() => {
                        const nextRun = calculateNextRunTime(schedule);
                        if (!nextRun) return "Inactive";
                        return nextRun.toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium">Created</p>
                    <p className="text-sm font-semibold text-standard">
                      {new Date(schedule.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {schedule.lastExecutedAt ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Last Execution
                      </p>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {new Date(schedule.lastExecutedAt).toLocaleString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-medium">
                        Execution Status
                      </p>
                      <p className="text-sm font-semibold text-gray-500">
                        Never executed
                      </p>
                    </div>
                  </div>
                )}
              </div>


            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="page-content-full post-schedule-content">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Post Scheduler
            </h1>
            <p className="text-enhanced mt-1 text-muted">
              Manage and monitor your automated posting schedules
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => refetchSocialConfigs()}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button
              onClick={() => setLocation("/post-schedule-wizard")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schedules</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
              <SelectItem value="ai">AI Generated Content</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Warning message for disconnected platforms */}
      {hasDisconnectedPlatforms() && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Social Media Platform Configuration Required
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                Some social media platforms are not connected. Click on any
                disconnected platform below to configure and test it. Posts will
                only be published to active platforms if some are disconnected.
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    (schedules as PostSchedule[])?.flatMap(
                      (s: PostSchedule) => s.selectedPlatforms || [],
                    ) || [],
                  ),
                )
                  .filter(
                    (platformId: string) => !isPlatformConnected(platformId),
                  )
                  .map((platformId: string) => {
                    const config = getPlatformConfig(platformId);
                    const Icon = config.icon;
                    return (
                      <button
                        key={platformId}
                        onClick={() => setLocation("/social-media")}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: config.color }}
                        />
                        <span className="text-sm font-medium">
                          {config.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (Not Connected)
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {renderScheduleContent()}

      {/* Config Details Modal */}
      <Dialog
        open={isConfigDetailsModalOpen}
        onOpenChange={setIsConfigDetailsModalOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Complete Configuration Details - {configDetailsSchedule?.name}
            </DialogTitle>
            <DialogDescription>
              Comprehensive view of all database-persisted configuration data
              for this scheduler
            </DialogDescription>
          </DialogHeader>

          {configDetailsSchedule && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-standard mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted">Schedule ID:</span>
                    <div className="mt-1 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {configDetailsSchedule.id}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted">
                      Schedule Name:
                    </span>
                    <div className="mt-1 text-standard">
                      {configDetailsSchedule.name}
                    </div>
                  </div>
                  {configDetailsSchedule.description && (
                    <div className="col-span-2">
                      <span className="font-medium text-muted">
                        Description:
                      </span>
                      <div className="mt-1 text-standard italic">
                        {configDetailsSchedule.description}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-muted">
                      Creation Mode:
                    </span>
                    <div className="mt-1">
                      <Badge
                        variant={
                          configDetailsSchedule.creationMode === "ai"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {configDetailsSchedule.creationMode === "ai"
                          ? "🤖 AI Generated Content"
                          : "✏️ Manual Content"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted">Status:</span>
                    <div className="mt-1">
                      <Badge
                        variant={
                          configDetailsSchedule.isActive
                            ? "default"
                            : "secondary"
                        }
                      >
                        {configDetailsSchedule.isActive
                          ? "✅ Active"
                          : "⏸️ Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted">
                      Created Date:
                    </span>
                    <div className="mt-1 text-standard">
                      {new Date(
                        configDetailsSchedule.createdAt,
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted">
                      Last Executed:
                    </span>
                    <div className="mt-1 text-standard">
                      {configDetailsSchedule.lastExecutedAt
                        ? new Date(
                            configDetailsSchedule.lastExecutedAt,
                          ).toLocaleString()
                        : "Never"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Configuration */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-standard mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  Platform Configuration
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-muted">
                      Selected Platforms:
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {configDetailsSchedule.selectedPlatforms.map(
                        (platformId) => {
                          const config = getPlatformConfig(platformId);
                          const Icon = config.icon;
                          const isConnected = isPlatformConnected(platformId);
                          return (
                            <div
                              key={platformId}
                              className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${
                                isConnected
                                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200"
                                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200"
                              }`}
                            >
                              <Icon
                                className="h-3.5 w-3.5"
                                style={{
                                  color: isConnected ? config.color : "#9CA3AF",
                                }}
                              />
                              {config.name}
                              <span
                                className={`text-xs font-medium ${
                                  isConnected
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {isConnected ? "✓" : "✗"}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Configuration */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-standard mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Schedule Configuration
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-muted">
                      Schedule Type:
                    </span>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                      >
                        {configDetailsSchedule.scheduleType}
                      </Badge>
                    </div>
                  </div>
                  {configDetailsSchedule.scheduleConfig && (
                    <div className="space-y-2">
                      {/* Check different schedule types based on actual data structure */}
                      {configDetailsSchedule.scheduleType === "daily" &&
                        configDetailsSchedule.scheduleConfig.daily && (
                          <div>
                            <span className="font-medium text-muted">
                              Daily Schedules:
                            </span>
                            <div className="mt-1 space-y-1">
                              {configDetailsSchedule.scheduleConfig.daily.map(
                                (schedule: any, index: number) => (
                                  <div
                                    key={index}
                                    className="text-sm bg-white dark:bg-gray-800 border rounded px-2 py-1"
                                  >
                                    📅 Every day at {schedule.hour}:
                                    {schedule.minute
                                      .toString()
                                      .padStart(2, "0")}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {configDetailsSchedule.scheduleType === "weekly" &&
                        configDetailsSchedule.scheduleConfig.weekly && (
                          <div>
                            <span className="font-medium text-muted">
                              Weekly Schedules:
                            </span>
                            <div className="mt-1 space-y-1">
                              {configDetailsSchedule.scheduleConfig.weekly.map(
                                (schedule: any, index: number) => (
                                  <div
                                    key={index}
                                    className="text-sm bg-white dark:bg-gray-800 border rounded px-2 py-1"
                                  >
                                    📅 Every {schedule.dayOfWeek} at{" "}
                                    {schedule.hour}:
                                    {schedule.minute
                                      .toString()
                                      .padStart(2, "0")}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {configDetailsSchedule.scheduleType === "monthly" &&
                        configDetailsSchedule.scheduleConfig.monthly && (
                          <div>
                            <span className="font-medium text-muted">
                              Monthly Schedules:
                            </span>
                            <div className="mt-1 space-y-1">
                              {configDetailsSchedule.scheduleConfig.monthly.map(
                                (schedule: any, index: number) => (
                                  <div
                                    key={index}
                                    className="text-sm bg-white dark:bg-gray-800 border rounded px-2 py-1"
                                  >
                                    📅 Day {schedule.dayOfMonth} of every month
                                    at {schedule.hour}:
                                    {schedule.minute
                                      .toString()
                                      .padStart(2, "0")}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {configDetailsSchedule.scheduleType === "calendar" &&
                        configDetailsSchedule.scheduleConfig.calendar && (
                          <div>
                            <span className="font-medium text-muted">
                              Calendar Schedules:
                            </span>
                            <div className="mt-1 space-y-1">
                              {configDetailsSchedule.scheduleConfig.calendar.map(
                                (schedule: any, index: number) => (
                                  <div
                                    key={index}
                                    className="text-sm bg-white dark:bg-gray-800 border rounded px-2 py-1"
                                  >
                                    📅{" "}
                                    {new Date(
                                      schedule.date,
                                    ).toLocaleDateString()}{" "}
                                    at {schedule.hour}:
                                    {schedule.minute
                                      .toString()
                                      .padStart(2, "0")}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Platform-Specific Settings */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-standard mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-orange-600" />
                  Platform-Specific Settings
                </h4>
                <div className="text-sm text-muted mb-3">
                  Content format preferences for each platform (not actual
                  content data)
                </div>
                <div className="space-y-3">
                  {configDetailsSchedule.selectedPlatforms &&
                    configDetailsSchedule.selectedPlatforms.map(
                      (platformId: string) => {
                        const platformConfig = getPlatformConfig(platformId);
                        const Icon = platformConfig.icon;
                        const config =
                          configDetailsSchedule.platformConfigs?.[platformId] ||
                          {};
                        return (
                          <div
                            key={platformId}
                            className="bg-white dark:bg-gray-800 border rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Icon
                                className="h-4 w-4"
                                style={{ color: platformConfig.color }}
                              />
                              <span className="font-medium text-standard">
                                {platformConfig.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${config.includeTitle !== false ? "bg-green-500" : "bg-gray-300"}`}
                                ></span>
                                <span>
                                  Title:{" "}
                                  {config.includeTitle !== false
                                    ? "Enabled"
                                    : "Disabled"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${config.includeBody !== false ? "bg-green-500" : "bg-gray-300"}`}
                                ></span>
                                <span>
                                  Body:{" "}
                                  {config.includeBody !== false
                                    ? "Enabled"
                                    : "Disabled"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${config.includeImage !== false ? "bg-green-500" : "bg-gray-300"}`}
                                ></span>
                                <span>
                                  Image:{" "}
                                  {config.includeImage !== false
                                    ? "Enabled"
                                    : "Disabled"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${config.includeVideo !== false ? "bg-green-500" : "bg-gray-300"}`}
                                ></span>
                                <span>
                                  Video:{" "}
                                  {config.includeVideo !== false
                                    ? "Enabled"
                                    : "Disabled"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${config.includeHashtags !== false ? "bg-green-500" : "bg-gray-300"}`}
                                ></span>
                                <span>
                                  Hashtags:{" "}
                                  {config.includeHashtags !== false
                                    ? "Enabled"
                                    : "Disabled"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                </div>
              </div>

              {/* Links Configuration */}
              {configDetailsSchedule.links && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-standard mb-3 flex items-center gap-2">
                    <Link className="h-4 w-4 text-purple-600" />
                    Links Configuration
                  </h4>
                  <div className="space-y-2">
                    {/* Handle different possible link field names */}
                    {(configDetailsSchedule.links.websiteLink ||
                      configDetailsSchedule.links.website) && (
                      <div>
                        <span className="font-medium text-muted">
                          Website Link:
                        </span>
                        <div className="mt-1">
                          <a
                            href={
                              configDetailsSchedule.links.websiteLink ||
                              configDetailsSchedule.links.website
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all text-sm"
                          >
                            {configDetailsSchedule.links.websiteLink ||
                              configDetailsSchedule.links.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {(configDetailsSchedule.links.additionalLink1 ||
                      configDetailsSchedule.links.link1) && (
                      <div>
                        <span className="font-medium text-muted">
                          Additional Link 1:
                        </span>
                        <div className="mt-1">
                          <a
                            href={
                              configDetailsSchedule.links.additionalLink1 ||
                              configDetailsSchedule.links.link1
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all text-sm"
                          >
                            {configDetailsSchedule.links.additionalLink1 ||
                              configDetailsSchedule.links.link1}
                          </a>
                        </div>
                      </div>
                    )}
                    {(configDetailsSchedule.links.additionalLink2 ||
                      configDetailsSchedule.links.link2) && (
                      <div>
                        <span className="font-medium text-muted">
                          Additional Link 2:
                        </span>
                        <div className="mt-1">
                          <a
                            href={
                              configDetailsSchedule.links.additionalLink2 ||
                              configDetailsSchedule.links.link2
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all text-sm"
                          >
                            {configDetailsSchedule.links.additionalLink2 ||
                              configDetailsSchedule.links.link2}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Show message if no links are configured */}
                    {!configDetailsSchedule.links.websiteLink &&
                      !configDetailsSchedule.links.website &&
                      !configDetailsSchedule.links.additionalLink1 &&
                      !configDetailsSchedule.links.link1 &&
                      !configDetailsSchedule.links.additionalLink2 &&
                      !configDetailsSchedule.links.link2 && (
                        <div className="text-sm text-muted italic">
                          No links configured for this schedule.
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Content Configuration */}
              {(configDetailsSchedule.aiSubject ||
                configDetailsSchedule.title ||
                configDetailsSchedule.content) && (
                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-standard mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-pink-600" />
                    Content Configuration
                  </h4>
                  <div className="space-y-3">
                    {configDetailsSchedule.aiSubject && (
                      <div>
                        <span className="font-medium text-muted">
                          AI Subject:
                        </span>
                        <div className="mt-1 text-sm bg-white dark:bg-gray-800 border rounded px-3 py-2">
                          {configDetailsSchedule.aiSubject}
                        </div>
                      </div>
                    )}
                    {configDetailsSchedule.title && (
                      <div>
                        <span className="font-medium text-muted">
                          Title Template:
                        </span>
                        <div className="mt-1 text-sm bg-white dark:bg-gray-800 border rounded px-3 py-2">
                          {configDetailsSchedule.title}
                        </div>
                      </div>
                    )}
                    {configDetailsSchedule.content && (
                      <div>
                        <span className="font-medium text-muted">
                          Content Template:
                        </span>
                        <div className="mt-1 text-sm bg-white dark:bg-gray-800 border rounded px-3 py-2 max-h-32 overflow-y-auto">
                          {configDetailsSchedule.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Database Record Information */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-standard mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-600" />
                  Database Record Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted">User ID:</span>
                    <div className="mt-1 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all">
                      {configDetailsSchedule.userId}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted">
                      Execution Mode:
                    </span>
                    <div className="mt-1">
                      <Badge
                        variant={
                          configDetailsSchedule.executionMode === "auto"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {configDetailsSchedule.executionMode === "auto"
                          ? "⚡ Auto"
                          : "👁️ Review"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted">
                      Total Executions:
                    </span>
                    <div className="mt-1 text-standard">
                      {configDetailsSchedule.totalExecutions || 0}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted">
                      Success Rate:
                    </span>
                    <div className="mt-1 text-standard">
                      {configDetailsSchedule.successfulExecutions &&
                      configDetailsSchedule.totalExecutions
                        ? Math.round(
                            (configDetailsSchedule.successfulExecutions /
                              configDetailsSchedule.totalExecutions) *
                              100,
                          ) + "%"
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
