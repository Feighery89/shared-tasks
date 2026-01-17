const API_BASE = import.meta.env.VITE_API_URL || ''

interface ApiError {
  detail: string
}

class ApiClient {
  private token: string | null = null

  constructor() {
    // Load token from localStorage on init
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getToken() {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // Auth
  async requestMagicLink(email: string) {
    return this.request<{ message: string; magic_link: string; token: string }>(
      '/api/auth/magic-link',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    )
  }

  async verifyMagicLink(token: string) {
    const response = await this.request<{ access_token: string }>(
      '/api/auth/verify',
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      }
    )
    this.setToken(response.access_token)
    return response
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' })
    } finally {
      this.setToken(null)
    }
  }

  // Users
  async getMe() {
    return this.request<User>('/api/users/me')
  }

  async updateMe(data: { name?: string; avatar_color?: string }) {
    return this.request<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Households
  async createHousehold(name: string) {
    return this.request<Household>('/api/households', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  async joinHousehold(inviteCode: string) {
    return this.request<Household>('/api/households/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    })
  }

  async getCurrentHousehold() {
    return this.request<Household>('/api/households/current')
  }

  async leaveHousehold() {
    return this.request('/api/households/leave', { method: 'POST' })
  }

  // Tasks
  async getTasks() {
    return this.request<Task[]>('/api/tasks')
  }

  async getCompletedTasks() {
    return this.request<Task[]>('/api/tasks/completed')
  }

  async createTask(title: string) {
    return this.request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
  }

  async claimTask(taskId: string) {
    return this.request<Task>(`/api/tasks/${taskId}/claim`, { method: 'POST' })
  }

  async unclaimTask(taskId: string) {
    return this.request<Task>(`/api/tasks/${taskId}/unclaim`, { method: 'POST' })
  }

  async completeTask(taskId: string) {
    return this.request<Task>(`/api/tasks/${taskId}/complete`, { method: 'POST' })
  }

  async uncompleteTask(taskId: string) {
    return this.request<Task>(`/api/tasks/${taskId}/uncomplete`, { method: 'POST' })
  }

  async deleteTask(taskId: string) {
    return this.request(`/api/tasks/${taskId}`, { method: 'DELETE' })
  }
}

// Types
export interface User {
  id: string
  email: string
  name: string | null
  avatar_color: string
  household_id: string | null
  created_at: string
}

export interface UserBrief {
  id: string
  name: string | null
  avatar_color: string
}

export interface Household {
  id: string
  name: string
  invite_code: string
  created_at: string
  members: UserBrief[]
}

export interface Task {
  id: string
  household_id: string
  title: string
  claimed_by: string | null
  completed_by: string | null
  completed_at: string | null
  created_by: string
  created_at: string
  claimed_by_user: UserBrief | null
  completed_by_user: UserBrief | null
  created_by_user: UserBrief | null
}

// Singleton instance
export const api = new ApiClient()
