'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Users, UserPlus, UserMinus, Search } from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  isFollowing: boolean
  followerCount: number
  followingCount: number
}

export default function SocialView({ userId }: { userId: string }) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'discover' | 'following' | 'followers'>('discover')
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    filterUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, users])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query = supabase.from('profiles').select('id, username, full_name, bio')

      if (activeTab === 'following') {
        // Get users that current user is following
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)

        const followingIds = following?.map((f) => f.following_id) || []
        if (followingIds.length > 0) {
          query = query.in('id', followingIds)
        } else {
          setUsers([])
          setFilteredUsers([])
          setLoading(false)
          return
        }
      } else if (activeTab === 'followers') {
        // Get users that follow the current user
        const { data: followers } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', userId)

        const followerIds = followers?.map((f) => f.follower_id) || []
        if (followerIds.length > 0) {
          query = query.in('id', followerIds)
        } else {
          setUsers([])
          setFilteredUsers([])
          setLoading(false)
          return
        }
      }

      const { data: profiles } = await query.neq('id', userId)

      if (!profiles) {
        setUsers([])
        setFilteredUsers([])
        setLoading(false)
        return
      }

      // Get follow status for each user
      const { data: myFollows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)

      const followingIds = new Set(myFollows?.map((f) => f.following_id) || [])

      // Get follower/following counts for each user
      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const { count: followerCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profile.id)

          const { count: followingCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', profile.id)

          return {
            ...profile,
            isFollowing: followingIds.has(profile.id),
            followerCount: followerCount || 0,
            followingCount: followingCount || 0,
          }
        })
      )

      setUsers(usersWithStats)
      setFilteredUsers(usersWithStats)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const handleFollow = async (targetUserId: string) => {
    try {
      const user = users.find((u) => u.id === targetUserId)
      if (!user) return

      if (user.isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', targetUserId)
      } else {
        await supabase.from('follows').insert({
          follower_id: userId,
          following_id: targetUserId,
        })
      }

      fetchUsers()
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'discover'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="h-4 w-4" />
              Discover
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'following'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Following
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'followers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="h-4 w-4" />
              Followers
            </button>
          </div>
        </CardHeader>

        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </div>

        <CardBody>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'following' && 'You are not following anyone yet.'}
              {activeTab === 'followers' && 'No followers yet.'}
              {activeTab === 'discover' && 'No users found.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user.username[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-gray-600 mt-1 truncate">{user.bio}</p>
                    )}
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>{user.followerCount} followers</span>
                      <span>{user.followingCount} following</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={user.isFollowing ? 'outline' : 'primary'}
                    onClick={() => handleFollow(user.id)}
                  >
                    {user.isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
