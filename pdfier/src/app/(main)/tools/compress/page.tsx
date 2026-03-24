// src/app/(main)/tools/compress/page.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/FileStore';
import { useAuthStore } from '@/store/AuthStore';
import Cookies from 'js-cookie';
import { Toast } from '@/components/ui/toast';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

export default function CompressPDFPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isCompressing, setIsCompressing] = useState(false);
  const { files, addFiles, removeFile, clearFiles } = useFileStore();
  const router = useRouter();
  const {user,updateGuestUsage,updateUserUsage} = useAuthStore();
  const [downloadUrl, setDownloadUrl] = useState<{ download_urls: string[] } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf'
    );
    addFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => 
        file.type === 'application/pdf'
      );
      addFiles(selectedFiles);
    }
  };

  const handleCompress = async () => {
    if (files.length === 0) return;

    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      throw new Error('Backend URL is not configured. Please check your environment variables.');
    }

    if(user && user.plan_type === 'guest'){
      console.log('Current guest usage:', user.usage_metrics.pdf_processed_today);
      if(user.usage_metrics.pdf_processed_today >= user.usage_metrics.pdf_processed_limit_daily){
        alert(`You have exceeded the daily limit of ${user.usage_metrics.pdf_processed_limit_daily} PDF files to compress.`);
        return;
      } else {
        const newCount = user.usage_metrics.pdf_processed_today + 1;
        console.log('Updating to:', newCount);
        updateGuestUsage(newCount);
        console.log('Guest usage after update:', user.usage_metrics.pdf_processed_today);
      }
    }
    
    setIsCompressing(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file.file));
      formData.append('compression_level', compressionLevel);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tools/pdf/compress`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
      });

      if(response.ok){
        const responseData = await response.json();
        setDownloadUrl(responseData.download_urls);
        // console.log("Compressed PDF URL:", downloadUrl); // This console.log will show the *previous* state of downloadUrl, it's asynchronous. If you want to see the new value, log responseData.download_urls
        if(responseData.user_usage){
            updateUserUsage(responseData.user_usage);
        }
        setToast({ message: 'PDF compressed successfully!', type: 'success' });
        const params = new URLSearchParams();
        responseData.download_urls.forEach((urlObj: string) => {
            params.append('url', urlObj);
        });
        console.log("Query string to push:", params.toString());
        
        router.push(`/tools/compress/download?${params.toString()}`);
        
        clearFiles();
    }
      else{
        console.log('Compression failed!');
        setToast({ message: 'Compression failed!', type: 'error' });
      }
    } catch (error) {
      console.error('Compression error:', error);
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
        <span className="text-foreground">Compress PDF</span>
      </nav>
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
        
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-foreground mb-2 sm:text-4xl tracking-tight">Compress PDF</h1>
          <p className="text-muted-foreground text-lg">Reduce file size while maintaining excellent quality</p>
        </motion.div>
        
        <div className="space-y-8">
          {/* File Upload Area */}
          <motion.div
            variants={itemVariants}
            className={`glass-panel border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragging ? 'border-primary bg-primary/10 scale-105' : 'border-primary/30 hover:border-primary/60'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-inner border border-primary/20">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg text-foreground font-semibold">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer text-primary hover:text-primary/80 transition-colors focus-within:outline-none"
                  >
                    <span>Click to upload</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      multiple
                      onChange={handleFileInput}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>{' '}
                  or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">PDF files up to 50MB</p>
              </div>
            </div>
          </motion.div>

          {/* Compression Options */}
          {files.length > 0 && (
            <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-lg border border-border/50 p-6 sm:p-8 glass-panel">
              <h3 className="text-xl font-bold text-foreground mb-6">Optimization Level</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: 'low', label: 'Basic Compression', desc: 'Smaller size reduction, high quality' },
                  { value: 'medium', label: 'Recommended', desc: 'Perfect balance of size and quality' },
                  { value: 'high', label: 'Extreme Compression', desc: 'Maximum size reduction, lower quality' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setCompressionLevel(option.value as any)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                      compressionLevel === option.value
                        ? 'border-primary bg-primary/10 shadow-md transform -translate-y-1'
                        : 'border-border/50 bg-secondary/50 hover:border-primary/50 hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                          compressionLevel === option.value
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {compressionLevel === option.value && (
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="font-bold text-foreground">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8 leading-relaxed">
                      {option.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden glass-panel">
              <div className="p-5 border-b border-border/50 bg-secondary/30">
                <h3 className="text-lg font-bold text-foreground">Queued Files ({files.length})</h3>
              </div>
              <ul className="divide-y divide-border/50">
                {files.map((file, index) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="p-5 flex items-center justify-between hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <FileText className="h-6 w-6" />
                      </div>
                      <div>
                          <span className="block font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
                            {file.name}
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8">
            {files.length > 0 && (
              <button
                onClick={clearFiles}
                className="w-full sm:w-auto text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors py-3 px-6 rounded-xl hover:bg-destructive/10"
              >
                Clear All Files
              </button>
            )}
            <button
              onClick={handleCompress}
              disabled={files.length === 0 || isCompressing}
              className={`w-full sm:w-auto ml-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl shadow-xl transition-all ${
                files.length === 0
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed shadow-none'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:-translate-y-1'
              }`}
            >
              {isCompressing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-3" />
                  {files.length === 0 ? 'Select files to begin' : 'Compress PDF'}
                </>
              )}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Features List */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 bg-card rounded-3xl shadow-xl p-8 sm:p-12 border border-border/50 max-w-5xl mx-auto glass-panel"
      >
        <h2 className="text-3xl font-extrabold text-foreground mb-8 text-center tracking-tight">Why use our Compressor?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Drastic Size Reduction</h3>
              <p className="text-muted-foreground leading-relaxed">Shrink your heavy PDF files down by up to 80% without destroying text legibility or losing images.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Cloud-Powered Speed</h3>
              <p className="text-muted-foreground leading-relaxed">Our military-grade compute nodes process your documents in seconds, accessible from any device.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Email-Friendly Sizes</h3>
              <p className="text-muted-foreground leading-relaxed">Never get bounced by an email server again. Make your files instantly shareable across the web.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Instant Auto-Delete</h3>
              <p className="text-muted-foreground leading-relaxed">For your privacy and data security, files are automatically obliterated from our servers shortly after processing.</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}