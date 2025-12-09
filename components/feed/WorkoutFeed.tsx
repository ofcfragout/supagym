'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Heart, MessageCircle, Share2, Clock, MapPin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/Button'

interface WorkoutWithProfile {
  id: string
  title: string
  description: string | null
  duration_minutes: number | null
  calories_burned: number | null
  location_name: string | null
  started_at: string
  created_at: string
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  workout_exercises: {
    exercise: {
      name: string
    }
    sets: number
    reps: number | null
  }[]
  likes: { user_id: string }[]
  comments: { id: string }[]
}

export default function WorkoutFeed({ userId }: { userId: string }) {
  const [workouts, setWorkouts] = useState<WorkoutWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchWorkouts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          profiles!workouts_user_id_fkey(username, full_name, avatar_url),
          workout_exercises(
            sets,
            reps,
            exercises(name)
          ),
          likes(user_id),
          comments(id)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setWorkouts((data as WorkoutWithProfile[]) || [])
    } catch (error) {
      console.error('Error fetching workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (workoutId: string) => {
    try {
      const isLiked = workouts
        .find((w) => w.id === workoutId)
        ?.likes.some((l) => l.user_id === userId)

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('workout_id', workoutId)
          .eq('user_id', userId)
      } else {
        await supabase.from('likes').insert({ workout_id: workoutId, user_id: userId })
      }

      fetchWorkouts()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardBody>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No workouts yet</p>
          <p className="text-gray-400">Follow some friends or start tracking your own workouts!</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => {
        const isLiked = workout.likes.some((l) => l.user_id === userId)
        const likeCount = workout.likes.length
        const commentCount = workout.comments.length

        return (
          <Card key={workout.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {workout.profiles.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {workout.profiles.full_name || workout.profiles.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{workout.profiles.username} •{' '}
                    {formatDistanceToNow(new Date(workout.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{workout.title}</h3>
                {workout.description && (
                  <p className="text-gray-600 mt-1">{workout.description}</p>
                )}
              </div>

              {workout.workout_exercises && workout.workout_exercises.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Exercises:</p>
                  <div className="space-y-1">
                    {workout.workout_exercises.slice(0, 3).map((we, idx: number) => (
                      <p key={idx} className="text-sm text-gray-600">
                        • {we.exercises?.name || 'Exercise'} - {we.sets} sets
                        {we.reps && ` × ${we.reps} reps`}
                      </p>
                    ))}
                    {workout.workout_exercises.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{workout.workout_exercises.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {workout.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {workout.duration_minutes} min
                  </div>
                )}
                {workout.location_name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {workout.location_name}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(workout.id)}
                  className={isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="ml-2">{likeCount}</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-5 w-5" />
                  <span className="ml-2">{commentCount}</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
