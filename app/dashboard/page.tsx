import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutFeed from '@/components/feed/WorkoutFeed'

export default async function DashboardPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
        <p className="text-gray-600 mt-1">See what your friends are up to</p>
      </div>

      <WorkoutFeed userId={user.id} />
    </div>
  )
}
