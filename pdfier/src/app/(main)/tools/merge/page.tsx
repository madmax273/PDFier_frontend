"use client";

import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import {
    Home, ChevronRight, FilePlus, Cloud, HardDrive, Box as Dropbox, 
    CheckCircle, FileText, XCircle, ArrowUp, ArrowDown, Layers,
    Box
  } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore'; // Import Zustand store
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/ui/toast';
import { motion, Variants } from 'framer-motion';

// Define a type for the PDF file object
interface PdfFile {
  id: string; // Unique ID for keying in React (using Object URL for simplicity)
  file: File; // The actual File object
  name: string;
  size: string; // Formatted size (e.g., "1.2 MB")
}

export default function MergePDFPage() {
  const { updateUserUsage} = useAuthStore();
  const {user} = useAuthStore();
  const {updateGuestUsage} = useAuthStore();
  const [selectedFiles, setSelectedFiles] = useState<PdfFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<{ download_url: string} | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const router = useRouter();
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Callback to add files from various sources (drag/drop, input)
  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newPdfs: PdfFile[] = Array.from(files)
      .filter(file => file.type === 'application/pdf') // Ensure only PDFs are added
      .map(file => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`, // More robust unique ID
        file: file,
        name: file.name,
        size: formatFileSize(file.size),
      }));

    setSelectedFiles(prev => [...prev, ...newPdfs]);
  }, []);

  // Handle file selection from the hidden input
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    setShowDropdown(false); // Close dropdown after selection
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear input value to allow re-selection of same file
    }
  };

  // Drag and Drop Handlers
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    addFiles(event.dataTransfer.files);
    console.log("Drop");
  }, [addFiles]);
   
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
    console.log("Drag over");
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
    console.log("Drag leave");
  }, []);
   
  // Remove a file from the list
  const removeFile = (idToRemove: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== idToRemove));
  };

  // Reorder files in the list
  const moveFile = (idToMove: string, direction: 'up' | 'down') => {
    setSelectedFiles(prevFiles => {
      const index = prevFiles.findIndex(file => file.id === idToMove);
      if (index === -1) return prevFiles;

      const newFiles = [...prevFiles];
      if (direction === 'up' && index > 0) {
        [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      }
      return newFiles;
    });
  };

  // Handle the actual PDF merge operation
  const handleMergePdfs = async () => {
    if (selectedFiles.length < 2) {
      setToast({ message: 'Please select at least two PDF files to merge.', type: 'error' });
      return;
    }

    setIsMerging(true);
    

    const formData = new FormData();
    selectedFiles.forEach((pdfFile) => {
      formData.append('files', pdfFile.file, pdfFile.name);
    });

    try {
      // Check if backend URL is set
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        throw new Error('Backend URL is not configured. Please check your environment variables.');
      }

      if(user && user.plan_type === 'guest'){
        console.log('Current guest usage:', user.usage_metrics.pdf_processed_today);
        if(user.usage_metrics.pdf_processed_today >= user.usage_metrics.pdf_processed_limit_daily){
          setToast({ message: `You have exceeded the daily limit of ${user.usage_metrics.pdf_processed_limit_daily} PDF files to merge.`, type: 'error' });
          return;
        } else {
          const newCount = user.usage_metrics.pdf_processed_today + 1;
          console.log('Updating to:', newCount);
          updateGuestUsage(newCount);
          console.log('Guest usage after update:', user.usage_metrics.pdf_processed_today);
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tools/pdf/merge`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${Cookies.get('accessToken')}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        setMergedPdfUrl({download_url: responseData.download_url});
        console.log("Merged PDF URL:", responseData.download_url); // or signedUrl
        if(responseData.user_usage){
          updateUserUsage(responseData.user_usage);
        }
        setToast({ message: 'PDFs merged successfully!', type: 'success' });
          
          // mergeMessage && (
          //   <div className={`p-3 mb-4 rounded-lg text-sm inline-block
          //     ${mergeMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          //     {mergeMessage.text}
          //   </div>
          // )
          const mergeURL=encodeURIComponent(responseData.download_url);
          router.push(`/tools/merge/download?url=${mergeURL}&fileSize`);
        
      } 
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setToast({ message: 'Network error or unable to connect to the server.', type: 'error' });
    } finally {
      setIsMerging(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
      
      {/* Breadcrumbs */}
      <nav className="text-sm font-medium text-muted-foreground mb-6 flex items-center space-x-2 max-w-4xl mx-auto">
        <Link href="/" className="hover:text-foreground transition-colors">
          <Home size={16} />
        </Link>
        <ChevronRight size={16} />
        <Link href="/tools" className="hover:text-foreground transition-colors">
          Tools
        </Link>
        <ChevronRight size={16} />
        <span className="text-foreground">Merge PDF</span>
      </nav>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-foreground mb-2 sm:text-4xl tracking-tight">Merge PDF</h1>
          <p className="text-muted-foreground text-lg">Combine multiple PDF files into a single, unified document</p>
        </motion.div>

        <div className="space-y-8">
          {/* Main Upload Area */}
          <motion.section
            variants={itemVariants}
            className={`glass-panel border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300 relative overflow-hidden cursor-pointer ${
              isDragOver ? 'border-primary bg-primary/10 scale-105' : 'border-primary/30 hover:border-primary/60'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center py-6">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-inner border border-primary/20 mb-6">
                <Layers className="h-10 w-10 text-primary" />
              </div>
              
              <p className="text-xl text-foreground font-bold mb-2 tracking-tight">Drag & Drop PDFs Here</p>
              <p className="text-muted-foreground font-medium mb-8">or</p>

              {/* Choose Files Button with Dropdown */}
              <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl shadow-lg px-8 py-4 bg-primary text-lg font-bold text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <FilePlus size={22} className="mr-3" />
                  Choose Files
                  <ChevronRight size={18} className={`ml-3 transition-transform duration-200 ${showDropdown ? 'rotate-90' : ''}`} />
                </button>

                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="origin-top mt-4 w-64 rounded-xl shadow-2xl bg-card border border-border/50 ring-1 ring-black ring-opacity-5 focus:outline-none absolute z-20 left-1/2 -translate-x-1/2 overflow-hidden"
                  >
                    <div className="py-2" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <button
                        className="flex items-center w-full px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <HardDrive size={20} className="mr-3 text-primary" /> From device
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          multiple
                          accept="application/pdf"
                          onChange={(e) => {
                            handleFileSelect(e);
                            setShowDropdown(false);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </button>
                      <a
                        href="#"
                        className="flex items-center w-full px-5 py-3 text-sm font-semibold text-muted-foreground opacity-50 cursor-not-allowed border-t border-border/50"
                        role="menuitem"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Cloud size={20} className="mr-3 text-muted-foreground" /> Smallpdf <span className="ml-auto text-yellow-600 text-xs font-bold px-2 py-0.5 rounded-md bg-yellow-500/20">PRO</span>
                      </a>
                      <a
                        href="#"
                        className="flex items-center w-full px-5 py-3 text-sm font-semibold text-muted-foreground opacity-50 cursor-not-allowed border-t border-border/50"
                        role="menuitem"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Dropbox size={20} className="mr-3 text-muted-foreground" /> Dropbox
                      </a>
                      <a
                        href="#"
                        className="flex items-center w-full px-5 py-3 text-sm font-semibold text-muted-foreground opacity-50 cursor-not-allowed border-t border-border/50"
                        role="menuitem"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Box size={20} className="mr-3 text-muted-foreground" /> Google Drive
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <motion.section variants={itemVariants} className="bg-card rounded-3xl shadow-xl p-8 border border-border/50 glass-panel">
              <h2 className="text-2xl font-bold text-foreground mb-6">Files to Merge ({selectedFiles.length})</h2>
              <ul className="space-y-4">
                {selectedFiles.map((file, index) => (
                  <motion.li 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={file.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-background p-5 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors shadow-sm gap-4"
                  >
                    <div className="flex items-center space-x-4 flex-grow w-full">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <FileText size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block font-bold text-foreground truncate text-base mb-1">{file.name}</span>
                        <span className="block text-sm text-muted-foreground font-medium">{file.size}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 w-full sm:w-auto sm:ml-4 bg-secondary/50 p-1 rounded-xl">
                      <button
                        onClick={() => moveFile(file.id, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-lg hover:bg-background hover:shadow disabled:opacity-30 disabled:hover:shadow-none transition-all"
                        aria-label="Move file up"
                      >
                        <ArrowUp size={20} className="text-foreground" />
                      </button>
                      <button
                        onClick={() => moveFile(file.id, 'down')}
                        disabled={index === selectedFiles.length - 1}
                        className="p-2 rounded-lg hover:bg-background hover:shadow disabled:opacity-30 disabled:hover:shadow-none transition-all"
                        aria-label="Move file down"
                      >
                        <ArrowDown size={20} className="text-foreground" />
                      </button>
                      <div className="w-px h-6 bg-border/50 mx-1"></div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        aria-label="Remove file"
                      >
                        <XCircle size={20} className="text-destructive" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm font-medium text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                  Drag files to reorder or use the arrows.
                </p>
                <button
                  onClick={handleMergePdfs}
                  disabled={selectedFiles.length < 2 || isMerging}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl shadow-lg px-10 py-4 bg-primary text-lg font-bold text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {isMerging ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Merging...
                    </>
                  ) : (
                    <>
                      <Layers size={22} className="mr-3" />
                      Merge PDFs
                    </>
                  )}
                </button>
              </div>
            </motion.section>
          )}
        </div>
      </motion.div>

      {/* Features List */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 bg-card rounded-3xl shadow-xl p-8 sm:p-12 border border-border/50 max-w-5xl mx-auto glass-panel"
      >
        <h2 className="text-3xl font-extrabold text-foreground mb-8 text-center tracking-tight">Why sequence PDFs with us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Flawless Integration</h3>
              <p className="text-muted-foreground leading-relaxed">Combine invoices, reports, and manuals seamlessly. The text, fonts, and layouts stay perfectly intact.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Visual Reordering</h3>
              <p className="text-muted-foreground leading-relaxed">Intuitve drag-and-drop hierarchy lets you quickly establish the flow of pages before locking them in.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Massive File Support</h3>
              <p className="text-muted-foreground leading-relaxed">Join together hundreds of pages from several massive files. Our cloud rendering handles the heavy lifting.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Instant Auto-Delete</h3>
              <p className="text-muted-foreground leading-relaxed">Your files are temporary. After merging and downloading, we automatically purge all data from our active nodes.</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
