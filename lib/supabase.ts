import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'operative' | 'director'
  created_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)

      setUnreadCount(count || 0)
    }

    fetchUnread()

    // Real-time updates for new messages
    const setupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('unread-messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const msg = payload.new as Message
            if (msg.receiver_id === user.id) {
              setUnreadCount((prev) => prev + 1)
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages' },
          () => { fetchUnread() }
        )
        .subscribe()

      return channel
    }

    let channel: ReturnType<typeof supabase.channel> | undefined
    setupChannel().then((c) => { channel = c })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return unreadCount
}
