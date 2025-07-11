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
};

interface AuthActions {
  initializeAuth: () => Promise<void>; // To check session on app load
  login: (userData: User, refreshToken: string,accessToken:string) => void; // Called by login page
  logout: () => Promise<void>; // Handles logging out
  updateUserUsage: (newUsage: UsageMetrics) => void; // To update usage after an operation
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
    pdf_processed_limit_daily: 2, // Example guest limits
    rag_queries_limit_monthly: 3,
    rag_indexed_documents_limit: 1,
    word_conversions_limit_daily: 0, 
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
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ refresh_token: refreshToken }),
              });

              if (refreshResponse.ok) {
                console.log("Refresh token is valid. fetching new access token.");
                const { access_token: newAccessToken } = await refreshResponse.json();
                Cookies.set('accessToken', newAccessToken, {
                  expires: 30,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'Lax',
                });
                router.replace(router.asPath); // Redirect to current page after setting new access token
              } else {
                console.warn("Refresh token is invalid or has expired. Setting user as guest.");
                set({ user: defaultGuestUser, isLoggedIn: false });
                get().logout();

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
          expires: 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
        });
        
        
        
        
        set({ user: userData, isLoggedIn: true, refreshToken,accessToken });
        console.log("Setting user state");
        console.log(get().isLoggedIn);
        console.log(get().refreshToken);
        console.log(get().user);

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
