import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Login from './Login';
import Dashboard from './Dashboard'; // <-- Importamos tu nuevo panel

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 animate-pulse">Carregant el portal digital...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/inventari" /> : <Login />} />
        <Route path="/inventari" element={session ? <Dashboard session={session} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}