import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useHousehold } from './hooks/useHousehold'
import { useTasks } from './hooks/useTasks'
import { AuthForm } from './components/AuthForm'
import { HouseholdSetup } from './components/HouseholdSetup'
import { TaskList } from './components/TaskList'
import { DoneFeed } from './components/DoneFeed'
import { PartnerInvite } from './components/PartnerInvite'
import type { User } from './lib/api'

type Tab = 'tasks' | 'done'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const [showInvite, setShowInvite] = useState(false)

  const {
    user,
    loading: authLoading,
    isAuthenticated,
    signInWithMagicLink,
    verifyToken,
    signOut,
    updateProfile,
    refreshUser,
  } = useAuth()

  const {
    household,
    members,
    fetchHousehold,
    createHousehold,
    joinHousehold,
  } = useHousehold()

  const {
    tasks,
    completedTasks,
    loading: tasksLoading,
    addTask,
    claimTask,
    unclaimTask,
    completeTask,
    uncompleteTask,
    deleteTask,
  } = useTasks(user?.household_id)

  // Handle magic link token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const joinCode = params.get('join')
    
    if (token) {
      verifyToken(token).then(() => {
        // Clear the URL parameter
        window.history.replaceState({}, '', window.location.pathname)
      })
    }
    
    // Store join code for after auth
    if (joinCode) {
      sessionStorage.setItem('pending_join_code', joinCode)
    }
  }, [verifyToken])

  // Handle pending join code after auth
  useEffect(() => {
    if (isAuthenticated && user && !user.household_id) {
      const joinCode = sessionStorage.getItem('pending_join_code')
      if (joinCode) {
        sessionStorage.removeItem('pending_join_code')
        joinHousehold(joinCode).then(() => {
          refreshUser()
          window.history.replaceState({}, '', window.location.pathname)
        })
      }
    }
  }, [isAuthenticated, user, joinHousehold, refreshUser])

  // Fetch household when user changes
  useEffect(() => {
    if (user?.household_id) {
      fetchHousehold()
    }
  }, [user?.household_id, fetchHousehold])

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <AuthForm onSignIn={signInWithMagicLink} />
  }

  // No profile name or household
  if (!user.name || !user.household_id) {
    return (
      <HouseholdSetup
        onCreateHousehold={async (name) => {
          const result = await createHousehold(name)
          if (!result.error) {
            await refreshUser()
          }
          return { error: result.error }
        }}
        onJoinHousehold={async (code) => {
          const result = await joinHousehold(code)
          if (!result.error) {
            await refreshUser()
          }
          return { error: result.error }
        }}
        onUpdateProfile={async (data) => {
          return await updateProfile(data)
        }}
        userEmail={user.email}
        hasName={!!user.name}
      />
    )
  }

  // Convert User to the format components expect
  const profile: User = user

  // Main app
  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {household?.name || 'Shared Tasks'}
            </h1>
            <p className="text-xs text-gray-500">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Invite button */}
            <button
              onClick={() => setShowInvite(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Invite partner"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
            {/* User avatar */}
            <button
              onClick={() => {
                if (confirm('Sign out?')) signOut()
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
              style={{ backgroundColor: profile.avatar_color || '#f97316' }}
              title={`Signed in as ${profile.name}`}
            >
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-lg mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tasks'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              To Do
              {tasks.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                  {tasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('done')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'done'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Done
              {completedTasks.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                  {completedTasks.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full flex flex-col overflow-hidden">
        {activeTab === 'tasks' ? (
          <TaskList
            tasks={tasks}
            currentUser={profile}
            loading={tasksLoading}
            onAddTask={async (title) => {
              await addTask(title)
            }}
            onClaim={async (taskId) => {
              await claimTask(taskId)
            }}
            onUnclaim={async (taskId) => {
              await unclaimTask(taskId)
            }}
            onComplete={async (taskId) => {
              await completeTask(taskId)
            }}
            onDelete={async (taskId) => {
              await deleteTask(taskId)
            }}
          />
        ) : (
          <DoneFeed
            tasks={completedTasks}
            currentUser={profile}
            members={members}
            onUncomplete={async (taskId) => {
              await uncompleteTask(taskId)
            }}
          />
        )}
      </main>

      {/* Invite modal */}
      {showInvite && household && (
        <PartnerInvite household={household} onClose={() => setShowInvite(false)} />
      )}
    </div>
  )
}

export default App
