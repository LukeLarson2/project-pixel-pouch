'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './style.css'


export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  const supabase = createClientComponentClient();

  return (
    <main >
      Home
    </main>
  )
}
