'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Calendar, TrendingUp, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

interface WorkoutStats {
  totalWorkouts: number
  totalMinutes: number
  totalCalories: number
  currentStreak: number
}

export default function ProfileView({
  userId,
  initialProfile,
}: {
  userId: string
  initialProfile: Profile | null
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(initialProfile?.full_name || '')
  const [bio, setBio] = useState(initialProfile?.bio || '')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    currentStreak: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStats = async () => {
    try {
      // Get total workouts
      const { count: totalWorkouts } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get workout stats
      const { data: workouts } = await supabase
        .from('workouts')
        .select('duration_minutes, calories_burned')
        .eq('user_id', userId)

      const totalMinutes = workouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0
      const totalCalories = workouts?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0

      setStats({
        totalWorkouts: totalWorkouts || 0,
        totalMinutes,
        totalCalories,
        currentStreak: 0, // TODO: Calculate streak
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          bio: bio || null,
        })
        .eq('id', userId)

      if (error) throw error

      setProfile({
        ...profile!,
        full_name: fullName || null,
        bio: bio || null,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
              {profile.username[0].toUpperCase()}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.full_name || profile.username}
                  </h2>
                  <p className="text-gray-600">@{profile.username}</p>
                  {profile.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="mt-4" variant="outline">
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Your Stats</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Activity className="h-8 w-8 text-blue-600" />}
              label="Total Workouts"
              value={stats.totalWorkouts}
            />
            <StatCard
              icon={<TrendingUp className="h-8 w-8 text-green-600" />}
              label="Total Minutes"
              value={stats.totalMinutes}
            />
            <StatCard
              icon={<Activity className="h-8 w-8 text-orange-600" />}
              label="Calories Burned"
              value={stats.totalCalories}
            />
            <StatCard
              icon={<User className="h-8 w-8 text-purple-600" />}
              label="Current Streak"
              value={`${stats.currentStreak} days`}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="mb-2">{icon}</div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
