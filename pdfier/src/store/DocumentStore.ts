import { create } from 'zustand';
import { DocumentItem } from '@/services/documents';

export type DocumentState = {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
};

export type DocumentActions = {
  setDocuments: (docs: DocumentItem[]) => void;
  setSelectedDocument: (doc: DocumentItem | null) => void;
};

export const useDocumentStore = create<DocumentState & DocumentActions>((set) => ({
  documents: [],
  selectedDocument: null,
  setDocuments: (docs) => set({ documents: Array.isArray(docs) ? docs : [] }),
  setSelectedDocument: (doc) => set({ selectedDocument: doc }),
}));
