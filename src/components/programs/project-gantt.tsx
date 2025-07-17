"use client"

import { useState, useEffect, useRef } from "react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"

interface ProjectGanttProps {
  permissions: any
  selectedProject: number | null
  onProjectSelect: (projectId: number | null) => void
}

interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  type: 'task' | 'milestone' | 'summary'
  dependencies: string[]
  assignee: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  isBlocking: boolean
  parent?: string
  children?: GanttTask[]
  level: number
  description?: string
  estimatedHours?: number
  actualHours?: number
  cost?: number
}

interface TaskFormData {
  name: string
  description: string
  start: string
  end: string
  assignee: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedHours: number
  cost: number
  dependencies: string[]
  wbsNode: string
  phase: string
  taskType: 'task' | 'milestone' | 'summary'
}

export function ProjectGantt({ permissions, selectedProject, onProjectSelect }: ProjectGanttProps) {
  const [mounted, setMounted] = useState(false)
  const [tasks, setTasks] = useState<GanttTask[]>([])
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months'>('weeks')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [showCriticalPath, setShowCriticalPath] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const ganttRef = useRef<HTMLDivElement>(null)

  const [taskForm, setTaskForm] = useState<TaskFormData>({
    name: '',
    description: '',
    start: '',
    end: '',
    assignee: '',
    priority: 'medium',
    estimatedHours: 0,
    cost: 0,
    dependencies: [],
    wbsNode: '',
    phase: '',
    taskType: 'task'
  })

  useEffect(() => {
    setMounted(true)
    loadTasks()
  }, [selectedProject])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTasks(getMockTasks())
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMockTasks = (): GanttTask[] => {
    return [
      {
        id: 'proj-1',
        name: 'Community Health Initiative',
        start: new Date('2025-01-15'),
        end: new Date('2025-09-15'),
        progress: 45,
        type: 'summary',
        dependencies: [],
        assignee: 'Sarah Johnson',
        priority: 'high',
        status: 'in_progress',
        isBlocking: false,
        level: 0,
        description: 'Main project to improve healthcare access',
        estimatedHours: 2000,
        actualHours: 900,
        cost: 150000
      },
      {
        id: 'phase-1',
        name: 'Phase 1: Planning & Design',
        start: new Date('2025-01-15'),
        end: new Date('2025-03-15'),
        progress: 85,
        type: 'summary',
        dependencies: [],
        assignee: 'Sarah Johnson',
        priority: 'high',
        status: 'in_progress',
        isBlocking: false,
        parent: 'proj-1',
        level: 1,
        description: 'Initial planning and design phase',
        estimatedHours: 400,
        actualHours: 340,
        cost: 25000
      },
      {
        id: 'task-1-1',
        name: 'Stakeholder Analysis',
        start: new Date('2025-01-15'),
        end: new Date('2025-02-01'),
        progress: 100,
        type: 'task',
        dependencies: [],
        assignee: 'Mike Chen',
        priority: 'high',
        status: 'completed',
        isBlocking: true,
        parent: 'phase-1',
        level: 2,
        description: 'Identify and analyze key stakeholders',
        estimatedHours: 80,
        actualHours: 75,
        cost: 5000
      },
      {
        id: 'task-1-2',
        name: 'Community Needs Assessment',
        start: new Date('2025-02-01'),
        end: new Date('2025-02-20'),
        progress: 100,
        type: 'task',
        dependencies: ['task-1-1'],
        assignee: 'Lisa Wang',
        priority: 'high',
        status: 'completed',
        isBlocking: true,
        parent: 'phase-1',
        level: 2,
        description: 'Assess community health needs and gaps',
        estimatedHours: 120,
        actualHours: 130,
        cost: 8000
      },
      {
        id: 'task-1-3',
        name: 'Project Design & Planning',
        start: new Date('2025-02-20'),
        end: new Date('2025-03-15'),
        progress: 60,
        type: 'task',
        dependencies: ['task-1-2'],
        assignee: 'James Rodriguez',
        priority: 'medium',
        status: 'in_progress',
        isBlocking: false,
        parent: 'phase-1',
        level: 2,
        description: 'Create detailed project design and implementation plan',
        estimatedHours: 200,
        actualHours: 135,
        cost: 12000
      }
    ]
  }

  const createTask = async (taskData: TaskFormData) => {
    setIsLoading(true)
    try {
      const newTask: GanttTask = {
        id: `task-${Date.now()}`,
        name: taskData.name,
        description: taskData.description,
        start: new Date(taskData.start),
        end: new Date(taskData.end),
        progress: 0,
        type: taskData.taskType,
        dependencies: taskData.dependencies,
        assignee: taskData.assignee,
        priority: taskData.priority,
        status: 'not_started',
        isBlocking: false,
        parent: taskData.wbsNode || undefined,
        level: taskData.wbsNode ? getTaskLevel(taskData.wbsNode) + 1 : 2,
        estimatedHours: taskData.estimatedHours,
        actualHours: 0,
        cost: taskData.cost
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setTasks(prev => [...prev, newTask])
      setShowTaskModal(false)
      resetTaskForm()
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTask = async (taskId: string, updates: Partial<GanttTask>) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ))
      setEditingTask(null)
      setShowTaskModal(false)
      resetTaskForm()
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetTaskForm = () => {
    setTaskForm({
      name: '',
      description: '',
      start: '',
      end: '',
      assignee: '',
      priority: 'medium',
      estimatedHours: 0,
      cost: 0,
      dependencies: [],
      wbsNode: '',
      phase: '',
      taskType: 'task'
    })
  }

  const handleEditTask = (task: GanttTask) => {
    setEditingTask(task)
    setTaskForm({
      name: task.name,
      description: task.description || '',
      start: task.start.toISOString().split('T')[0],
      end: task.end.toISOString().split('T')[0],
      assignee: task.assignee,
      priority: task.priority,
      estimatedHours: task.estimatedHours || 0,
      cost: task.cost || 0,
      dependencies: task.dependencies,
      wbsNode: task.parent || '',
      phase: getPhaseFromTask(task),
      taskType: task.type === 'milestone' ? 'milestone' : 'task'
    })
    setShowTaskModal(true)
  }

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTask) {
      updateTask(editingTask.id, {
        name: taskForm.name,
        description: taskForm.description,
        start: new Date(taskForm.start),
        end: new Date(taskForm.end),
        assignee: taskForm.assignee,
        priority: taskForm.priority,
        estimatedHours: taskForm.estimatedHours,
        cost: taskForm.cost,
        dependencies: taskForm.dependencies
      })
    } else {
      createTask(taskForm)
    }
  }

  const updateTaskProgress = async (taskId: string, progress: number) => {
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'
    await updateTask(taskId, { progress, status })
  }

  const getAllAssignees = () => {
    const assignees = new Set<string>()
    tasks.forEach(task => assignees.add(task.assignee))
    return Array.from(assignees)
  }

  const getAvailableWBSNodes = () => {
    return tasks
      .filter(task => task.type === 'summary' || task.level <= 1)
      .map(task => ({
        id: task.id,
        name: task.name,
        level: task.level
      }))
  }

  const getAvailablePhases = () => {
    return tasks
      .filter(task => task.type === 'summary' && task.level === 1)
      .map(task => ({
        id: task.id,
        name: task.name
      }))
  }

  const getPhaseFromTask = (task: GanttTask): string => {
    if (task.level === 1) return task.id
    if (task.parent) {
      const parentTask = tasks.find(t => t.id === task.parent)
      if (parentTask && parentTask.level === 1) return parentTask.id
      if (parentTask) return getPhaseFromTask(parentTask)
    }
    return ''
  }

  const getTaskLevel = (parentId: string): number => {
    const parentTask = tasks.find(task => task.id === parentId)
    return parentTask ? parentTask.level : 1
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee
    return matchesSearch && matchesStatus && matchesAssignee
  })

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const getDateRange = () => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth() - 2, 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 4, 0)
    return { start, end }
  }

  const generateTimelineColumns = () => {
    const { start, end } = getDateRange()
    const columns = []
    const current = new Date(start)

    while (current <= end) {
      if (viewMode === 'months') {
        columns.push({
          date: new Date(current),
          label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        })
        current.setMonth(current.getMonth() + 1)
      } else if (viewMode === 'weeks') {
        columns.push({
          date: new Date(current),
          label: `Week ${Math.ceil(current.getDate() / 7)}`
        })
        current.setDate(current.getDate() + 7)
      } else {
        columns.push({
          date: new Date(current),
          label: current.getDate().toString()
        })
        current.setDate(current.getDate() + 1)
      }
    }
    return columns
  }

  const getTaskWidth = (task: GanttTask) => {
    const { start, end } = getDateRange()
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const taskDays = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max((taskDays / totalDays) * 100, 2) // Minimum 2% width
  }

  const getTaskPosition = (task: GanttTask) => {
    const { start } = getDateRange()
    const totalDays = Math.ceil((getDateRange().end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const daysFromStart = Math.ceil((task.start.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max((daysFromStart / totalDays) * 100, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'on_hold': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500'
      case 'high': return 'border-orange-500'
      case 'medium': return 'border-yellow-500'
      case 'low': return 'border-green-500'
      default: return 'border-gray-300'
    }
  }

  const renderTask = (task: GanttTask) => {
    const width = getTaskWidth(task)
    const position = getTaskPosition(task)
    const isMilestone = task.type === 'milestone'
    const isSelected = selectedTasks.includes(task.id)

    return (
      <div key={task.id} className="relative">
        {/* Task Row */}
        <div className={`flex items-center h-12 border-b border-gray-100 hover:bg-gray-50 group ${isSelected ? 'bg-blue-50' : ''}`}>
          {/* Task Info Column */}
          <div className="w-80 flex-shrink-0 px-4 flex items-center">
            <div style={{ marginLeft: `${task.level * 20}px` }} className="flex items-center flex-1">
              {task.children && task.children.length > 0 && (
                <button className="mr-2 p-1 hover:bg-gray-200 rounded">
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className={`text-sm font-medium truncate ${task.type === 'summary' ? 'font-bold' : ''}`}>
                    {task.name}
                  </span>
                  {task.isBlocking && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                      Critical
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {task.assignee} • {task.progress}% complete
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 ml-2">
                <button
                  onClick={() => setSelectedTasks(prev => 
                    prev.includes(task.id) 
                      ? prev.filter(id => id !== task.id)
                      : [...prev, task.id]
                  )}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  title="Select"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                </button>
                {permissions.canEdit && (
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {permissions.canDelete && task.type !== 'summary' && (
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Column */}
          <div className="flex-1 relative h-12 px-2">
            <div className="relative h-full flex items-center">
              {isMilestone ? (
                // Milestone diamond
                <div
                  className={`absolute transform rotate-45 w-4 h-4 border-2 ${getPriorityColor(task.priority)} ${getStatusColor(task.status)} cursor-pointer`}
                  style={{ left: `${position}%` }}
                  title={`${task.name} - ${task.start.toLocaleDateString()}`}
                  onClick={() => handleEditTask(task)}
                />
              ) : (
                // Task bar
                <div
                  className={`absolute h-6 rounded border-l-4 ${getPriorityColor(task.priority)} ${getStatusColor(task.status)} flex items-center px-2 cursor-pointer hover:shadow-md transition-shadow`}
                  style={{ 
                    left: `${position}%`, 
                    width: `${width}%`,
                    minWidth: '20px'
                  }}
                  onClick={() => handleEditTask(task)}
                >
                  {/* Progress indicator */}
                  <div 
                    className="absolute inset-0 bg-white bg-opacity-30 rounded"
                    style={{ width: `${task.progress}%` }}
                  />
                  <span className="relative text-xs text-white font-medium truncate">
                    {width > 10 ? task.name : ''}
                  </span>
                  
                  {/* Progress control */}
                  {permissions.canEdit && (
                    <div className="absolute -bottom-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress}
                        onChange={(e) => updateTaskProgress(task.id, Number(e.target.value))}
                        className="w-16 h-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Dependencies lines would go here */}
            </div>
          </div>
        </div>

        {/* Render children */}
        {task.children?.map(child => renderTask(child))}
      </div>
    )
  }

  const timelineColumns = generateTimelineColumns()

  return (
    <div className="h-full flex flex-col">
      {/* Gantt Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gantt Chart</h2>
            <p className="text-gray-600 mt-1">Project timeline and task dependencies visualization</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>

            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Assignees</option>
              {getAllAssignees().map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>

            {/* View Mode */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'days' | 'weeks' | 'months')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>

            {/* Options */}
            <button
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={`px-3 py-2 border rounded-md text-sm ${
                showCriticalPath 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Critical Path
            </button>

            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filter
            </button>

            {permissions.canCreate && (
              <button 
                onClick={() => {
                  setEditingTask(null)
                  resetTaskForm()
                  setShowTaskModal(true)
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto">
        {/* Timeline Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex">
            {/* Task Header */}
            <div className="w-80 flex-shrink-0 px-4 py-3 bg-gray-50 border-r border-gray-200">
              <span className="text-sm font-medium text-gray-900">Task / Milestone</span>
            </div>
            
            {/* Timeline Header */}
            <div className="flex-1 bg-gray-50">
              <div className="flex">
                {timelineColumns.map((column, index) => (
                  <div 
                    key={index}
                    className="flex-1 px-2 py-3 text-center text-xs font-medium text-gray-900 border-r border-gray-200 min-w-[60px]"
                  >
                    {column.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Task Rows */}
        <div className="relative">
          {/* Today line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
            style={{ left: `${80 + (getTaskPosition({ 
              start: new Date(), 
              end: new Date() 
            } as GanttTask) / 100) * (window.innerWidth - 320)}px` }}
          >
            <div className="absolute -top-2 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Today
            </div>
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {timelineColumns.map((_, index) => (
              <div 
                key={index}
                className="absolute top-0 bottom-0 w-px bg-gray-200"
                style={{ left: `${320 + (index * (100 / timelineColumns.length))}%` }}
              />
            ))}
          </div>

          {/* Tasks */}
          {filteredTasks.map(task => renderTask(task))}
        </div>
      </div>

      {/* Gantt Controls */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Zoom:</span>
            <input
              type="range"
              min="50"
              max="200"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{zoomLevel}%</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Not Started</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-red-500 transform rotate-45"></div>
              <span>Milestone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => {
                  setShowTaskModal(false)
                  setEditingTask(null)
                  resetTaskForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  value={taskForm.name}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={taskForm.start}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={taskForm.end}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee *
                  </label>
                  <select
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select assignee</option>
                    {getAllAssignees().map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                    <option value="New User">Add New User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedHours: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    value={taskForm.cost}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WBS Node
                  </label>
                  <select
                    value={taskForm.wbsNode}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, wbsNode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select WBS Node</option>
                    {getAvailableWBSNodes().map(node => (
                      <option key={node.id} value={node.id}>
                        {'  '.repeat(node.level)} {node.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phase
                  </label>
                  <select
                    value={taskForm.phase}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, phase: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Phase</option>
                    {getAvailablePhases().map(phase => (
                      <option key={phase.id} value={phase.id}>{phase.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Type
                  </label>
                  <select
                    value={taskForm.taskType}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, taskType: e.target.value as 'task' | 'milestone' | 'summary' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="task">Task</option>
                    <option value="milestone">Milestone</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dependencies
                </label>
                <select
                  multiple
                  value={taskForm.dependencies}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value)
                    setTaskForm(prev => ({ ...prev, dependencies: values }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  size={4}
                >
                  {filteredTasks
                    .filter(task => task.id !== editingTask?.id)
                    .map(task => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl/Cmd to select multiple dependencies
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false)
                    setEditingTask(null)
                    resetTaskForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
