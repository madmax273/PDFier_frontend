import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';

export const useAuth = (required = true) => {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);  

  useEffect(() => {
    if (required && !isLoggedIn) {
      router.push('/login');
    } else if (!required && isLoggedIn) {
      router.push('/dashboard');
    } else {
      setIsAuthorized(true);
    }
  }, [isLoggedIn, required, router]);

  return { isAuthorized };
};
