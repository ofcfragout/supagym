'use client'

import { useState, useEffect } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    let mounted = true

    const checkGeolocation = () => {
      if (!navigator.geolocation) {
        if (mounted) {
          setLocation({
            latitude: null,
            longitude: null,
            error: 'Geolocation is not supported by your browser',
            loading: false,
          })
        }
        return
      }

      const handleSuccess = (position: GeolocationPosition) => {
        if (mounted) {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
            loading: false,
          })
        }
      }

      const handleError = (error: GeolocationPositionError) => {
        if (mounted) {
          setLocation({
            latitude: null,
            longitude: null,
            error: error.message,
            loading: false,
          })
        }
      }

      navigator.geolocation.getCurrentPosition(handleSuccess, handleError)
    }

    checkGeolocation()

    return () => {
      mounted = false
    }
  }, [])

  return location
}
