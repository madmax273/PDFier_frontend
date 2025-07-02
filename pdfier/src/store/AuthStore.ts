import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: string;
  email: string;
  username: string;
  // Add other user fields as needed
};

type AuthState = {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      token: null,
      login: (token) => set({ 
        isLoggedIn: true, 
        token:token 
      }),
      logout: () => set({ 
        isLoggedIn: false, 
        token: null 
      }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      onRehydrateStorage: () => {
        console.log('hydration starts');
        return (state, error) => {
          if (error) {
            console.error('an error happened during hydration', error);
          } else {
            console.log('hydration finished', state);
          }
        };
      }
    }
  )
);
