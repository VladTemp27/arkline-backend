import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, Play, Pause, Coffee, StopCircle } from "lucide-react";
import AccomplishmentModal from "./AccomplishmentModal";
import { useTimer } from "@/context/AccomplishmentLogContext";

const TimeComponent = () => {
  const API_BASE = "/api/accomplishment-tracking/time-service";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTimeOutModalOpen, setIsTimeOutModalOpen] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Add this

  const {
    currentTime,
    isTimedIn,
    setIsTimedIn,
    isOnBreak,
    setIsOnBreak,
    formatTime,
    activityData,
    setActivityData,
    generateLogsFromTimeLogs,
    calculateHoursWorked,
    fetchCurrentActivity,
    getAuthHeaders,
    getTimeOutCompleted,
    setTimeOutCompleted,
  } = useTimer();

  // Check if user has timed out but hasn't submitted accomplishment form
  const checkForPendingTimeOut = useCallback(async () => {
    try {
      console.log("[checkForPendingTimeOut] called");
      // Check if timeout was already completed today (persistent check)
      const completed = getTimeOutCompleted();
      console.log("[checkForPendingTimeOut] getTimeOutCompleted:", completed);
      if (completed) {
        console.log("Timeout already completed today, skipping modal");
        return;
      }

      // Wait for initial load to complete before checking
      console.log(
        "[checkForPendingTimeOut] initialLoadComplete:",
        initialLoadComplete
      );
      if (!initialLoadComplete) {
        console.log("Initial load not complete, skipping timeout check");
        return;
      }

      // Don't check if modal is already open
      console.log(
        "[checkForPendingTimeOut] isTimeOutModalOpen:",
        isTimeOutModalOpen
      );
      if (isTimeOutModalOpen) {
        console.log("Modal already open, skipping");
        return;
      }

      // Get username directly from localStorage
      const username = localStorage.getItem("username");
      if (!username) {
        console.log("No username found in localStorage, skipping");
        return;
      }

      // Get user ID for backend verification
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in localStorage");
        return;
      }

      // Extract userId from JWT token
      let userId;
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        userId = decoded.userId;
      } catch (error) {
        console.log("Error extracting userId from token");
        return;
      }

      // 1. Check for timeout using
      console.log(
        "[checkForPendingTimeOut] Fetching activity data for timeout check..."
      );
      const activityResponse = await axios.get(`${API_BASE}/activity`, {
        headers: getAuthHeaders(),
      });

      console.log("Activity API response received");
      const currentActivityData = activityResponse.data;
      const timeLogData = currentActivityData?.timeLogs;
      console.log("[checkForPendingTimeOut] timeLogData available:", !!timeLogData);
      const hasTimeOut = !!timeLogData?.timeOut;
      console.log("Backend shows - TimeOut:", hasTimeOut);

      // 2. Check if user has ANY logs for today
      console.log("[checkForPendingTimeOut] Fetching all timelogs to check for today's logs...");
      
      let hasLogsForToday = false;
      
      try {
        const allTimeLogsResponse = await axios.get(`${API_BASE}/timelogs`, {
          headers: getAuthHeaders(),
        });

        console.log("All TimeLogs API response received");

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Manila",
        });
        console.log("[checkForPendingTimeOut] today's date:", today);

        // Check if current user has any logs for today's date
        const allTimeLogs = allTimeLogsResponse.data?.allTimeLogs || [];
        const userLogsForToday = allTimeLogs.filter(
          (log) => log.userId === userId && log.date === today
        );
        
        console.log("[checkForPendingTimeOut] found", userLogsForToday.length, "logs for today");
        
        hasLogsForToday = userLogsForToday.length > 0;
        console.log("User has logs for today:", hasLogsForToday);
        
      } catch (timeLogsError) {
        console.error("Error fetching all timelogs:", timeLogsError);
        
        // If error fetching timelogs, assume no logs for today (safer to show modal)
        console.log("Error fetching timelogs - treating as no logs for today");
        hasLogsForToday = false;
      }

      // Show modal if:
      // - User has timed out today (hasTimeOut from /activity)
      // - User has NO logs for today's date (!hasLogsForToday from /timelogs)
      // - Modal is not already open (!isTimeOutModalOpen)
      if (hasTimeOut && !hasLogsForToday && !isTimeOutModalOpen) {
        console.log("Detected timeout with no logs for today - showing modal");

        // Update local state to match backend reality
        setIsTimedIn(false);
        setIsOnBreak(false);

        setIsTimeOutModalOpen(true);
      } else if (hasTimeOut && hasLogsForToday) {
        console.log("Found timeout with logs for today - marking as completed");
        setTimeOutCompleted(true);
        setIsTimedIn(false); // Ensure state matches backend
      } else {
        console.log("[checkForPendingTimeOut] No modal condition met.");
        console.log("Conditions: hasTimeOut:", hasTimeOut, "hasLogsForToday:", hasLogsForToday);
      }
    } catch (error) {
      console.error("Error checking for pending timeout:", error);
    }
  }, [initialLoadComplete, isTimeOutModalOpen]);

  // Separate effect for initial load
  useEffect(() => {
    if (activityData !== null && !initialLoadComplete) {
      console.log("Initial load complete, activityData:", activityData);
      setInitialLoadComplete(true);
    }
  }, [activityData, initialLoadComplete]);

  // Separate effect for timeout checking - only runs when truly needed
  useEffect(() => {
    if (initialLoadComplete && !isTimeOutModalOpen) {
      console.log("Running timeout check...");
      checkForPendingTimeOut();
    }
  }, [initialLoadComplete, isTimeOutModalOpen, checkForPendingTimeOut]);

  const handleTimeInOut = async () => {
    if (isTimedIn) {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Recording timeout in database...");
        const response = await axios.post(
          `${API_BASE}/time-out`,
          {},
          {
            headers: getAuthHeaders(),
          }
        );
        console.log("Timeout recorded successfully:", response.data);

        setIsTimeOutModalOpen(true);
      } catch (error) {
        console.error("Error timing out:", error);
        setError(error.response?.data?.error || "Failed to time out");
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeOutCompleted(false); // Reset flag when timing in (for new day)
      setIsLoading(true);
      setError(null);
      try {
        await axios.post(
          `${API_BASE}/time-in`,
          {},
          {
            headers: getAuthHeaders(),
          }
        );

        setIsTimedIn(true);
        await fetchCurrentActivity();
      } catch (error) {
        console.error("Error timing in:", error);

        if (
          error.response?.status === 400 &&
          error.response?.data?.error?.includes("already recorded")
        ) {
          setError("You have already timed in today");
          await fetchCurrentActivity();
        } else {
          setError(error.response?.data?.error || "Failed to time in");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Update handleAccomplishmentSubmit:
  const handleAccomplishmentSubmit = async (accomplishmentData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (accomplishmentData) {
        console.log("Submitting accomplishment form...");
        const token = localStorage.getItem("token");
        await axios.post(
          "/api/accomplishment-tracking/accomplishment-service/submit",
          accomplishmentData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Accomplishment form submitted successfully");

        // ✅ FIX: Set completion flag immediately after successful submission
        console.log(
          "Setting timeout completed flag immediately after submission"
        );
        setTimeOutCompleted(true);

        // ✅ FIX: Update activityData to include accomplishment data locally
        // This ensures hasAccomplishmentForm becomes true immediately
        console.log("Updating local activity data with accomplishment info");
        setActivityData((prev) => ({
          ...prev,
          accomplishmentLog: accomplishmentData, // Add accomplishment data locally
        }));
      }

      // Update UI state
      setIsTimedIn(false);
      setIsOnBreak(false);
      setIsTimeOutModalOpen(false);

      // Refresh data from backend
      await fetchCurrentActivity();

      // Return success to indicate completion
      return { success: true };
    } catch (error) {
      console.error("Error submitting accomplishment:", error);
      setError(
        error.response?.data?.error || "Failed to submit accomplishment"
      );
      // Rethrow error so modal can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreak = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = isOnBreak ? "end-lunch-break" : "lunch-break";

      await axios.post(
        `${API_BASE}/${endpoint}`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      if (isOnBreak) {
        setIsOnBreak(false);
      } else {
        setIsOnBreak(true);
      }

      await fetchCurrentActivity();
    } catch (error) {
      console.error("Error updating break status:", error);
      setError(error.response?.data?.error || "Failed to update break status");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrentTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Display Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Current Time</span>
            </div>
            <div className="text-3xl font-mono font-bold">
              {formatCurrentTime(currentTime)}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Hours Worked Today
              </div>
              <div className="text-4xl font-mono font-bold text-primary">
                {formatTime(
                  activityData?.timeLogs
                    ? calculateHoursWorked(activityData.timeLogs)
                    : 0
                )}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                {isTimedIn && (
                  <>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isOnBreak ? "bg-yellow-500" : "bg-green-500"
                      }`}
                    />
                    <span>{isOnBreak ? "On Break" : "Working"}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <Card>
        <CardContent className="">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isTimedIn ? (
              <Button
                onClick={handleTimeInOut}
                size="lg"
                variant="destructive"
                className="h-16 text-lg font-semibold"
                disabled={isLoading}
              >
                <StopCircle className="mr-2 h-5 w-5" />
                {isLoading ? "Processing..." : "Time Out"}
              </Button>
            ) : (
              <Button
                onClick={handleTimeInOut}
                size="lg"
                variant="default"
                className="h-16 text-lg font-semibold bg-green-500 hover:bg-green-700"
                disabled={isLoading}
              >
                <Play className="mr-2 h-5 w-5" />
                {isLoading ? "Processing..." : "Time In"}
              </Button>
            )}

            <Button
              onClick={handleBreak}
              size="lg"
              variant={isOnBreak ? "secondary" : "outline"}
              disabled={!isTimedIn || isLoading}
              className="h-16 text-lg font-semibold"
            >
              {(() => {
                if (isLoading) return "Processing...";
                if (isOnBreak) {
                  return (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      End Lunch Break
                    </>
                  );
                }
                return (
                  <>
                    <Coffee className="mr-2 h-5 w-5" />
                    Start Lunch Break
                  </>
                );
              })()}
            </Button>
          </div>

          <AccomplishmentModal
            isOpen={isTimeOutModalOpen}
            onClose={() => setIsTimeOutModalOpen(false)}
            onSubmit={handleAccomplishmentSubmit}
            onEdit={fetchCurrentActivity}
            mode="edit"
          />
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full">
            {!activityData?.timeLogs ? (
              <div className="text-center text-muted-foreground py-8">
                No activity logged yet
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const logs =
                    generateLogsFromTimeLogs(activityData.timeLogs) || [];
                  return logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex justify-between items-start p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-sm">{log.message}</span>
                      <span className="text-xs text-muted-foreground font-mono ml-4 flex-shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeComponent;
