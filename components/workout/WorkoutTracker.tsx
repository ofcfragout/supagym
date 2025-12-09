'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Play, Square, Clock, MapPin } from 'lucide-react'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import ExerciseSelector from './ExerciseSelector'

interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_group: string
  equipment: string | null
  difficulty: string | null
  instructions: string[] | null
}

interface WorkoutExercise {
  exercise_id: string
  exercise: Exercise | null
  sets: number
  reps: number | null
  weight: number | null
  notes: string
}

export default function WorkoutTracker({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private' | 'friends'>('public')
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [isTracking, setIsTracking] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [saving, setSaving] = useState(false)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  
  const location = useGeolocation()
  const supabase = createClient()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, startTime])

  const handleStartWorkout = () => {
    setIsTracking(true)
    setStartTime(new Date())
  }

  const handleStopWorkout = () => {
    setIsTracking(false)
  }

  const handleAddExercise = (exercise: Exercise) => {
    setExercises([
      ...exercises,
      {
        exercise_id: exercise.id,
        exercise,
        sets: 3,
        reps: 10,
        weight: null,
        notes: '',
      },
    ])
    setShowExerciseSelector(false)
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleUpdateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const handleSaveWorkout = async () => {
    if (!title.trim()) {
      alert('Please enter a workout title')
      return
    }

    if (exercises.length === 0) {
      alert('Please add at least one exercise')
      return
    }

    setSaving(true)

    try {
      const durationMinutes = startTime
        ? Math.floor((Date.now() - startTime.getTime()) / 60000)
        : null

      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          title,
          description: description || null,
          visibility,
          duration_minutes: durationMinutes,
          location_lat: location.latitude,
          location_lng: location.longitude,
          started_at: startTime?.toISOString() || new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      const exerciseInserts = exercises.map((ex, index) => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes || null,
        order_index: index,
      }))

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exerciseInserts)

      if (exercisesError) throw exercisesError

      alert('Workout saved successfully!')
      
      // Reset form
      setTitle('')
      setDescription('')
      setExercises([])
      setIsTracking(false)
      setStartTime(null)
      setElapsedTime(0)
    } catch (error) {
      console.error('Error saving workout:', error)
      alert('Failed to save workout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Workout Details</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Workout Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Morning Chest & Triceps"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Felt strong today, hit new PR on bench press!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Privacy
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Everyone can see</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private - Only me</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            {!isTracking ? (
              <Button onClick={handleStartWorkout} variant="primary">
                <Play className="h-5 w-5 mr-2" />
                Start Workout
              </Button>
            ) : (
              <Button onClick={handleStopWorkout} variant="danger">
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            )}
            {isTracking && (
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Clock className="h-5 w-5" />
                {formatTime(elapsedTime)}
              </div>
            )}
          </div>

          {location.latitude && location.longitude && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <MapPin className="h-4 w-4" />
              Location tracked: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Exercises</h2>
          <Button onClick={() => setShowExerciseSelector(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </CardHeader>
        <CardBody>
          {exercises.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No exercises added yet. Click "Add Exercise" to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {exercises.map((ex, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {ex.exercise?.name || 'Exercise'}
                      </h3>
                      {ex.exercise?.muscle_group && (
                        <p className="text-sm text-gray-500">
                          {ex.exercise.muscle_group}
                          {ex.exercise.equipment && ` • ${ex.exercise.equipment}`}
                        </p>
                      )}
                      {ex.exercise?.instructions && ex.exercise.instructions.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">Instructions:</p>
                          <ol className="list-decimal list-inside space-y-1 mt-1">
                            {ex.exercise.instructions.map((instruction, i) => (
                              <li key={i}>{instruction}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Sets"
                      type="number"
                      value={ex.sets}
                      onChange={(e) =>
                        handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 0)
                      }
                      min={1}
                    />
                    <Input
                      label="Reps"
                      type="number"
                      value={ex.reps || ''}
                      onChange={(e) =>
                        handleUpdateExercise(
                          index,
                          'reps',
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      min={1}
                    />
                    <Input
                      label="Weight (lbs)"
                      type="number"
                      value={ex.weight || ''}
                      onChange={(e) =>
                        handleUpdateExercise(
                          index,
                          'weight',
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      step={2.5}
                    />
                  </div>

                  <Input
                    label="Notes (optional)"
                    value={ex.notes}
                    onChange={(e) => handleUpdateExercise(index, 'notes', e.target.value)}
                    placeholder="Felt easy, increase weight next time"
                  />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {exercises.length > 0 && (
        <Button
          onClick={handleSaveWorkout}
          disabled={saving}
          size="lg"
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Workout'}
        </Button>
      )}

      {showExerciseSelector && (
        <ExerciseSelector
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </div>
  )
}
