'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Trophy, TrendingUp, Activity, Flame } from 'lucide-react'

interface LeaderboardEntry {
  user_id: string
  username: string
  full_name: string | null
  total_workouts: number
  total_minutes: number
  total_calories: number
  rank: number
}

type LeaderboardType = 'workouts' | 'minutes' | 'calories'

export default function Leaderboard({ userId }: { userId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<LeaderboardType>('workouts')
  const supabase = createClient()

  useEffect(() => {
    fetchLeaderboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      // Get all users with their workout stats
      const { data: profiles } = await supabase.from('profiles').select('id, username, full_name')

      if (!profiles) return

      const leaderboardData: LeaderboardEntry[] = []

      for (const profile of profiles) {
        const { data: workouts } = await supabase
          .from('workouts')
          .select('duration_minutes, calories_burned')
          .eq('user_id', profile.id)

        const totalWorkouts = workouts?.length || 0
        const totalMinutes = workouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0
        const totalCalories = workouts?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0

        leaderboardData.push({
          user_id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          total_workouts: totalWorkouts,
          total_minutes: totalMinutes,
          total_calories: totalCalories,
          rank: 0,
        })
      }

      // Sort based on selected type
      const sortField =
        selectedType === 'workouts'
          ? 'total_workouts'
          : selectedType === 'minutes'
          ? 'total_minutes'
          : 'total_calories'

      leaderboardData.sort((a, b) => b[sortField] - a[sortField])

      // Assign ranks
      leaderboardData.forEach((entry, index) => {
        entry.rank = index + 1
      })

      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Trophy className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-semibold text-gray-600">#{rank}</span>
  }

  const getValue = (entry: LeaderboardEntry) => {
    switch (selectedType) {
      case 'workouts':
        return `${entry.total_workouts} workouts`
      case 'minutes':
        return `${entry.total_minutes} minutes`
      case 'calories':
        return `${entry.total_calories} calories`
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedType('workouts')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                selectedType === 'workouts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Activity className="h-4 w-4" />
              Total Workouts
            </button>
            <button
              onClick={() => setSelectedType('minutes')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                selectedType === 'minutes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Total Minutes
            </button>
            <button
              onClick={() => setSelectedType('calories')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                selectedType === 'calories'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Flame className="h-4 w-4" />
              Total Calories
            </button>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data yet. Start working out to appear on the leaderboard!
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    entry.user_id === userId ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {entry.username[0].toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {entry.full_name || entry.username}
                      {entry.user_id === userId && (
                        <span className="ml-2 text-sm text-blue-600">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">@{entry.username}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">{getValue(entry)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
