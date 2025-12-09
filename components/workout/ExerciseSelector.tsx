'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Search } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_group: string
  equipment: string | null
  difficulty: string | null
  instructions: string[] | null
}

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export default function ExerciseSelector({ onSelect, onClose }: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    filterExercises()
  }, [searchTerm, selectedMuscleGroup, exercises])

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

      if (error) throw error

      setExercises(data || [])
      setFilteredExercises(data || [])
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterExercises = () => {
    let filtered = exercises

    if (searchTerm) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter((ex) => ex.muscle_group === selectedMuscleGroup)
    }

    setFilteredExercises(filtered)
  }

  const muscleGroups = ['all', ...Array.from(new Set(exercises.map((ex) => ex.muscle_group)))]

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex justify-between items-center border-b">
          <h2 className="text-2xl font-semibold">Select Exercise</h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <div className="p-4 border-b space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exercises..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {muscleGroups.map((group) => (
              <Button
                key={group}
                size="sm"
                variant={selectedMuscleGroup === group ? 'primary' : 'outline'}
                onClick={() => setSelectedMuscleGroup(group)}
              >
                {group === 'all' ? 'All' : group}
              </Button>
            ))}
          </div>
        </div>

        <CardBody className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No exercises found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                  onClick={() => onSelect(exercise)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">
                          {exercise.muscle_group}
                        </span>
                        {exercise.equipment && (
                          <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-700">
                            {exercise.equipment}
                          </span>
                        )}
                        {exercise.difficulty && (
                          <span
                            className={`text-sm px-2 py-1 rounded ${getDifficultyColor(
                              exercise.difficulty
                            )}`}
                          >
                            {exercise.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {exercise.description && (
                    <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                  )}
                  {exercise.instructions && exercise.instructions.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">How to perform:</p>
                      <ol className="list-decimal list-inside space-y-1 mt-1">
                        {exercise.instructions.slice(0, 2).map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                        {exercise.instructions.length > 2 && (
                          <li className="text-gray-500">
                            +{exercise.instructions.length - 2} more steps
                          </li>
                        )}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
