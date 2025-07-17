# Time Management & Attendance System

## Overview
This comprehensive time management and attendance system provides complete tracking of employee work hours, attendance monitoring, and workforce management capabilities for the SIRTIS organization.

## Features Implemented

### 1. Attendance Management (`/hr/attendance`)
- **Real-time Attendance Dashboard**: Live view of current attendance status
- **Punch In/Out System**: GPS-enabled location tracking for attendance
- **Break Time Management**: Track work breaks and resume functionality
- **Attendance Statistics**: Daily, weekly, and monthly attendance metrics
- **Live Employee Status**: Real-time view of who's working, on break, or checked out
- **Location Tracking**: Track where employees are working (office, field, remote)

### 2. Time Tracking (`/hr/time-tracking`)
- **Project-based Time Tracking**: Track time spent on specific projects and tasks
- **Active Timer System**: Start/stop timers for real-time work tracking
- **Time Entry Management**: Manual time entry and editing capabilities
- **Billable vs Non-billable Hours**: Categorize time for billing purposes
- **Productivity Analytics**: Track productivity metrics and work patterns
- **Project Breakdown**: Detailed time allocation across different projects

### 3. Attendance Roster (`/hr/attendance?view=roster`)
- **Weekly Roster View**: Visual weekly attendance grid
- **Employee Schedule Management**: View and manage employee schedules
- **Coverage Analysis**: Track team coverage and identify gaps
- **Color-coded Status**: Easy visual identification of attendance status
- **Historical Data**: Track attendance patterns over time

### 4. Integrated Features
- **Dashboard Widget**: AttendanceWidget showing key metrics on HR dashboard
- **Quick Actions**: Punch in/out button component for easy access
- **Navigation Integration**: Seamlessly integrated into HR module navigation
- **Permission-based Access**: Role-based access control for different features
- **Responsive Design**: Works on desktop and mobile devices

## Key Components

### AttendanceWidget
- Real-time clock display
- Current status (checked in/out, on break)
- Today's attendance statistics
- Quick action buttons
- Quick links to detailed views

### PunchInOutButton
- Location-aware punch in/out
- Break time tracking
- Visual status indicators
- Geolocation integration

### Time Tracking System
- Project and task categorization
- Timer functionality
- Time entry management
- Productivity metrics

## Navigation Structure
```
HR Management
├── Time & Attendance
│   ├── Attendance Dashboard
│   ├── Time Tracking
│   ├── Weekly Roster
│   └── Attendance Reports
├── Leave Management
│   ├── Leave Dashboard
│   ├── Approvals
│   └── Leave Calendar
└── Notification Routing
```

## Data Tracking
- Check-in/check-out times
- Work duration and break times
- Location data for attendance
- Project time allocation
- Attendance patterns and trends
- Team coverage statistics

## Permission System
- `hr.attendance` - Basic attendance viewing
- `hr.attendance.reports` - Access to attendance reports
- `hr.full_access` - Complete HR system access
- `hr.time_tracking` - Time tracking features

## Technical Implementation
- Built with Next.js 15 and TypeScript
- Tailwind CSS for responsive design
- Real-time data updates
- Geolocation API integration
- Role-based access control
- Mobile-responsive interface

## Usage
1. **For Employees**: Use punch in/out functionality, track time on projects, view personal attendance
2. **For Supervisors**: Monitor team attendance, approve time entries, view team statistics
3. **For HR Staff**: Access comprehensive reports, manage attendance policies, analyze workforce data

This system provides a complete solution for modern workforce time and attendance management with real-time tracking, detailed analytics, and comprehensive reporting capabilities.
