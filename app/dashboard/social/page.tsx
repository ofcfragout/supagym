import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SocialView from '@/components/social/SocialView'

export default async function SocialPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Social</h1>
        <p className="text-gray-600 mt-1">Connect with other athletes</p>
      </div>

      <SocialView userId={user.id} />
    </div>
  )
}
