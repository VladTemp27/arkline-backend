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

// Large dummy data for testing with varied status types
const dummyTimeLogs = [
  // ON TIME examples (exactly 8.5 hours)
  {
    userId: "1",
    name: "John Smith",
    date: "2025-07-30",
    timeIn: "08:00:00",
    timeOut: "17:30:00",
    lunchBreakStart: "12:00:00",
    lunchBreakEnd: "13:00:00"
  },
  {
    userId: "2", 
    name: "Sarah Johnson",
    date: "2025-07-30",
    timeIn: "09:00:00",
    timeOut: "18:30:00",
    lunchBreakStart: "12:30:00",
    lunchBreakEnd: "13:30:00"
  },
  {
    userId: "3",
    name: "Mike Chen",
    date: "2025-07-30", 
    timeIn: "07:30:00",
    timeOut: "17:00:00",
    lunchBreakStart: "12:00:00",
    lunchBreakEnd: "13:00:00"
  },
  // OVERTIME examples (more than 8.5 hours)
  {
    userId: "4",
    name: "Emily Davis",
    date: "2025-07-30",
    timeIn: "08:00:00",
    timeOut: "18:00:00",
    lunchBreakStart: "12:00:00",
    lunchBreakEnd: "13:00:00"
  },
  {
    userId: "5",
    name: "David Wilson",
    date: "2025-07-30",
    timeIn: "07:00:00",
    timeOut: "19:30:00",
    lunchBreakStart: "12:00:00",
    lunchBreakEnd: "13:00:00"
  },
  {
    userId: "6",
    name: "Lisa Anderson",
    date: "2025-07-30",
    timeIn: "08:30:00",
    timeOut: "19:00:00",
    lunchBreakStart: "12:30:00",
    lunchBreakEnd: "13:30:00"
  },
  {
    userId: "7",
    name: "Robert Taylor",
    date: "2025-07-30",
    timeIn: "06:30:00",
    timeOut: "18:00:00",
    lunchBreakStart: "11:30:00",
    lunchBreakEnd: "12:30:00"
  },
  // UNDERTIME examples (less than 8.5 hours)
  {
    userId: "8",
    name: "Jessica Brown",
    date: "2025-07-30",
    timeIn: "09:00:00",
    timeOut: "16:00:00",
    lunchBreakStart: "12:00:00",
    lunchBreakEnd: "13:00:00"
  },
  {
    userId: "9",
    name: "Christopher Lee",
    date: "2025-07-30",
    timeIn: "10:00:00",
    timeOut: "17:30:00",
    lunchBreakStart: "13:00:00",
    lunchBreakEnd: "14:00:00"
  },
  {
    userId: "10",
    name: "Amanda White",
    date: "2025-07-30",
    timeIn: "08:00:00",
    timeOut: "15:30:00",
    lunchBreakStart: "12:00:00",
    lunchBreakEnd: "13:00:00"
  },
  {
    userId: "11",
    name: "Daniel Martinez",
    date: "2025-07-30",
    timeIn: "09:30:00",
    timeOut: "16:30:00",
    lunchBreakStart: "12:00:00",
    lunchBreakEnd: "13:00:00"
  },
  // More ON TIME examples
  {
    userId: "12",
    name: "Nicole Garcia",
    date: "2025-07-30",
    timeIn: "08:15:00",
    timeOut: "17:45:00",
    lunchBreakStart: "12:15:00",
    lunchBreakEnd: "13:15:00"
  },
  // More OVERTIME examples
  {
    userId: "13",
    name: "Kevin Rodriguez",
    date: "2025-07-30",
    timeIn: "07:45:00",
    timeOut: "19:15:00",
    lunchBreakStart: "12:00:00",
    lunchBreakEnd: "13:00:00"
  },
  // More UNDERTIME examples
  {
    userId: "14",
    name: "Michelle Thomas",
    date: "2025-07-30",
    timeIn: "10:30:00",
    timeOut: "17:00:00",
    lunchBreakStart: "13:00:00",
    lunchBreakEnd: "14:00:00"
  },
  {
    userId: "15",
    name: "Brian Jackson",
    date: "2025-07-30",
    timeIn: "11:00:00",
    timeOut: "18:00:00",
    lunchBreakStart: "14:00:00",
    lunchBreakEnd: "15:00:00"
  }
]

const dummyPreviousLogs = {
  "1": [
    {
      date: "2025-07-29",
      timeIn: "08:15:00",
      timeOut: "17:45:00",
      lunchBreakStart: "12:30:00",
      lunchBreakEnd: "13:30:00",
      details: {
        groupName: "Frontend Development Team",
        typeOfActivity: "Feature Development",
        module: "User Dashboard",
        activity: "Implemented new dashboard components and integrated API endpoints for real-time data display.",
        dateAssigned: "July 27, 2025",
        targetEndDate: "July 29, 2025",
        actualEndDate: "July 29, 2025",
        currentStatus: "Completed",
        percentageOfActivity: 100,
        projectLeads: ["Sarah Johnson", "Mike Chen"]
      }
    },
    {
      date: "2025-07-28", 
      timeIn: "08:00:00",
      timeOut: "17:30:00",
      lunchBreakStart: "12:00:00",
      lunchBreakEnd: "13:00:00",
      details: {
        groupName: "Frontend Development Team",
        typeOfActivity: "Bug Fixes",
        module: "Authentication System",
        activity: "Fixed login validation issues and improved error handling for edge cases.",
        dateAssigned: "July 26, 2025",
        targetEndDate: "July 28, 2025", 
        actualEndDate: "July 28, 2025",
        currentStatus: "Completed",
        percentageOfActivity: 100,
        projectLeads: ["David Wilson"]
      }
    }
  ],
  "2": [
    {
      date: "2025-07-29",
      timeIn: "09:00:00",
      timeOut: "18:15:00",
      lunchBreakStart: "12:45:00",
      lunchBreakEnd: "13:45:00",
      details: {
        groupName: "Backend Development Team",
        typeOfActivity: "API Development",
        module: "Time Tracking Service",
        activity: "Developed REST APIs for time logging functionality with proper authentication and validation.",
        dateAssigned: "July 27, 2025",
        targetEndDate: "July 30, 2025",
        actualEndDate: "July 29, 2025",
        currentStatus: "Completed",
        percentageOfActivity: 95,
        projectLeads: ["Emily Davis", "Robert Taylor"]
      }
    }
  ],
  "3": [
    {
      date: "2025-07-29",
      timeIn: "07:45:00",
      timeOut: "16:45:00", 
      lunchBreakStart: "12:00:00",
      lunchBreakEnd: "12:45:00",
      details: {
        groupName: "QA Testing Team",
        typeOfActivity: "Testing",
        module: "User Management System",
        activity: "Performed comprehensive testing on user registration and profile management features.",
        dateAssigned: "July 28, 2025",
        targetEndDate: "July 29, 2025",
        actualEndDate: "July 29, 2025",
        currentStatus: "Completed",
        percentageOfActivity: 100,
        projectLeads: ["Jessica Brown"]
      }
    }
  ]
}

export default function AccomplishmentDashboard() {
  const [expandedLogs, setExpandedLogs] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [todaysLogs, setTodaysLogs] = useState([])
  const [selectedUserLogs, setSelectedUserLogs] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // API Configuration
  const API_BASE_URL = 'https://api.arkline.com'
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
    return `${hours} hrs ${minutes} minutes`
  }

  // Fetch today's logs
  const fetchTodaysLogs = async () => {
    setIsLoading(true)
    try {
      let timeLogs = []
      
      // Try to fetch from API first
      try {
        const response = await axios.get(`${API_BASE_URL}/api/accomplishment-tracking/time-service/timelogs`, {
          headers: apiHeaders
        })

        console.log('API response:', response.data)
        
        // Handle the correct API response structure
        timeLogs = response.data.allTimeLogs || []
        console.log('Successfully fetched time logs from API:', timeLogs.length, 'records')
      } catch (apiError) {
        console.warn('API request failed, using dummy data as fallback:', apiError.message)
        // Use dummy data as fallback when API fails
        timeLogs = dummyTimeLogs
      }
      
      // If no data from both API and dummy data, use empty array
      if (!timeLogs || timeLogs.length === 0) {
        console.warn('No time logs available from API or dummy data')
        timeLogs = dummyTimeLogs // Still use dummy data for testing
      }
      
      // Transform data to match component structure
      const transformedData = timeLogs.map(log => ({
        id: log.userId,
        name: log.name,
        latestDate: new Date(log.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        timeIn: log.timeIn || 'N/A',
        timeOut: log.timeOut || 'N/A',
        totalHours: formatTotalHours(
          log.timeIn, 
          log.timeOut, 
          log.lunchBreakStart, 
          log.lunchBreakEnd
        ),
        status: calculateWorkStatus(
          log.timeIn, 
          log.timeOut, 
          log.lunchBreakStart, 
          log.lunchBreakEnd
        ),
        rawData: log, // Keep original data for reference
        previousLogs: [] // Will be populated when user clicks on logs
      }))
      
      setTodaysLogs(transformedData)
    } catch (error) {
      console.error('Error in fetchTodaysLogs:', error)
      // Use dummy data as final fallback
      console.log('Using dummy data as final fallback')
      const transformedData = dummyTimeLogs.map(log => ({
        id: log.userId,
        name: log.name,
        latestDate: new Date(log.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        timeIn: log.timeIn || 'N/A',
        timeOut: log.timeOut || 'N/A',
        totalHours: formatTotalHours(
          log.timeIn, 
          log.timeOut, 
          log.lunchBreakStart, 
          log.lunchBreakEnd
        ),
        status: calculateWorkStatus(
          log.timeIn, 
          log.timeOut, 
          log.lunchBreakStart, 
          log.lunchBreakEnd
        ),
        rawData: log,
        previousLogs: []
      }))
      setTodaysLogs(transformedData)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user's previous logs
  const fetchUserPreviousLogs = async (userId) => {
    setIsLoading(true)
    try {
      let logsWithAccomplishments = []
      
      // Try to fetch from API first
      try {
        // Fetch time logs for the user
        const timeLogsResponse = await axios.get(`${API_BASE_URL}/api/accomplishment-tracking/time-service/timelogs/${userId}?userId=${userId}`, {
          headers: apiHeaders
        })
        
        // Handle the correct API response structure
        const userTimeLogs = timeLogsResponse.data.allTimeLogs || []
        console.log('User Time Logs from API:', userTimeLogs.length, 'records')
        
        // Transform time logs and fetch accomplishments for each date
        logsWithAccomplishments = await Promise.all(
          userTimeLogs.map(async (log) => {
            try {
              // Fetch accomplishments for this specific date
              const accomplishmentResponse = await axios.get(
                `${API_BASE_URL}/api/accomplishment-tracking/accomplishment-service/form?userId=${userId}&date=${log.date}`,
                { headers: apiHeaders }
              )
              
              return {
                date: new Date(log.date).toLocaleDateString('en-US', { 
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
                details: accomplishmentResponse.data || {}
              }
            } catch (accomplishmentError) {
              console.error('Error fetching accomplishments for date:', log.date, accomplishmentError)
              return {
                date: new Date(log.date).toLocaleDateString('en-US', { 
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
                details: {}
              }
            }
          })
        )
      } catch (apiError) {
        console.warn('API request failed, using dummy data as fallback:', apiError.message)
        // Use dummy data as fallback when API fails
        const userPreviousLogs = dummyPreviousLogs[userId] || []
        
        logsWithAccomplishments = userPreviousLogs.map(log => ({
          date: new Date(log.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          timeIn: log.timeIn || 'N/A',
          timeOut: log.timeOut || 'N/A',
          totalHours: formatTotalHours(
            log.timeIn, 
            log.timeOut, 
            log.lunchBreakStart, 
            log.lunchBreakEnd
          ),
          status: calculateWorkStatus(
            log.timeIn, 
            log.timeOut, 
            log.lunchBreakStart, 
            log.lunchBreakEnd
          ),
          details: log.details || {}
        }))
      }
      
      // If no data from both API and dummy data, provide fallback
      if (!logsWithAccomplishments || logsWithAccomplishments.length === 0) {
        console.warn('No previous logs available from API or dummy data for user:', userId)
        const userPreviousLogs = dummyPreviousLogs[userId] || []
        logsWithAccomplishments = userPreviousLogs.map(log => ({
          date: new Date(log.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          timeIn: log.timeIn || 'N/A',
          timeOut: log.timeOut || 'N/A',
          totalHours: formatTotalHours(
            log.timeIn, 
            log.timeOut, 
            log.lunchBreakStart, 
            log.lunchBreakEnd
          ),
          status: calculateWorkStatus(
            log.timeIn, 
            log.timeOut, 
            log.lunchBreakStart, 
            log.lunchBreakEnd
          ),
          details: log.details || {}
        }))
      }
      
      setSelectedUserLogs(logsWithAccomplishments)
    } catch (error) {
      console.error('Error fetching user logs:', error)
      // Use dummy data as final fallback
      console.log('Using dummy data as final fallback for user:', userId)
      const userPreviousLogs = dummyPreviousLogs[userId] || []
      const fallbackLogs = userPreviousLogs.map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        timeIn: log.timeIn || 'N/A',
        timeOut: log.timeOut || 'N/A',
        totalHours: formatTotalHours(
          log.timeIn, 
          log.timeOut, 
          log.lunchBreakStart, 
          log.lunchBreakEnd
        ),
        status: calculateWorkStatus(
          log.timeIn, 
          log.timeOut, 
          log.lunchBreakStart, 
          log.lunchBreakEnd
        ),
        details: log.details || {}
      }))
      setSelectedUserLogs(fallbackLogs)
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
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
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