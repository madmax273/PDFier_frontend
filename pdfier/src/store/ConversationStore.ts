import { create } from 'zustand';
import { Conversation } from '@/services/conversations';

export type ConversationState = {
  selectedConversation: Conversation | null;
  conversations: Conversation[];
};

export type ConversationActions = {
  setSelectedConversation: (conv: Conversation | null) => void;
  setConversations: (list: Conversation[]) => void;
};

export const useConversationStore = create<ConversationState & ConversationActions>((set) => ({
  selectedConversation: null,
  conversations: [],
  setSelectedConversation: (conv) => set({ selectedConversation: conv }),
  setConversations: (list) =>
    set({ conversations: Array.isArray(list) ? (list as Conversation[]) : [] }),
}));
