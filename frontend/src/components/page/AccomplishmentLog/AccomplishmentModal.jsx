import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

import axios from "axios";

export default function AccomplishmentModal({
  isOpen,
  onClose,
  onSubmit,
  mode = "edit",
  accomplishment: propAccomplishment,
  onEdit,
}) {
  // Transform the nested data structure to flat structure for the modal
  const getTransformedData = (data) => {
    if (!data)
      return {
        groupName: "",
        activitiesType: "",
        module: "",
        dateAssigned: undefined,
        activities: "",
        targetEndDate: undefined,
        actualEndDate: undefined,
        status: "",
        percentageOfActivities: 0,
        projectHeads: [],
      };

    console.log("Raw data received:", data); // Debug log

    const accomplishmentData = data.accomplishment || data.details || data;

    const transformed = {
      groupName: accomplishmentData?.groupName || "",
      activitiesType:
        accomplishmentData?.activityType || accomplishmentData?.activitiesType || "", // Handle both field names
      module: accomplishmentData?.module || "",
      dateAssigned: accomplishmentData?.dateAssigned
        ? new Date(accomplishmentData.dateAssigned)
        : undefined,
      activities: Array.isArray(accomplishmentData?.activities)
        ? accomplishmentData.activities.join("\n")
        : accomplishmentData?.activities || "",
      targetEndDate: accomplishmentData?.targetEndDate
        ? new Date(accomplishmentData.targetEndDate)
        : undefined,
      actualEndDate: accomplishmentData?.actualEndDate
        ? new Date(accomplishmentData.actualEndDate)
        : undefined,
      status: accomplishmentData?.status || "",
      percentageOfActivities:
        accomplishmentData?.percentageOfActivity ||
        accomplishmentData?.percentageOfActivities ||
        0, // Handle both field names
      projectHeads: accomplishmentData?.projectHeads || [],
    };

    console.log("Transformed data:", transformed); // Debug log
    return transformed;
  };

  const [accomplishment, setAccomplishment] = useState({
    groupName: "",
    activitiesType: "",
    module: "",
    dateAssigned: undefined,
    activities: "",
    targetEndDate: undefined,
    actualEndDate: undefined,
    status: "",
    percentageOfActivities: 0,
    projectHeads: [],
  });
  const [editMode, setEditMode] = useState(mode);
  const [currentProjectHead, setCurrentProjectHead] = useState("");

  // Update accomplishment state when propAccomplishment changes or modal opens
  useEffect(() => {
    if (propAccomplishment && isOpen) {
      const transformedData = getTransformedData(propAccomplishment);
      console.log("Setting accomplishment state to:", transformedData); // Debug log
      setAccomplishment(transformedData);
      setEditMode(mode); // Reset edit mode when modal opens
      console.log("Modal opened with mode:", mode); // Debug log
    } else if (isOpen && !propAccomplishment) {
      // When opening for timeout (new accomplishment), should be in edit mode
      console.log("Modal opened for new accomplishment with mode:", mode); // Debug log
      setEditMode(mode);
    }
  }, [propAccomplishment, isOpen, mode]);

  console.log("Current accomplishment state:", accomplishment); // Debug log
  console.log("Current editMode:", editMode); // Debug log

  // Helper to check if a field is editable
  const isEditable = (field) => {
    if (editMode === "edit") return true;
    if (editMode === "partial-edit") {
      return ["actualEndDate", "status", "percentageOfActivities"].includes(
        field
      );
    }
    return false;
  };

  const renderField = (field, value, input) => {
    // Always return the input component, but it will be disabled based on isEditable
    return input;
  };

  const addProjectHead = () => {
    if (
      currentProjectHead.trim() &&
      !accomplishment.projectHeads.includes(currentProjectHead.trim())
    ) {
      setAccomplishment((prev) => ({
        ...prev,
        projectHeads: [...prev.projectHeads, currentProjectHead.trim()],
      }));
      setCurrentProjectHead("");
    }
  };

  const removeProjectHead = (headToRemove) => {
    setAccomplishment((prev) => ({
      ...prev,
      projectHeads: prev.projectHeads.filter((head) => head !== headToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProjectHead();
    }
  };

  const handleSubmit = async () => {
    // Transform the flat state back to the backend's expected structure
    const payload = {
      groupName: accomplishment.groupName,
      activityType: accomplishment.activitiesType, // map to backend
      module: accomplishment.module,
      dateAssigned: accomplishment.dateAssigned,
      activities: accomplishment.activities
        ? accomplishment.activities
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      targetEndDate: accomplishment.targetEndDate,
      actualEndDate: accomplishment.actualEndDate,
      status: accomplishment.status,
      percentageOfActivity: accomplishment.percentageOfActivities, // map to backend
      projectHeads: accomplishment.projectHeads,
    };

    // Pass the payload to the parent component to handle the API calls
    // Parent will first call time-out, then submit the form
    onSubmit && onSubmit(payload);
    handleClose();
  };

  const handleClose = () => {
    onClose && onClose();
  };

  const handleEdit = () => {
    setEditMode("partial-edit");
  };

  const handleSave = async () => {
  try {
    const payload = {
      updatedData: {
        groupName: accomplishment.groupName,
        activityType: accomplishment.activitiesType,
        module: accomplishment.module,
        dateAssigned: accomplishment.dateAssigned,
        activities: accomplishment.activities
          ? accomplishment.activities
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        targetEndDate: accomplishment.targetEndDate,
        actualEndDate: accomplishment.actualEndDate,
        status: accomplishment.status,
        percentageOfActivity: accomplishment.percentageOfActivities,
        projectHeads: accomplishment.projectHeads,
      }
    };

    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : "";
    const date = propAccomplishment?.date || new Date().toISOString().split('T')[0];
    
    console.log("Updating accomplishment for userId:", userId, "date:", date);

    await axios.post(
      `/api/accomplishment-tracking/accomplishment-service/form?userId=${userId}&date=${date}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Accomplishment updated successfully");
    setEditMode("view");
    
    // ✅ Call the refresh function to update parent component's data
    if (onEdit) {
      console.log("Calling onEdit to refresh data...");
      onEdit(); // This will trigger fetchLogs() in the parent component
    }
    
    // Optional: Show success message
    console.log("Data refresh triggered");
    
  } catch (error) {
    console.error("Error updating accomplishment:", error);
    alert(
      error.response?.data?.error ||
        "Failed to update accomplishment. Please try again."
    );
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Accomplishments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">
                Group Name<span className="text-red-500">*</span>
              </Label>
              {renderField(
                "groupName",
                accomplishment.groupName,
                <Input
                  id="groupName"
                  value={accomplishment.groupName}
                  onChange={(e) =>
                    setAccomplishment((prev) => ({
                      ...prev,
                      groupName: e.target.value,
                    }))
                  }
                  placeholder="Enter group name"
                  disabled={!isEditable("groupName")}
                  className={!isEditable("groupName") ? "bg-gray-50" : ""}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="activitiesType">
                Type of Activities<span className="text-red-500">*</span>
              </Label>
              {renderField(
                "activitiesType",
                accomplishment.activitiesType,
                <Select
                  value={accomplishment.activitiesType}
                  onValueChange={(value) =>
                    setAccomplishment((prev) => ({
                      ...prev,
                      activitiesType: value,
                    }))
                  }
                  disabled={!isEditable("activitiesType")}
                >
                  <SelectTrigger
                    className={
                      !isEditable("activitiesType") ? "bg-gray-50" : ""
                    }
                  >
                    <SelectValue placeholder="Select activities type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Code Review">Code Review</SelectItem>
                    <SelectItem value="Feature Implementation">
                      Feature Implementation
                    </SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Bug Fixes">Bug Fixes</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Other Activities">
                      Other Activities
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="module">Module</Label>
              {renderField(
                "module",
                accomplishment.module,
                <Input
                  id="module"
                  value={accomplishment.module}
                  onChange={(e) =>
                    setAccomplishment((prev) => ({
                      ...prev,
                      module: e.target.value,
                    }))
                  }
                  placeholder="Enter module name"
                  disabled={!isEditable("module")}
                  className={!isEditable("module") ? "bg-gray-50" : ""}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Date Assigned</Label>
              {renderField(
                "dateAssigned",
                accomplishment.dateAssigned
                  ? format(accomplishment.dateAssigned, "PPP")
                  : "Not assigned",
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-transparent ${!isEditable("dateAssigned") ? "bg-gray-50" : ""}`}
                      disabled={!isEditable("dateAssigned")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {accomplishment.dateAssigned
                        ? format(accomplishment.dateAssigned, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={accomplishment.dateAssigned}
                      onSelect={(date) =>
                        setAccomplishment((prev) => ({
                          ...prev,
                          dateAssigned: date,
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activities">
              Activities<span className="text-red-500">*</span>
            </Label>
            {renderField(
              "activities",
              accomplishment.activities,
              <Textarea
                id="activities"
                value={accomplishment.activities}
                onChange={(e) =>
                  setAccomplishment((prev) => ({
                    ...prev,
                    activities: e.target.value,
                  }))
                }
                placeholder="Describe your activities for the day...
(Enter one activity per line)"
                className={`min-h-[100px] ${!isEditable("activities") ? "bg-gray-50" : ""}`}
                disabled={!isEditable("activities")}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Target End Date<span className="text-red-500">*</span>
              </Label>
              {renderField(
                "targetEndDate",
                accomplishment.targetEndDate
                  ? format(accomplishment.targetEndDate, "PPP")
                  : "Not set",
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-transparent ${!isEditable("targetEndDate") ? "bg-gray-50" : ""}`}
                      disabled={!isEditable("targetEndDate")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {accomplishment.targetEndDate
                        ? format(accomplishment.targetEndDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={accomplishment.targetEndDate}
                      onSelect={(date) =>
                        setAccomplishment((prev) => ({
                          ...prev,
                          targetEndDate: date,
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Actual End Date<span className="text-red-500">*</span>
              </Label>
              {renderField(
                "actualEndDate",
                accomplishment.actualEndDate
                  ? format(accomplishment.actualEndDate, "PPP")
                  : "Not completed",
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-transparent ${!isEditable("actualEndDate") ? "bg-gray-50" : ""}`}
                      disabled={!isEditable("actualEndDate")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {accomplishment.actualEndDate
                        ? format(accomplishment.actualEndDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={accomplishment.actualEndDate}
                      onSelect={(date) =>
                        setAccomplishment((prev) => ({
                          ...prev,
                          actualEndDate: date,
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">
                Current Status<span className="text-red-500">*</span>
              </Label>
              {renderField(
                "status",
                accomplishment.status,
                <Select
                  value={accomplishment.status}
                  onValueChange={(value) =>
                    setAccomplishment((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                  disabled={!isEditable("status")}
                >
                  <SelectTrigger
                    className={!isEditable("status") ? "bg-gray-50" : ""}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Not Yet Started">
                      Not Yet Started
                    </SelectItem>
                    <SelectItem value="Reassigned">Reassigned</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentage of Activities (%)</Label>
              {renderField(
                "percentageOfActivities",
                `${accomplishment.percentageOfActivities}%`,
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={accomplishment.percentageOfActivities}
                  onChange={(e) =>
                    setAccomplishment((prev) => ({
                      ...prev,
                      percentageOfActivities:
                        Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0-100"
                  disabled={!isEditable("percentageOfActivities")}
                  className={
                    !isEditable("percentageOfActivities") ? "bg-gray-50" : ""
                  }
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectHeads">
              Project Heads<span className="text-red-500">*</span>
            </Label>
            {/* Always show input format, even in view mode */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="projectHeads"
                  value={currentProjectHead}
                  onChange={(e) => setCurrentProjectHead(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter project head name and press Enter"
                  className={`flex-1 ${!isEditable("projectHeads") ? "bg-gray-50" : ""}`}
                  disabled={!isEditable("projectHeads")}
                />
                <Button
                  type="button"
                  onClick={addProjectHead}
                  variant="outline"
                  size="sm"
                  disabled={!isEditable("projectHeads")}
                >
                  Add
                </Button>
              </div>
              {Array.isArray(accomplishment.projectHeads) &&
                accomplishment.projectHeads.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {accomplishment.projectHeads.map((head, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {head}
                        {isEditable("projectHeads") && (
                          <button
                            type="button"
                            onClick={() => removeProjectHead(head)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Buttons based on mode */}
          <div className="flex justify-end space-x-2 pt-4">
            {editMode === "edit" && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Submit & Time Out</Button>
              </>
            )}
            {editMode === "view" && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Exit
                </Button>
                <Button onClick={handleEdit}>Edit</Button>
              </>
            )}
            {editMode === "partial-edit" && (
              <>
                <Button variant="outline" onClick={() => setEditMode("view")}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
