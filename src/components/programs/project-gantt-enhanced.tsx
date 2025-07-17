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
    dependencies: []
  })

  useEffect(() => {
    setMounted(true)
    loadTasks()
  }, [selectedProject])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
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
        parent: 'proj-1',
        level: 1,
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
        parent: 'proj-1',
        level: 1,
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
        parent: 'proj-1',
        level: 1,
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
        type: 'task',
        dependencies: taskData.dependencies,
        assignee: taskData.assignee,
        priority: taskData.priority,
        status: 'not_started',
        isBlocking: false,
        level: 1,
        estimatedHours: taskData.estimatedHours,
        actualHours: 0,
        cost: taskData.cost
      }

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
      dependencies: []
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
      dependencies: task.dependencies
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

  const getTaskBarStyle = (task: GanttTask) => {
    const startPos = getDatePosition(task.start)
    const endPos = getDatePosition(task.end)
    const width = Math.max(endPos - startPos, 20)
    
    return {
      left: `${startPos}px`,
      width: `${width}px`,
      backgroundColor: getTaskColor(task),
      opacity: task.status === 'cancelled' ? 0.4 : 1
    }
  }

  const getTaskColor = (task: GanttTask) => {
    if (task.type === 'milestone') return '#8B5CF6'
    if (task.status === 'completed') return '#10B981'
    if (task.status === 'in_progress') return '#3B82F6'
    if (task.status === 'on_hold') return '#F59E0B'
    if (task.status === 'cancelled') return '#EF4444'
    return '#6B7280'
  }

  const getDatePosition = (date: Date) => {
    // Simplified positioning calculation
    const dayWidth = 40
    const startDate = new Date('2025-01-01')
    const diffTime = date.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays * dayWidth
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee
    return matchesSearch && matchesStatus && matchesAssignee
  })

  const uniqueAssignees = Array.from(new Set(tasks.map(task => task.assignee)))

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gantt Chart</h2>
          <p className="text-sm text-gray-600">Interactive timeline view with dependencies</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {permissions.canCreate && (
            <button
              onClick={() => {
                setEditingTask(null)
                resetTaskForm()
                setShowTaskModal(true)
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center space-x-2">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Assignees</option>
          {uniqueAssignees.map(assignee => (
            <option key={assignee} value={assignee}>{assignee}</option>
          ))}
        </select>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">View:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'days' | 'weeks' | 'months')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>

        <button
          onClick={() => setShowCriticalPath(!showCriticalPath)}
          className={`px-3 py-1 rounded-md text-sm ${
            showCriticalPath 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}
        >
          Critical Path
        </button>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-auto" ref={ganttRef}>
            <div className="min-w-max">
              {/* Header */}
              <div className="flex bg-gray-50 border-b">
                <div className="w-80 p-4 border-r">
                  <div className="font-medium text-gray-900">Task Name</div>
                </div>
                <div className="flex-1 p-4">
                  <div className="font-medium text-gray-900">Timeline</div>
                </div>
              </div>

              {/* Tasks */}
              {filteredTasks.map(task => (
                <div key={task.id} className="flex border-b hover:bg-gray-50">
                  <div className="w-80 p-4 border-r">
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center space-x-2 ml-${task.level * 4}`}>
                        <div className={`w-3 h-3 rounded-full ${
                          task.type === 'milestone' ? 'bg-purple-500' : 
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                        <div>
                          <div className="font-medium text-sm text-gray-900">{task.name}</div>
                          <div className="text-xs text-gray-500">{task.assignee}</div>
                        </div>
                      </div>
                      
                      {permissions.canEdit && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 relative">
                    <div className="relative h-8">
                      <div
                        className="absolute top-1 h-6 rounded flex items-center justify-center text-white text-xs"
                        style={getTaskBarStyle(task)}
                      >
                        {task.progress > 0 && `${task.progress}%`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                onClick={() => setShowTaskModal(false)}
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
                  <input
                    type="text"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                    onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost (USD)
                  </label>
                  <input
                    type="number"
                    value={taskForm.cost}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
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
