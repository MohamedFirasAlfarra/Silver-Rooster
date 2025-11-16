import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { supabase } from './lib/supabaseClient';
import { useAuthStore } from './stores/useAuthStore';

async function initAuthListener() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    const setUser = useAuthStore.getState().setUser;

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        role: profile?.role ?? "user",
      });

    } else {
      setUser(null);
    }
  });
}

initAuthListener();

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
