"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Clock, Calendar, ChevronRight } from "lucide-react";
import AccomplishmentModal from "./AccomplishmentModal";

function getStatusColor(status) {
  switch (status) {
    case "Overtime":
      return "bg-orange-500 text-white hover:bg-orange-600";
    case "Undertime":
      return "bg-red-500 text-white hover:bg-red-600";
    case "On Time":
      return "bg-green-500 text-white hover:bg-green-600";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}

export default function AccomplishmentLogPage() {
  const [logs, setLogs] = useState([]);
  const [selectedAccomplishment, setSelectedAccomplishment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract fetch logic so you can call it after save
  const fetchLogs = async () => {
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : "";
    try {
      const res = await axios.get(
        `/api/accomplishment-tracking/time-service/timelogs/${userId}?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const timeLogsData = res.data.timeLogs?.dates || {};
      const processedLogs = Object.entries(timeLogsData).map(([date, dayData]) => ({
        date,
        timeIn: dayData.timeLogs?.timeIn || "N/A",
        timeOut: dayData.timeLogs?.timeOut || "N/A",
        lunchBreakStart: dayData.timeLogs?.lunchBreakStart,
        lunchBreakEnd: dayData.timeLogs?.lunchBreakEnd,
        totalHours: calculateTotalHours(dayData.timeLogs),
        status: calculateStatus(dayData.timeLogs),
        accomplishment: dayData.accomplishmentLog,
        details: dayData.accomplishmentLog
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(processedLogs);

      // If a modal is open, update its data too
      if (isModalOpen && selectedAccomplishment) {
        const refreshed = processedLogs.find(l => l.date === selectedAccomplishment.date);
        if (refreshed) setSelectedAccomplishment(refreshed);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  // Pass this to the modal
  const handleDataRefresh = () => {
    fetchLogs();
  };

  // Helper function to calculate total hours
  const calculateTotalHours = (timeLogs) => {
    if (!timeLogs?.timeIn || !timeLogs?.timeOut) return "N/A";
    
    const timeIn = new Date(`2000-01-01T${timeLogs.timeIn}`);
    const timeOut = new Date(`2000-01-01T${timeLogs.timeOut}`);
    let diffMs = timeOut - timeIn;
    
    // Subtract lunch break time if available
    if (timeLogs.lunchBreakStart && timeLogs.lunchBreakEnd) {
      const lunchStart = new Date(`2000-01-01T${timeLogs.lunchBreakStart}`);
      const lunchEnd = new Date(`2000-01-01T${timeLogs.lunchBreakEnd}`);
      diffMs -= (lunchEnd - lunchStart);
    }
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hrs ${minutes} minutes`;
  };

  // Helper function to calculate status
  const calculateStatus = (timeLogs) => {
    if (!timeLogs?.timeIn || !timeLogs?.timeOut) return "Incomplete";
    
    const timeIn = new Date(`2000-01-01T${timeLogs.timeIn}`);
    const timeOut = new Date(`2000-01-01T${timeLogs.timeOut}`);
    let diffMs = timeOut - timeIn;
    
    // Subtract lunch break time
    if (timeLogs.lunchBreakStart && timeLogs.lunchBreakEnd) {
      const lunchStart = new Date(`2000-01-01T${timeLogs.lunchBreakStart}`);
      const lunchEnd = new Date(`2000-01-01T${timeLogs.lunchBreakEnd}`);
      diffMs -= (lunchEnd - lunchStart);
    }
    
    const hoursWorked = diffMs / (1000 * 60 * 60);
    
    // Fixed logic: check overtime first, then on-time
    if (hoursWorked > 8) return "Overtime";
    if (hoursWorked >= 8) return "On Time";
    return "Undertime";
  };

  // Less restrictive filter - show all logs with time data
  const doneAccomplishments = logs.filter(
    (log) => log.timeOut !== "N/A" && log.timeIn !== "N/A"
  );

  // Add debug logging to see what data you're getting
  console.log("Processed logs:", logs);
  console.log("Filtered accomplishments:", doneAccomplishments);

  const handleCardClick = (log) => {
    setSelectedAccomplishment(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAccomplishment(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Color Legend Only */}
      <div className="flex items-center gap-4 text-sm mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">On Time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-gray-700">Overtime</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-gray-700">Undertime</span>
        </div>
      </div>

      {/* Done Accomplishments List */}
      <div className="space-y-4 mb-6">
        {doneAccomplishments.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No accomplishments found
            </h3>
            <p className="text-gray-600">No completed tasks to display.</p>
          </div>
        )}
        {doneAccomplishments.map((log, idx) => (
          <Card
            key={idx}
            className="bg-white shadow-sm border-0 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCardClick(log)}
          >
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div className="grid grid-cols-4 w-full gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {log.details?.actualEndDate || log.date}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">In:</span> {log.timeIn}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Out:</span> {log.timeOut}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {log.totalHours}
                  <Badge
                    className={`${getStatusColor(log.status)} px-3 py-1 text-xs font-medium rounded-full ml-4`}
                  >
                    {log.status}
                  </Badge>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accomplishment Modal */}
      {selectedAccomplishment && (
        <AccomplishmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          mode="view"
          accomplishment={selectedAccomplishment}
          onEdit={handleDataRefresh}
        />
      )}
    </div>
  );
}
