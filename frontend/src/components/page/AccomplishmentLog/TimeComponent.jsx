import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, Play, Pause, Coffee, StopCircle } from "lucide-react";
import AccomplishmentModal from "./AccomplishmentModal";
import { useTimer } from "@/context/AccomplishmentLogContext";

const TimeComponent = () => {
  const API_BASE = "/api/accomplishment-tracking/time-service";
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user info from JWT token
  const getUserInfo = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return {
          userId: decoded.userId,
          username:
            decoded.username || `${decoded.firstName} ${decoded.lastName}`,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
        };
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);

    if (userInfo) {
      fetchCurrentActivity();
      
      // Set up periodic sync every 30 seconds
      const interval = setInterval(() => {
        fetchCurrentActivity();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const {
    currentTime,
    isTimedIn,
    setIsTimedIn,
    isOnBreak,
    setIsOnBreak,
    hoursWorked,
    setHoursWorked,
    logs,
    setLogs,
  } = useTimer();

  const [isTimeOutModalOpen, setIsTimeOutModalOpen] = useState(false);

  // Add this function to fetch current activity from backend
  const fetchCurrentActivity = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/activity`, {
        headers: getAuthHeaders(),
      });

      const { timeLogs } = response.data;
      if (timeLogs) {
        setIsTimedIn(!!timeLogs.timeIn && !timeLogs.timeOut);
        setIsOnBreak(!!timeLogs.lunchBreakStart && !timeLogs.lunchBreakEnd);

        // Fixed time calculation
        if (timeLogs.timeIn && !timeLogs.timeOut) {
          // Get today's date in YYYY-MM-DD format (matching backend)
          const today = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Manila",
          });

          // Create proper datetime by combining date and time
          const timeInDateTime = new Date(`${today}T${timeLogs.timeIn}`);
          const now = new Date();

          let diffInSeconds = Math.floor((now - timeInDateTime) / 1000);

          // Subtract lunch break time if applicable
          if (timeLogs.lunchBreakStart && timeLogs.lunchBreakEnd) {
            const lunchStart = new Date(`${today}T${timeLogs.lunchBreakStart}`);
            const lunchEnd = new Date(`${today}T${timeLogs.lunchBreakEnd}`);
            const lunchDuration = Math.floor((lunchEnd - lunchStart) / 1000);
            diffInSeconds -= lunchDuration;
          } else if (
            timeLogs.lunchBreakStart &&
            !timeLogs.lunchBreakEnd &&
            isOnBreak
          ) {
            // Currently on break - subtract break time so far
            const lunchStart = new Date(`${today}T${timeLogs.lunchBreakStart}`);
            const breakDuration = Math.floor((now - lunchStart) / 1000);
            diffInSeconds -= breakDuration;
          }

          setHoursWorked(Math.max(0, diffInSeconds));
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching current activity:", error);
        setError("Failed to fetch current activity");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = (message) => {
    const username = user?.username || "User";
    const newLog = {
      id: Date.now().toString(),
      message: message.replace("**User**", `${username}`),
      timestamp: currentTime.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleTimeInOut = async () => {
    if (isTimedIn) {
      setIsTimeOutModalOpen(true);
    } else {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE}/time-in`, {}, {
          headers: getAuthHeaders(),
        });

        setIsTimedIn(true);
        addLog("**User** has timed in");
        
        // Refresh state from backend
        await fetchCurrentActivity();
      } catch (error) {
        console.error("Error timing in:", error);
        
        // Handle specific backend errors
        if (error.response?.status === 400 && error.response?.data?.error?.includes('already recorded')) {
          setError('You have already timed in today');
          // Sync state with backend
          await fetchCurrentActivity();
        } else {
          setError(error.response?.data?.error || "Failed to time in");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAccomplishmentSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE}/time-out`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      setIsTimedIn(false);
      setIsOnBreak(false);
      addLog("**User** has timed out and submitted daily accomplishments");
      setHoursWorked(0);
      setIsTimeOutModalOpen(false);
    } catch (error) {
      console.error("Error timing out:", error);
      setError(error.response?.data?.error || "Failed to time out");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreak = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = isOnBreak ? "end-lunch-break" : "lunch-break";

      const response = await axios.post(`${API_BASE}/${endpoint}`, {}, {
        headers: getAuthHeaders(),
      });

      if (isOnBreak) {
        setIsOnBreak(false);
        addLog("**User** has ended break");
      } else {
        setIsOnBreak(true);
        addLog("**User** has started break");
      }
      
      // Refresh state from backend
      await fetchCurrentActivity();
    } catch (error) {
      console.error("Error updating break status:", error);
      setError(error.response?.data?.error || "Failed to update break status");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
                {formatTime(hoursWorked)}
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
              {isLoading ? (
                "Processing..."
              ) : isOnBreak ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  End Lunch Break
                </>
              ) : (
                <>
                  <Coffee className="mr-2 h-5 w-5" />
                  Start Lunch Break
                </>
              )}
            </Button>
          </div>
          {isTimedIn && (
            <AccomplishmentModal
              isOpen={isTimeOutModalOpen}
              onClose={() => setIsTimeOutModalOpen(false)}
              onSubmit={handleAccomplishmentSubmit}
            />
          )}
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No activity logged yet
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-start p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm">{log.message}</span>
                    <span className="text-xs text-muted-foreground font-mono ml-4 flex-shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeComponent;
