// src/app/(main)/tools/convert/page.tsx
"use client";

import { useState, useCallback } from 'react';
import { Upload, FileText, FileDown, X, CheckCircle, FileUp, Home, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/FileStore';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';


type ConvertFormat = 'pdf' | 'docx' | 'jpg' | 'png';

export default function ConvertPDFPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [targetFormat, setTargetFormat] = useState<ConvertFormat>('docx');
  const [isConverting, setIsConverting] = useState(false);
  const { files, addFiles, removeFile, clearFiles } = useFileStore();
  const router = useRouter();

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
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsConverting(true);
    try {
      // TODO: Implement conversion logic
      console.log('Converting files to:', targetFormat);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // router.push('/tools/convert/result?url=...');
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const formatOptions: { value: ConvertFormat; label: string; icon: any }[] = [
    { value: 'docx', label: 'Word Document', icon: FileText },
    { value: 'jpg', label: 'JPG Image', icon: FileUp },
    { value: 'png', label: 'PNG Image', icon: FileUp },
    { value: 'pdf', label: 'PDF', icon: FileText },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
        <span className="text-foreground">Convert PDF</span>
      </nav>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-foreground mb-2 sm:text-4xl tracking-tight">Convert Files</h1>
          <p className="text-muted-foreground text-lg">Convert your documents and images flawlessly between formats</p>
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
                      multiple
                      onChange={handleFileInput}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>{' '}
                  or drag and drop files
                </p>
                <p className="text-sm text-muted-foreground">Supported: PDF, DOCX, JPG, PNG</p>
              </div>
            </div>
          </motion.div>

          {/* Conversion Options */}
          {files.length > 0 && (
            <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-lg border border-border/50 p-6 sm:p-8 glass-panel space-y-6">
              <h3 className="text-xl font-bold text-foreground mb-6">Target Format</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      onClick={() => setTargetFormat(option.value)}
                      className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                        targetFormat === option.value
                          ? 'border-primary bg-primary/10 shadow-md transform -translate-y-1'
                          : 'border-border/50 bg-secondary/50 hover:border-primary/50 hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            targetFormat === option.value
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {targetFormat === option.value && (
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <Icon className={`h-6 w-6 ${targetFormat === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="font-bold text-foreground block mt-2">{option.label}</span>
                    </div>
                  );
                })}
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
              onClick={handleConvert}
              disabled={files.length === 0 || isConverting}
              className={`w-full sm:w-auto ml-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl shadow-xl transition-all ${
                files.length === 0
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed shadow-none'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:-translate-y-1'
              }`}
            >
              {isConverting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FileDown className="h-5 w-5 mr-3" />
                  {files.length === 0 ? 'Select files to convert' : `Convert to ${targetFormat.toUpperCase()}`}
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
        <h2 className="text-3xl font-extrabold text-foreground mb-8 text-center tracking-tight">Enterprise Conversions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Pixel-Perfect Accuracy</h3>
              <p className="text-muted-foreground leading-relaxed">Our OCR and rendering engine ensures that formatting, tables, and images remain perfectly aligned across different formats.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Blazing Fast</h3>
              <p className="text-muted-foreground leading-relaxed">Most document conversions take under 5 seconds. Dedicated cloud resources handle intensive operations instantly.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">No Installation Required</h3>
              <p className="text-muted-foreground leading-relaxed">Enjoy powerful conversion capabilities directly in your browser without downloading any heavy software.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Bank-Grade Privacy</h3>
              <p className="text-muted-foreground leading-relaxed">All transferred files are protected by TLS encryption and are automatically scrubbed from our network shortly after conversion.</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}