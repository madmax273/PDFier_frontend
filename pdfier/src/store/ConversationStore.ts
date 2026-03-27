import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Conversation } from '@/services/conversations';

export type ConversationState = {
  selectedConversation: Conversation | null;
  conversations: Conversation[];
  userId: string | null;
};

export type ConversationActions = {
  setSelectedConversation: (conv: Conversation | null) => void;
  setConversations: (list: Conversation[]) => void;
  clearConversations: () => void;
  setUserId: (userId: string | null) => void;
};

export const useConversationStore = create<ConversationState & ConversationActions>()(
  persist(
    (set) => ({
      selectedConversation: null,
      conversations: [],
      userId: null,
      setSelectedConversation: (conv) => set({ selectedConversation: conv }),
      setConversations: (list) =>
        set({ conversations: Array.isArray(list) ? (list as Conversation[]) : [] }),
      clearConversations: () => set({ conversations: [], selectedConversation: null }),
      setUserId: (userId) => set({ userId }),
    }),
    {
      name: 'conversation-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        selectedConversation: state.selectedConversation,
        userId: state.userId,
      }),
    }
  )
);
