// src/store/FileStore.ts
import { create } from 'zustand';

type FileWithPreview = {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
};

type FileStore = {
  files: FileWithPreview[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setFiles: (files: FileWithPreview[]) => void;
};

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  
  addFiles: (newFiles) =>
    set((state) => {
      const filesToAdd = newFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      return {
        files: [...state.files, ...filesToAdd],
      };
    }),

  removeFile: (id) =>
    set((state) => {
      const fileToRemove = state.files.find((f) => f.id === id);
      return {
        files: state.files.filter((file) => file.id !== id),
      };
    }),

  clearFiles: () =>
    set((state) => {
      return { files: [] };
    }),
  setFiles: (files) => set({ files }),
}));