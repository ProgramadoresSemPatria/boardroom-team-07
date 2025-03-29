import { useEffect, useState } from 'react'
import './App.css'
import Auth from './components/Auth'
import { supabase } from './lib/supabaseClient'
import { Session } from '@supabase/supabase-js'
import Main from './components/Main'
import { Layout } from './components/Layout'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EditMembers from './components/EditMembers'

function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return (
      <>
        <Auth />
      </>
    )
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Main userId={session.user.id} />} />
          <Route path="/members" element={<EditMembers userId={session.user.id} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App;