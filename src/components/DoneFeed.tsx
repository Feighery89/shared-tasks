import type { Task, User, UserBrief } from '../lib/api'

interface DoneFeedProps {
  tasks: Task[]
  currentUser: User
  members: UserBrief[]
  onUncomplete: (taskId: string) => Promise<void>
}

export function DoneFeed({ tasks, currentUser, members, onUncomplete }: DoneFeedProps) {
  // Group tasks by date
  const groupedTasks = tasks.reduce((groups, task) => {
    const date = new Date(task.completed_at!).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(task)
    return groups
  }, {} as Record<string, Task[]>)

  // Calculate completion stats for the week
  const myCompletions = tasks.filter((t) => t.completed_by === currentUser.id).length
  const totalCompletions = tasks.length
  const partnerCompletions = totalCompletions - myCompletions

  const getCompletedByName = (task: Task) => {
    if (task.completed_by === currentUser.id) return 'You'
    return task.completed_by_user?.name || 'Partner'
  }

  const getCompletedByColor = (task: Task) => {
    if (task.completed_by === currentUser.id) {
      return 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return 'bg-blue-100 text-blue-700 border-blue-200'
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Stats header */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          This Week
        </h3>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">{myCompletions}</div>
            <div className="text-sm text-gray-500">You</div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{partnerCompletions}</div>
            <div className="text-sm text-gray-500">
              {members.find((m) => m.id !== currentUser.id)?.name || 'Partner'}
            </div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">{totalCompletions}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>

        {/* Balance indicator */}
        {totalCompletions > 0 && (
          <div className="mt-4">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-orange-400 transition-all duration-500"
                style={{ width: `${(myCompletions / totalCompletions) * 100}%` }}
              />
              <div
                className="h-full bg-blue-400 transition-all duration-500"
                style={{ width: `${(partnerCompletions / totalCompletions) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Done feed */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No completions yet
          </h3>
          <p className="text-gray-500">
            Complete some tasks to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([date, dateTasks]) => (
            <section key={date}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                {date}
              </h2>
              <div className="space-y-2">
                {dateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3"
                  >
                    {/* Checkmark */}
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium truncate line-through decoration-gray-300">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(task.completed_at!)}
                      </p>
                    </div>

                    {/* Completed by badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getCompletedByColor(
                        task
                      )}`}
                    >
                      {getCompletedByName(task)}
                    </span>

                    {/* Undo button */}
                    <button
                      onClick={() => onUncomplete(task.id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                      title="Undo completion"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
