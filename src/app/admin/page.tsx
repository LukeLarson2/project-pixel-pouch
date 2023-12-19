'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Note: Use 'next/router' instead of 'next/navigation'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Admin() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const session = await supabase.auth.getSession();

      if (!session.data.session) {
        // If there's no session, redirect to login or home page
        router.replace('/login');
        return;
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('admin')
        .eq('email', session.data.session.user.email)
        .single();

      if (error || !user || !user.admin) {
        // If there's an error, or user is not admin, redirect to not allowed page
        router.replace('/not-allowed');
      }
      setIsLoading(false)
      setIsAdmin(true)
    };

    checkAdmin();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      Admin
    </div>
  )
}
