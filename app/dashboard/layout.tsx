import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_active, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile && profile.is_active === false) {
    await supabase.auth.signOut()
    redirect('/login?deactivated=1')
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userEmail={user.email ?? ''} isAdmin={isAdmin} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}