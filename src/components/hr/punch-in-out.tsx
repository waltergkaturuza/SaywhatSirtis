"use client"

import { useState } from "react"
import { 
  ClockIcon, 
  PlayIcon, 
  StopIcon, 
  PauseIcon,
  MapPinIcon 
} from "@heroicons/react/24/outline"

export function PunchInOutButton() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [location, setLocation] = useState("Office - Floor 2")
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null)

  const handlePunchIn = () => {
    // Get user's location if needed
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log("Location:", position.coords.latitude, position.coords.longitude)
        setIsCheckedIn(true)
        // Here you would typically send this data to your backend
      })
    } else {
      setIsCheckedIn(true)
    }
  }

  const handlePunchOut = () => {
    setIsCheckedIn(false)
    setIsPaused(false)
    // Here you would typically send punch out data to your backend
  }

  const handleBreak = () => {
    setIsPaused(!isPaused)
    if (!isPaused) {
      setBreakStartTime(new Date().toLocaleTimeString())
    } else {
      setBreakStartTime(null)
    }
    // Here you would typically log break start/end to your backend
  }

  if (!isCheckedIn) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Quick Punch In</h3>
          <ClockIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2" />
            <span>{location}</span>
          </div>
          
          <button
            onClick={handlePunchIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Punch In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">
          {isPaused ? "On Break" : "Working"}
        </h3>
        <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-400" : "bg-green-400"}`} />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-2" />
          <span>{location}</span>
        </div>
        
        <div className="text-sm text-gray-600">
          <div>Checked in: 08:30 AM</div>
          <div>Work time: 7h 32m</div>
          {isPaused && breakStartTime && <div>Break started: {breakStartTime}</div>}
        </div>
        
        <div className="space-y-2">
          <button
            onClick={handleBreak}
            className={`w-full font-medium py-2 px-4 rounded-lg flex items-center justify-center ${
              isPaused 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
            }`}
          >
            {isPaused ? (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Resume Work
              </>
            ) : (
              <>
                <PauseIcon className="h-4 w-4 mr-2" />
                Take Break
              </>
            )}
          </button>
          
          <button
            onClick={handlePunchOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <StopIcon className="h-4 w-4 mr-2" />
            Punch Out
          </button>
        </div>
      </div>
    </div>
  )
}
