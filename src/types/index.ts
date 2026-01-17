// Re-export types from API
export type { User, UserBrief, Household, Task } from '../lib/api'

// Alias for backwards compatibility
export type TaskWithUsers = import('../lib/api').Task
