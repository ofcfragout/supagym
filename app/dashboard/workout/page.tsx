import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutTracker from '@/components/workout/WorkoutTracker'

export default async function WorkoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Track Workout</h1>
        <p className="text-gray-600 mt-1">Log your exercises and track your progress</p>
      </div>

      <WorkoutTracker userId={user.id} />
    </div>
  )
}
