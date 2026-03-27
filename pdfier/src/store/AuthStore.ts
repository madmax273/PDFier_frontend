import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UsageMetrics,AuthUser,User,GuestUser, } from '@/types/auth';
import Cookies from 'js-cookie';
import { useDocumentStore } from './DocumentStore';
import { useConversationStore } from './ConversationStore';
import { useFileStore } from './FileStore';

type AuthState = {
  isLoggedIn: boolean;
  refreshToken: string | null;
  accessToken: string | null;
  user: AuthUser;
  isInitializing: boolean;
  isSidebarCollapsed: boolean;
};

interface AuthActions {
  initializeAuth: () => Promise<void>; 
  login: (userData: User, refreshToken: string,accessToken:string) => void; 
  logout: () => Promise<void>; 
  updateUserUsage: (newUsage: UsageMetrics) => void; 
  updateGuestUsage: (processedToday: number) => void; 
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Default guest user object (matching GuestUser interface)
const defaultGuestUser: GuestUser = {
  id: 'guest',
  name: 'Guest',
  email: 'guest@example.com',
  verified: false,
  plan_type: 'guest',
  usage_metrics: {
    pdf_processed_today: 0,
    pdf_processed_limit_daily: 10, 
  },
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      refreshToken: null,
      accessToken: null,
      user: null,
      isInitializing: true,
      isSidebarCollapsed: true,
      initializeAuth: async () => {
        set({ isInitializing: true });
        try {
          const accessToken = Cookies.get('accessToken');
          const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          });

          if (response.ok) {
            const apiResponse = await response.json();
            // Extract actual user data from the data field
            const userData: User = apiResponse.data || apiResponse;
            set({ user: userData, isLoggedIn: true });
          } 
          else if (response.status === 401) {
            const refreshToken = Cookies.get('refreshToken');
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
                const data = await refreshResponse.json();
                Cookies.set('accessToken', data.access_token, {
                  expires: 420,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'Lax',
                  path: '/',
                });
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              } else {
                set({ user: defaultGuestUser, isLoggedIn: false });
                get().logout();
                if (typeof window !== 'undefined') window.location.href = '/login';
              }
            } else {
              set({ user: defaultGuestUser, isLoggedIn: false });
              get().logout();
            }
          } else {
            set({ user: defaultGuestUser, isLoggedIn: false });
            get().logout();
          }
        }
        catch (error) {
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
          path: '/',
        });
        Cookies.set('accessToken', accessToken, {
          expires: 420,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          path: '/',
        });
        
        // Clear previous user data and set new user
        const documentStore = useDocumentStore.getState();
        const conversationStore = useConversationStore.getState();
        const fileStore = useFileStore.getState();
        
        // Check if user changed
        if (documentStore.userId !== userData.id) {
          documentStore.clearDocuments();
          documentStore.setUserId(userData.id);
        }
        if (conversationStore.userId !== userData.id) {
          conversationStore.clearConversations();
          conversationStore.setUserId(userData.id);
        }
        if (fileStore.userId !== userData.id) {
          fileStore.clearFiles();
          fileStore.setUserId(userData.id);
        }
        
        set({ user: userData, isLoggedIn: true, refreshToken,accessToken });

      },

      logout: async () => {
        Cookies.remove('refreshToken', { path: '/' });
        Cookies.remove('accessToken', { path: '/' });
        
        // Clear all user data from stores
        const documentStore = useDocumentStore.getState();
        const conversationStore = useConversationStore.getState();
        const fileStore = useFileStore.getState();
        
        documentStore.clearDocuments();
        documentStore.setUserId(null);
        conversationStore.clearConversations();
        conversationStore.setUserId(null);
        fileStore.clearFiles();
        fileStore.setUserId(null);
        
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
