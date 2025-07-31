import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import axios from "axios";

const AccomplishmentLogContext = createContext();

export const TimerProvider = ({ children }) => {
  // Simplified state - no local storage for logs or hours
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isTimedIn, setIsTimedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [user, setUser] = useState(null);
  const [activityData, setActivityData] = useState(null); // Store the full activity response
  
  // Get today's date in YYYY-MM-DD format for localStorage key
  const getTodayKey = () => {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
    });
  };
  
  // Check if timeout was completed today
  const getTimeOutCompleted = useCallback(() => {
    const today = getTodayKey();
    const username = localStorage.getItem("username");
    if (!username) return false;
    
    const key = `timeOutCompleted_${username}_${today}`;
    return localStorage.getItem(key) === 'true';
  }, []);
  
  // Set timeout completion status for today
  const setTimeOutCompleted = useCallback((completed) => {
    const today = getTodayKey();
    const username = localStorage.getItem("username");
    if (!username) return;
    
    const key = `timeOutCompleted_${username}_${today}`;
    if (completed) {
      localStorage.setItem(key, 'true');
    } else {
      localStorage.removeItem(key);
    }
  }, []);

  // API configuration
  const API_BASE = "http://api.arkline.com/api/accomplishment-tracking/time-service";
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Get user info from activity API instead of JWT decode
  const getUserInfo = useCallback(() => {
  // Get username directly from localStorage (stored during login)
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  
  if (username && token) {
    return {
      username: username, // This will be "NOAHINTERN18"
      displayName: username // Use username for display
    };
  }
  
  return null;
}, []);

  // Call activity API and generate logs from the response
  const callActivityAPI = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/activity`, {
        headers: getAuthHeaders(),
      });
      
      console.log("Activity API response:", response.data);
      setActivityData(response.data);
      
      return response.data;
    } catch (error) {
      console.error("Error calling activity API:", error);
      return null;
    }
  }, [getAuthHeaders]);

  // Generate activity logs from API response  
  const generateLogsFromTimeLogs = useCallback((timeLogsData) => {
  if (!timeLogsData) return [];

  const logs = [];
  
  // Get username from localStorage instead of API
  const username = localStorage.getItem("username") || "User";
  
  console.log("Using username for logs:", username);
  
  if (timeLogsData.timeIn) {
    logs.push({
      id: `timeIn-${timeLogsData.timeIn}`,
      message: `${username} has timed in`,
      timestamp: timeLogsData.timeIn,
      type: 'timeIn'
    });
  }

  if (timeLogsData.lunchBreakStart) {
    logs.push({
      id: `lunchStart-${timeLogsData.lunchBreakStart}`,
      message: `${username} has started break`,
      timestamp: timeLogsData.lunchBreakStart,
      type: 'lunchBreakStart'
    });
  }

  if (timeLogsData.lunchBreakEnd) {
    logs.push({
      id: `lunchEnd-${timeLogsData.lunchBreakEnd}`,
      message: `${username} has ended break`,
      timestamp: timeLogsData.lunchBreakEnd,
      type: 'lunchBreakEnd'
    });
  }

  if (timeLogsData.timeOut) {
    logs.push({
      id: `timeOut-${timeLogsData.timeOut}`,
      message: `${username} has timed out`,
      timestamp: timeLogsData.timeOut,
      type: 'timeOut'
    });
  }

  // Sort logs by timestamp (most recent first)
  return logs.sort((a, b) => new Date(`1970-01-01T${b.timestamp}`) - new Date(`1970-01-01T${a.timestamp}`));
}, []); // Remove activityData dependency to avoid stale closure

  // Calculate hours worked from time logs
  const calculateHoursWorked = useCallback((timeLogsData) => {
    if (!timeLogsData?.timeIn) return 0;

    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
    });

    const timeInDateTime = new Date(`${today}T${timeLogsData.timeIn}`);
    const now = timeLogsData.timeOut 
      ? new Date(`${today}T${timeLogsData.timeOut}`)
      : new Date();

    let diffInSeconds = Math.floor((now - timeInDateTime) / 1000);

    // Subtract lunch break time if applicable
    if (timeLogsData.lunchBreakStart && timeLogsData.lunchBreakEnd) {
      const lunchStart = new Date(`${today}T${timeLogsData.lunchBreakStart}`);
      const lunchEnd = new Date(`${today}T${timeLogsData.lunchBreakEnd}`);
      const lunchDuration = Math.floor((lunchEnd - lunchStart) / 1000);
      diffInSeconds -= lunchDuration;
    } else if (timeLogsData.lunchBreakStart && !timeLogsData.lunchBreakEnd && isOnBreak) {
      // Currently on break - subtract break time so far
      const lunchStart = new Date(`${today}T${timeLogsData.lunchBreakStart}`);
      const breakDuration = Math.floor((now - lunchStart) / 1000);
      diffInSeconds -= breakDuration;
    }

    return Math.max(0, diffInSeconds);
  }, [isOnBreak]);

  // Utility function to format time in seconds to HH:MM:SS
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Function to reset states to defaults
  const resetToDefaults = useCallback(() => {
    setIsTimedIn(false);
    setIsOnBreak(false);
    setActivityData(null);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current activity from backend
  const fetchCurrentActivity = useCallback(async () => {
    try {
      const data = await callActivityAPI();
      if (data?.timeLogs) {
        setIsTimedIn(!!data.timeLogs.timeIn && !data.timeLogs.timeOut);
        setIsOnBreak(!!data.timeLogs.lunchBreakStart && !data.timeLogs.lunchBreakEnd);
      }
    } catch (error) {
      console.error("Error fetching current activity:", error);
    }
  }, [callActivityAPI]);

  // Initialize user and fetch activity on mount
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
  }, [getUserInfo, fetchCurrentActivity]);

  const contextValue = React.useMemo(
    () => ({
      currentTime,
      setCurrentTime,
      isTimedIn,
      setIsTimedIn,
      isOnBreak,
      setIsOnBreak,
      user,
      setUser,
      formatTime,
      resetToDefaults,
      activityData,
      callActivityAPI,
      generateLogsFromTimeLogs,
      calculateHoursWorked,
      fetchCurrentActivity,
      getUserInfo,
      getAuthHeaders,
      getTimeOutCompleted,
      setTimeOutCompleted,
    }),
    [
      currentTime, 
      isTimedIn, 
      isOnBreak, 
      user, 
      formatTime, 
      resetToDefaults, 
      activityData, 
      callActivityAPI, 
      generateLogsFromTimeLogs, 
      calculateHoursWorked, 
      fetchCurrentActivity, 
      getUserInfo, 
      getAuthHeaders,
      getTimeOutCompleted,
      setTimeOutCompleted
    ]
  );

  return (
    <AccomplishmentLogContext.Provider value={contextValue}>
      {children}
    </AccomplishmentLogContext.Provider>
  );
};

TimerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export const useTimer = () => useContext(AccomplishmentLogContext);
