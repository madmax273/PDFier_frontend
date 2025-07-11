// components/ClientAuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/AuthStore';

const ClientAuthInitializer = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, [initializeAuth]);


  return null; // no UI, just initializes auth
};

export default ClientAuthInitializer;
