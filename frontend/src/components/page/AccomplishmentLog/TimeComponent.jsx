import axios from "axios";
import React, { useState, useEffect } from "react";
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


  const {
    currentTime,
    isTimedIn,
    setIsTimedIn,
    isOnBreak,
    setIsOnBreak,
    formatTime,
    activityData,
    generateLogsFromTimeLogs,
    calculateHoursWorked,
    fetchCurrentActivity,
    getAuthHeaders,
    getUserInfo,
  } = useTimer();

  // Check if user has timed out but hasn't submitted accomplishment form
  const checkForPendingTimeOut = async () => {
    try {
      const user = await getUserInfo();
      if (!user) return;

      const logs = activityData?.timeLogs ? generateLogsFromTimeLogs(activityData.timeLogs) : [];
      console.log("Checking logs for pending timeout:", logs);

      // Look for timeout log entry
      const hasTimeOut = logs.some(log => 
        log.type === 'timeOut' && 
        log.message.includes(user.username || user.firstName || 'User') &&
        log.message.includes('timed out')
      );

      console.log("Has timeout entry:", hasTimeOut);
      console.log("Current isTimedIn state:", isTimedIn);

      // If user has timed out but modal isn't open, and they're not currently timed in
      // This indicates they refreshed during the accomplishment form
      if (hasTimeOut && !isTimedIn && !isTimeOutModalOpen) {
        console.log("Detected pending timeout - showing modal");
        setIsTimeOutModalOpen(true);
      }
    } catch (error) {
      console.error("Error checking for pending timeout:", error);
    }
  };

  // Check for pending timeout when component mounts or activity data changes
  useEffect(() => {
    if (activityData?.timeLogs) {
      checkForPendingTimeOut();
    }
  }, [activityData, isTimedIn, isTimeOutModalOpen]);

  const handleTimeInOut = async () => {
    if (isTimedIn) {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Recording timeout in database...");
        const response = await axios.post(`${API_BASE}/time-out`, {}, {
          headers: getAuthHeaders(),
        });
        console.log("Timeout recorded successfully:", response.data);
        
        setIsTimeOutModalOpen(true);
      } catch (error) {
        console.error("Error timing out:", error);
        setError(error.response?.data?.error || "Failed to time out");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      setError(null);
      try {
        await axios.post(`${API_BASE}/time-in`, {}, {
          headers: getAuthHeaders(),
        });

        setIsTimedIn(true);
        await fetchCurrentActivity();
      } catch (error) {
        console.error("Error timing in:", error);
        
        if (error.response?.status === 400 && error.response?.data?.error?.includes('already recorded')) {
          setError('You have already timed in today');
          await fetchCurrentActivity();
        } else {
          setError(error.response?.data?.error || "Failed to time in");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

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
      }

      setIsTimedIn(false);
      setIsOnBreak(false);
      setIsTimeOutModalOpen(false);
      await fetchCurrentActivity();
    } catch (error) {
      console.error("Error submitting accomplishment:", error);
      setError(error.response?.data?.error || "Failed to submit accomplishment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreak = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = isOnBreak ? "end-lunch-break" : "lunch-break";

      await axios.post(`${API_BASE}/${endpoint}`, {}, {
        headers: getAuthHeaders(),
      });

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
                {formatTime(activityData?.timeLogs ? calculateHoursWorked(activityData.timeLogs) : 0)}
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
                  const logs = generateLogsFromTimeLogs(activityData.timeLogs);
                  console.log("Generated logs:", logs);
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
