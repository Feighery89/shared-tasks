import { TaskCard } from './TaskCard'
import { AddTask } from './AddTask'
import type { Task, User } from '../lib/api'

interface TaskListProps {
  tasks: Task[]
  currentUser: User
  loading: boolean
  onAddTask: (title: string) => Promise<void>
  onClaim: (taskId: string) => Promise<void>
  onUnclaim: (taskId: string) => Promise<void>
  onComplete: (taskId: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
}

export function TaskList({
  tasks,
  currentUser,
  loading,
  onAddTask,
  onClaim,
  onUnclaim,
  onComplete,
  onDelete,
}: TaskListProps) {
  // Separate tasks: my claimed, unclaimed, others' claimed
  const myClaimedTasks = tasks.filter((t) => t.claimed_by === currentUser.id)
  const unclaimedTasks = tasks.filter((t) => !t.claimed_by)
  const othersClaimedTasks = tasks.filter(
    (t) => t.claimed_by && t.claimed_by !== currentUser.id
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-500">
              Add a task below to get started
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* My claimed tasks */}
            {myClaimedTasks.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3 px-1">
                  Your Tasks ({myClaimedTasks.length})
                </h2>
                <div className="space-y-3">
                  {myClaimedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentUser={currentUser}
                      onClaim={onClaim}
                      onUnclaim={onUnclaim}
                      onComplete={onComplete}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Unclaimed tasks */}
            {unclaimedTasks.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-3 px-1">
                  Up for Grabs ({unclaimedTasks.length})
                </h2>
                <div className="space-y-3">
                  {unclaimedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentUser={currentUser}
                      onClaim={onClaim}
                      onUnclaim={onUnclaim}
                      onComplete={onComplete}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Others' claimed tasks */}
            {othersClaimedTasks.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3 px-1">
                  Partner's Tasks ({othersClaimedTasks.length})
                </h2>
                <div className="space-y-3">
                  {othersClaimedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentUser={currentUser}
                      onClaim={onClaim}
                      onUnclaim={onUnclaim}
                      onComplete={onComplete}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Add task input */}
      <div className="px-4">
        <AddTask onAdd={onAddTask} disabled={loading} />
      </div>
    </div>
  )
}
