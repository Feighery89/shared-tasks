import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../lib/api'
import type { Task } from '../lib/api'

const POLL_INTERVAL = 5000 // Poll every 5 seconds

export function useTasks(householdId: string | null | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const pollRef = useRef<number | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!householdId) {
      setTasks([])
      setCompletedTasks([])
      return
    }

    try {
      const [active, completed] = await Promise.all([
        api.getTasks(),
        api.getCompletedTasks(),
      ])
      setTasks(active)
      setCompletedTasks(completed)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }, [householdId])

  // Initial fetch and polling
  useEffect(() => {
    if (!householdId) {
      setTasks([])
      setCompletedTasks([])
      return
    }

    setLoading(true)
    fetchTasks().finally(() => setLoading(false))

    // Set up polling for real-time-ish updates
    pollRef.current = window.setInterval(fetchTasks, POLL_INTERVAL)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [householdId, fetchTasks])

  const addTask = async (title: string) => {
    try {
      const task = await api.createTask(title)
      setTasks(prev => [task, ...prev])
      return { data: task, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  const claimTask = async (taskId: string) => {
    try {
      const task = await api.claimTask(taskId)
      setTasks(prev => prev.map(t => t.id === taskId ? task : t))
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const unclaimTask = async (taskId: string) => {
    try {
      const task = await api.unclaimTask(taskId)
      setTasks(prev => prev.map(t => t.id === taskId ? task : t))
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const completeTask = async (taskId: string) => {
    try {
      const task = await api.completeTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setCompletedTasks(prev => [task, ...prev])
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const uncompleteTask = async (taskId: string) => {
    try {
      const task = await api.uncompleteTask(taskId)
      setCompletedTasks(prev => prev.filter(t => t.id !== taskId))
      setTasks(prev => [task, ...prev])
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setCompletedTasks(prev => prev.filter(t => t.id !== taskId))
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  return {
    tasks,
    completedTasks,
    loading,
    fetchTasks,
    addTask,
    claimTask,
    unclaimTask,
    completeTask,
    uncompleteTask,
    deleteTask,
  }
}
