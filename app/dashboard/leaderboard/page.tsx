import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Leaderboard from '@/components/leaderboard/Leaderboard'

export default async function LeaderboardPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-1">Compete with others and climb the ranks</p>
      </div>

      <Leaderboard userId={user.id} />
    </div>
  )
}
