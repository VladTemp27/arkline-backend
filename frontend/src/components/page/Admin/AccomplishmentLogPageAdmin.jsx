"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { Badge } from "@/components/ui/badge.jsx"
import { Button } from "@/components/ui/button.jsx"
import { Card, CardContent } from "@/components/ui/card.jsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx"
import { ScrollArea } from "@/components/ui/scroll-area.jsx"
import { Separator } from "@/components/ui/separator.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Clock, FileText, Users, Calendar, Search, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.jsx"
import { Target, TrendingUp, ChevronRight } from "lucide-react"

export default function AccomplishmentDashboard() {
  const [expandedLogs, setExpandedLogs] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [todaysLogs, setTodaysLogs] = useState([])
  const [selectedUserLogs, setSelectedUserLogs] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // API Configuration
  const API_BASE_URL = 'http://api.arkline.com'
  const JWT_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImxlcyIsInVzZXJJZCI6IjIzIiwicm9sZSI6ImFkbWluIiwiZmlyc3ROYW1lIjoiTGVzdGF0IiwibGFzdE5hbWUiOiJBZ3VzdGluIn0.8ixg4h7eXQ9cqmqkowFHLQsbwPY0dGjjQdTrC54MSdQ'
  
  const apiHeaders = {
    'Authorization': JWT_TOKEN,
    'Content-Type': 'application/json'
  }

  // Helper function to calculate work status
  const calculateWorkStatus = (timeIn, timeOut, lunchBreakStart, lunchBreakEnd) => {
    if (!timeIn || !timeOut) return 'Incomplete'
    
    // Parse time strings properly
    const parseTime = (timeStr) => {
      if (!timeStr) return null
      const [hours, minutes, seconds] = timeStr.split(':').map(Number)
      const date = new Date()
      date.setHours(hours, minutes, seconds || 0, 0)
      return date
    }
    
    const timeInDate = parseTime(timeIn)
    const timeOutDate = parseTime(timeOut)
    
    if (!timeInDate || !timeOutDate) return 'Incomplete'
    
    // Calculate total work minutes
    let totalMinutes = (timeOutDate - timeInDate) / (1000 * 60)
    
    // Handle case where timeOut is next day (e.g., night shift)
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60 // Add 24 hours in minutes
    }
    
    // Subtract lunch break if both start and end are provided
    if (lunchBreakStart && lunchBreakEnd) {
      const lunchStart = parseTime(lunchBreakStart)
      const lunchEnd = parseTime(lunchBreakEnd)
      
      if (lunchStart && lunchEnd) {
        let lunchMinutes = (lunchEnd - lunchStart) / (1000 * 60)
        if (lunchMinutes < 0) lunchMinutes += 24 * 60 // Handle overnight lunch (unlikely but safe)
        totalMinutes -= lunchMinutes
      }
    }
    
    const totalHours = totalMinutes / 60
    
    // Standard work day is 8.5 hours
    if (totalHours > 8.5) return 'Overtime'      // More than 8.5 hours
    if (totalHours < 8.5) return 'Undertime'     // Less than 8.5 hours
    return 'On Time'                              // Exactly 8.5 hours
  }

  // Helper function to format total hours
  const formatTotalHours = (timeIn, timeOut, lunchBreakStart, lunchBreakEnd) => {
    if (!timeIn || !timeOut) return 'N/A'
    
    // Parse time strings properly
    const parseTime = (timeStr) => {
      if (!timeStr) return null
      const [hours, minutes, seconds] = timeStr.split(':').map(Number)
      const date = new Date()
      date.setHours(hours, minutes, seconds || 0, 0)
      return date
    }
    
    const timeInDate = parseTime(timeIn)
    const timeOutDate = parseTime(timeOut)
    
    if (!timeInDate || !timeOutDate) return 'N/A'
    
    let totalMinutes = (timeOutDate - timeInDate) / (1000 * 60)
    
    // Handle case where timeOut is next day (e.g., night shift)
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60 // Add 24 hours in minutes
    }
    
    // Subtract lunch break if both start and end are provided
    if (lunchBreakStart && lunchBreakEnd) {
      const lunchStart = parseTime(lunchBreakStart)
      const lunchEnd = parseTime(lunchBreakEnd)
      
      if (lunchStart && lunchEnd) {
        let lunchMinutes = (lunchEnd - lunchStart) / (1000 * 60)
        if (lunchMinutes < 0) lunchMinutes += 24 * 60 // Handle overnight lunch (unlikely but safe)
        totalMinutes -= lunchMinutes
      }
    }
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    return `${hours} hr/s ${minutes} mn/s`
  }

  // Fetch today's logs
  const fetchTodaysLogs = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/accomplishment-tracking/time-service/timelogs`, {
        headers: apiHeaders
      })

      console.log(response.status, response.statusText)
      console.log('API response:', response.data)
      
      // Handle the correct API response structure
      const timeLogs = response.data.allTimeLogs || []
      console.log('Successfully fetched time logs from API:', timeLogs.length, 'records')
      
      // Transform data to match component structure
      const transformedData = timeLogs.map(log => ({
        id: log.userId,
        name: `${log.firstName || ''} ${log.lastName || ''}`.trim() || `User ${log.userId}`,
        latestDate: new Date(log.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        timeIn: log.timeLogs?.timeIn || 'N/A',
        timeOut: log.timeLogs?.timeOut || 'N/A',
        totalHours: formatTotalHours(
          log.timeLogs?.timeIn, 
          log.timeLogs?.timeOut, 
          log.timeLogs?.lunchBreakStart, 
          log.timeLogs?.lunchBreakEnd
        ),
        status: calculateWorkStatus(
          log.timeLogs?.timeIn, 
          log.timeLogs?.timeOut, 
          log.timeLogs?.lunchBreakStart, 
          log.timeLogs?.lunchBreakEnd
        ),
        rawData: log, // Keep original data for reference
        previousLogs: [] // Will be populated when user clicks on logs
      }))
      
      setTodaysLogs(transformedData)
    } catch (error) {
      console.error('Error in fetchTodaysLogs:', error)
      setTodaysLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user's previous logs
  const fetchUserPreviousLogs = async (userId) => {
    setIsLoading(true)
    try {
      // Fetch time logs for the user using the corrected endpoint
      const timeLogsResponse = await axios.get(`${API_BASE_URL}/api/accomplishment-tracking/time-service/timelogs/${userId}?userId=${userId}`, {
        headers: apiHeaders
      })
      
      console.log('Previous logs API response:', timeLogsResponse.data)
      
      // Handle the new API response structure
      const responseData = timeLogsResponse.data.timeLogs
      let logsWithAccomplishments = []
      
      if (responseData && responseData.timeLogs) {
        // Since we're getting a single log entry, we'll create an array with one item
        // For the date, we'll use today's date or extract from accomplishment log if available
        const logDate = responseData.accomplishmentLog?.dateAssigned || new Date().toISOString().split('T')[0]
        
        logsWithAccomplishments = [{
          date: new Date(logDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          timeIn: responseData.timeLogs?.timeIn || 'N/A',
          timeOut: responseData.timeLogs?.timeOut || 'N/A',
          totalHours: formatTotalHours(
            responseData.timeLogs?.timeIn, 
            responseData.timeLogs?.timeOut, 
            responseData.timeLogs?.lunchBreakStart, 
            responseData.timeLogs?.lunchBreakEnd
          ),
          status: calculateWorkStatus(
            responseData.timeLogs?.timeIn, 
            responseData.timeLogs?.timeOut, 
            responseData.timeLogs?.lunchBreakStart, 
            responseData.timeLogs?.lunchBreakEnd
          ),
          details: {
            groupName: responseData.accomplishmentLog?.groupName || "Development Team",
            typeOfActivity: responseData.accomplishmentLog?.activityType || "Development",
            module: responseData.accomplishmentLog?.module || "General",
            dateAssigned: responseData.accomplishmentLog?.dateAssigned || logDate,
            targetEndDate: responseData.accomplishmentLog?.targetEndDate || logDate,
            actualEndDate: responseData.accomplishmentLog?.actualEndDate || logDate,
            currentStatus: responseData.accomplishmentLog?.status || "Completed",
            percentageOfActivity: responseData.accomplishmentLog?.percentageOfActivity || 100,
            projectLeads: responseData.accomplishmentLog?.projectHeads || ["No assigned leads"],
            activity: responseData.accomplishmentLog?.activities?.join(', ') || "No activities recorded"
          }
        }]
      }
      
      setSelectedUserLogs(logsWithAccomplishments)
    } catch (error) {
      console.error('Error fetching user logs:', error)
      setSelectedUserLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load today's logs on component mount
  useEffect(() => {
    fetchTodaysLogs()
  },[])

  const toggleLogExpansion = (logId) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  // Filter users based on search and filters
  const filteredUsers = todaysLogs.filter((user) => {
    const userName = user?.name || ''
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function getCurrentStatusColor(status) {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "delayed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "Overtime":
        return "bg-orange-500 text-white hover:bg-orange-600"
      case "Undertime":
        return "bg-red-500 text-white hover:bg-red-600"
      case "On Time":
        return "bg-green-500 text-white hover:bg-green-600"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const stats = {
    total: filteredUsers.length,
    onTime: filteredUsers.filter((u) => u.status === "On Time").length,
    overtime: filteredUsers.filter((u) => u.status === "Overtime").length,
    undertime: filteredUsers.filter((u) => u.status === "Undertime").length,
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Today's Logs - {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h1>
          <p className="text-sm text-gray-600">Monitor employee attendance and working hours</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTodaysLogs}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Refresh
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white border-gray-200"
            />
          </div>

          {/* Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-24 bg-white border-gray-200">
              <SelectValue placeholder="All..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All...</SelectItem>
              <SelectItem value="On Time">On Time</SelectItem>
              <SelectItem value="Overtime">Overtime</SelectItem>
              <SelectItem value="Undertime">Undertime</SelectItem>
            </SelectContent>
          </Select>

          {/* Color Legend */}
          <div className="flex items-center gap-4 text-sm">
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
        </div>
      </div>

      {/* User Cards */}
      <div className="space-y-4 mb-6">
        {isLoading && !todaysLogs.length ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading today's logs...</div>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white shadow-sm border-0 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex items-center gap-12">
                    <div className="w-20">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    </div>

                    <div className="text-sm text-gray-700">{user.latestDate}</div>

                  <div className="text-sm text-gray-700">{user.timeIn}</div>

                  <div className="text-sm text-gray-700">{user.timeOut}</div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {user.totalHours}
                  </div>

                  <Badge className={`${getStatusColor(user.status)} px-3 py-1 text-xs font-medium rounded-full`}>
                    {user.status}
                  </Badge>
                </div>

                {/* Logs Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                      onClick={() => fetchUserPreviousLogs(user.id)}
                    >
                      <FileText className="h-4 w-4" />
                      Logs
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[75%] w-[75%] max-h-[90vh] overflow-hidden sm:max-w-[90%] md:max-w-[1400px]">
                    <DialogHeader className="pb-4">
                      <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {user.name}'s Previous Logs
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[calc(90vh-120px)] overflow-y-auto pr-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-gray-500">Loading previous logs...</div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(selectedUserLogs || []).map((log, index) => {
                            const logId = `${user.id}-${index}`
                            const isExpanded = expandedLogs.has(logId)

                          return (
                            <div key={index}>
                              <Collapsible open={isExpanded} onOpenChange={() => toggleLogExpansion(logId)}>
                                <CollapsibleTrigger asChild>
                                  <div className="w-full cursor-pointer hover:bg-gray-50 transition-colors rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="grid grid-cols-4 gap-4 flex-1">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm font-medium text-gray-900">{log.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm text-gray-600">{log.totalHours}</span>
                                        </div>
                                        <div>
                                          <Badge size="sm" className={getStatusColor(log.status)}>
                                            {log.status}
                                          </Badge>
                                        </div>
                                        <div className="flex justify-end">
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                  <div className="mt-2 border-t bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      {/* Left Column */}
                                      <div className="space-y-3">
                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Group Name
                                          </label>
                                          <p className="text-sm text-gray-900">
                                            {log.details?.groupName || "Development Team Alpha"}
                                          </p>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Type of Activity
                                          </label>
                                          <p className="text-sm text-gray-900">
                                            {log.details?.typeOfActivity || "Development"}
                                          </p>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1 block">Module</label>
                                          <p className="text-sm text-gray-900">
                                            {log.details?.module || "User Management System"}
                                          </p>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Date Assigned
                                          </label>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-gray-400" />
                                            <p className="text-sm text-gray-900">
                                              {log.details?.dateAssigned || "July 20, 2025"}
                                            </p>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Target End Date
                                          </label>
                                          <div className="flex items-center gap-2">
                                            <Target className="h-3 w-3 text-gray-400" />
                                            <p className="text-sm text-gray-900">
                                              {log.details?.targetEndDate || log.date}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Right Column */}
                                      <div className="space-y-3">
                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Actual End Date
                                          </label>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-gray-400" />
                                            <p className="text-sm text-gray-900">
                                              {log.details?.actualEndDate || log.date}
                                            </p>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Current Status
                                          </label>
                                          <Badge
                                            size="sm"
                                            className={getCurrentStatusColor(log.details?.currentStatus || "Completed")}
                                          >
                                            {log.details?.currentStatus || "Completed"}
                                          </Badge>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Percentage of Activity
                                          </label>
                                          <div className="flex items-center gap-2">
                                            <TrendingUp className="h-3 w-3 text-gray-400" />
                                            <div className="flex items-center gap-2">
                                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                <div
                                                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                                                  style={{ width: `${log.details?.percentageOfActivity || 100}%` }}
                                                ></div>
                                              </div>
                                              <span className="text-xs font-medium text-gray-900">
                                                {log.details?.percentageOfActivity || 100}%
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Project Lead(s)
                                          </label>
                                          <div className="flex items-center gap-1 flex-wrap">
                                            <Users className="h-3 w-3 text-gray-400" />
                                            <div className="flex flex-wrap gap-1">
                                              {(log.details?.projectLeads || ["Sarah Johnson", "Mike Chen"]).map(
                                                (lead, leadIndex) => (
                                                  <Badge
                                                    key={leadIndex}
                                                    variant="secondary"
                                                    className="text-xs px-2 py-0.5"
                                                  >
                                                    {lead}
                                                  </Badge>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Activity Description */}
                                    <div>
                                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Activity Description
                                      </label>
                                      <div className="bg-white rounded border p-3">
                                        <p className="text-sm text-gray-900 leading-relaxed">
                                          {log.details?.activity ||
                                            "Completed assigned development tasks including code implementation, testing, and documentation."}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                              {index < (selectedUserLogs || []).length - 1 && <Separator className="my-2" />}
                            </div>
                          )
                        })}
                        </div>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>

      {/* No results message */}
      {!isLoading && filteredUsers.length === 0 && todaysLogs.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
          <p className="text-gray-600">No time logs are available for today. Check if employees have logged their time.</p>
        </div>
      )}

      {!isLoading && filteredUsers.length === 0 && todaysLogs.length > 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Bottom Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border-0 rounded-lg">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 rounded-lg">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">On Time</div>
            <div className="text-3xl font-bold text-green-500">{stats.onTime}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 rounded-lg">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">Overtime</div>
            <div className="text-3xl font-bold text-orange-500">{stats.overtime}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 rounded-lg">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">Undertime</div>
            <div className="text-3xl font-bold text-red-500">{stats.undertime}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}