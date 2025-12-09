import Link from 'next/link'
import { Dumbbell, Users, Trophy, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">SupaGym</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Track. Compete. Achieve.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The modern gym app that combines workout tracking with social features.
            Track your progress, compete with friends, and reach your fitness goals.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="primary">Start Your Journey</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Dumbbell className="h-10 w-10 text-blue-600" />}
            title="Track Workouts"
            description="Log your exercises with detailed stats, sets, reps, and weights. View exercise demonstrations."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-blue-600" />}
            title="Social Feed"
            description="Share workouts with friends, follow other athletes, and stay motivated together."
          />
          <FeatureCard
            icon={<Trophy className="h-10 w-10 text-blue-600" />}
            title="Compete"
            description="Challenge friends, climb leaderboards, and compete in fitness challenges."
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-blue-600" />}
            title="Track Progress"
            description="Monitor your performance with detailed analytics and time-based statistics."
          />
        </div>
      </section>

      {/* Privacy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-blue-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Your Privacy Matters</h2>
          <p className="text-xl mb-6 opacity-90">
            Control who sees your workouts. Make them public, keep them private, or share with specific friends.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">Join Now</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6" />
              <span className="text-xl font-bold">SupaGym</span>
            </div>
            <p className="text-gray-400">© 2024 SupaGym. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
