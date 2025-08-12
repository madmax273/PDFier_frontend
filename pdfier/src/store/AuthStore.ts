import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UsageMetrics,AuthUser,User,GuestUser, } from '@/types/auth';
import Cookies from 'js-cookie';
import router from 'next/router';


type AuthState = {
  isLoggedIn: boolean;
  refreshToken: string | null;
  accessToken: string | null;
  user: AuthUser;
  isInitializing: boolean;
  isSidebarCollapsed: boolean;
};


interface AuthActions {
  initializeAuth: () => Promise<void>; // To check session on app load
  login: (userData: User, refreshToken: string,accessToken:string) => void; // Called by login page
  logout: () => Promise<void>; // Handles logging out
  updateUserUsage: (newUsage: UsageMetrics) => void; // To update usage after an operation
  updateGuestUsage: (processedToday: number) => void; // To update usage after an operation
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Default guest user object (matching GuestUser interface)
const defaultGuestUser: GuestUser = {
  id: 'guest',
  name: 'Guest',
  email: 'guest@example.com',
  verified: false,
  plan_type: 'guest',
  usage_metrics: {
    pdf_processed_today: 0,
    pdf_processed_limit_daily: 10, // Example guest limits
  },
};


export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      refreshToken: null,
      accessToken: null,
      user: null,
      isInitializing: false,
      isSidebarCollapsed: true,
      initializeAuth: async () => {
        set({ isInitializing: true });
        try {
          const accessToken = Cookies.get('accessToken');
          const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const userData: User = await response.json();
            set({ user: userData, isLoggedIn: true });
          } 
          else if (response.status === 401) {
            console.log("Access token is invalid or has expired. fetching new access token.");
            const refreshToken = Cookies.get('refreshToken');
            console.log("Refresh token from cookies {"+refreshToken+"}");
            if (refreshToken) {

              const refreshResponse = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token:refreshToken }),
                credentials: 'include',
              });

              if (refreshResponse.ok) {
                console.log("Refresh token is valid. fetching new access token.");
                const data = await refreshResponse.json();
                Cookies.set('accessToken', data.access_token, {
                  expires: 420,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'Lax',
                });
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              } else {
                console.warn("Refresh token is invalid or has expired. Setting user as guest.");
                set({ user: defaultGuestUser, isLoggedIn: false });
                get().logout();
                router.push('/login');


              }
            } 
            else {
              console.warn("No active session found or token expired. Setting user as guest.");
              set({ user: defaultGuestUser, isLoggedIn: false });
              get().logout();
            }
          } else {
            console.error("Error during initial auth check:", response);
            set({ user: defaultGuestUser, isLoggedIn: false });
            get().logout();
          }
        }
        catch (error) {
          console.error("Error during initial auth check:", error);
          set({ user: defaultGuestUser, isLoggedIn: false });
          get().logout();
        }
        set({ isInitializing: false });
      },

      login: (userData: User, refreshToken: string,accessToken:string) => {
        Cookies.set('refreshToken', refreshToken, {
          expires: 4320,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
        });
        Cookies.set('accessToken', accessToken, {
          expires: 420,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
        });
        
        
        
        
        set({ user: userData, isLoggedIn: true, refreshToken,accessToken });

      },

      logout: async () => {
        Cookies.remove('refreshToken');
        Cookies.remove('accessToken');
        set({ user: defaultGuestUser, isLoggedIn: false, refreshToken: null,accessToken:null });
      },

      updateUserUsage: (newUsage: UsageMetrics) => {
        set((state) => {
          if (state.user && state.user.plan_type !== 'guest') {
            return {
              user: {
                ...(state.user as User),
                usage_metrics: newUsage,
                updated_at: new Date().toISOString(),
              },
            };
          }
          return state;
        });
      },
    // In AuthStore.ts
    updateGuestUsage: (processedToday: number) => {
      console.log('Updating guest usage:', processedToday);
      set((state) => {
        if (state.user && state.user.plan_type === 'guest') {
          const newState = {
            ...state,
            user: {
              ...state.user,
              usage_metrics: {
                ...state.user.usage_metrics,
                pdf_processed_today: processedToday
              }
            }
          };
          console.log('New state:', newState);
          return newState;
        }
        console.log('Not a guest user');
        return state;
      });
    }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const partial = {
          refreshToken: state.refreshToken,
          isLoggedIn: state.isLoggedIn,
          user: state.user,
          isInitializing: state.isInitializing,
        };
        return partial;
      },
      onRehydrateStorage: () => {
        console.log('hydration starts');
        return (state, error) => {
          if (error) {
            console.error('❌ Hydration error', error);
          } else {
            console.log('✅ Hydration complete:', state);
          }
        };
      }

    }
  )
);
