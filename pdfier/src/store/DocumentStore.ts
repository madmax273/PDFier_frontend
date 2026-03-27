import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DocumentItem } from '@/services/documents';

export type DocumentState = {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  userId: string | null;
};

export type DocumentActions = {
  setDocuments: (docs: DocumentItem[]) => void;
  setSelectedDocument: (doc: DocumentItem | null) => void;
  clearDocuments: () => void;
  setUserId: (userId: string | null) => void;
};

export const useDocumentStore = create<DocumentState & DocumentActions>()(
  persist(
    (set) => ({
      documents: [],
      selectedDocument: null,
      userId: null,
      setDocuments: (docs) => set({ documents: Array.isArray(docs) ? docs : [] }),
      setSelectedDocument: (doc) => set({ selectedDocument: doc }),
      clearDocuments: () => set({ documents: [], selectedDocument: null }),
      setUserId: (userId) => set({ userId }),
    }),
    {
      name: 'document-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        documents: state.documents,
        selectedDocument: state.selectedDocument,
        userId: state.userId,
      }),
    }
  )
);
