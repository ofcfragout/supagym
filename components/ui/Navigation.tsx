'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Dumbbell, Users, User, LogOut, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from './Button'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Feed' },
    { href: '/dashboard/workout', icon: Dumbbell, label: 'Workout' },
    { href: '/dashboard/leaderboard', icon: TrendingUp, label: 'Compete' },
    { href: '/dashboard/social', icon: Users, label: 'Social' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SupaGym</span>
          </Link>
        </div>

        <div className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SupaGym</span>
          </Link>
          <Button onClick={handleLogout} variant="ghost" size="sm">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
    </>
  )
}
