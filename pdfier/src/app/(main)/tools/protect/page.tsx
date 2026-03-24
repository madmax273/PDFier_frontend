// src/app/(main)/tools/protect/page.tsx
"use client";

import { useState, useCallback } from 'react';
import { Upload, FileText, Lock, Eye, EyeOff, X, CheckCircle, Home, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/FileStore';
import Link from 'next/link';
import { Toast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/AuthStore';
import Cookies from 'js-cookie';
import { motion, Variants } from 'framer-motion';
export default function ProtectPDFPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProtecting, setIsProtecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [permissions, setPermissions] = useState({
    printing: 'high', // 'none', 'low', 'high'
    modifying: false,
    copying: false,
    formFilling: false  ,
  });
  const { files, addFiles, removeFile, clearFiles } = useFileStore();
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user } = useAuthStore();
  const { updateUserUsage } = useAuthStore();
  const { updateGuestUsage } = useAuthStore();

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

  const handleProtect = async () => {
    if (files.length === 0) return;
    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    
    
    
    if(user && user.plan_type === 'guest'){
      console.log('Current guest usage:', user.usage_metrics.pdf_processed_today);
      if(user.usage_metrics.pdf_processed_today >= user.usage_metrics.pdf_processed_limit_daily){
        setToast({ message: `You have exceeded the daily limit of ${user.usage_metrics.pdf_processed_limit_daily} PDF files to protect.`, type: 'error' });
        return;
      } else {
        const newCount = user.usage_metrics.pdf_processed_today + 1;
        console.log('Updating to:', newCount);
        updateGuestUsage(newCount);
        console.log('Guest usage after update:', user.usage_metrics.pdf_processed_today);
      }
    }

    setIsProtecting(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file.file, file.name);
      });
      formData.append('password', password);
      formData.append('permissions', JSON.stringify(permissions));
      console.log('Protecting PDF with password:', password);
      console.log('Permissions:', permissions);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tools/pdf/protect`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${Cookies.get('accessToken')}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        // console.log("Compressed PDF URL:", downloadUrl); // This console.log will show the *previous* state of downloadUrl, it's asynchronous. If you want to see the new value, log responseData.download_urls
        if(responseData.user_usage){
          updateUserUsage(responseData.user_usage);
        }
        setToast({ message: 'PDF protected successfully!', type: 'success' });
        const params = new URLSearchParams();
        responseData.download_url.forEach((urlObj: string) => {
          params.append('url', urlObj);
        });
        console.log("Query string to push:", params.toString());
        router.push(`/tools/protect/download?${params.toString()}`);
        clearFiles();
      }
      else {
        const errorData = await response.json();
        console.error('Protection error:', errorData);
        setToast({ message: 'Failed to protect PDF', type: 'error' });
      }
      
    } catch (error) {
      console.error('Protection error:', error);
      setToast({ message: 'Failed to protect PDF', type: 'error' });
    } finally {
      setIsProtecting(false);
    }
  };

  const togglePermission = (permission: keyof typeof permissions) => {
    if (permission === 'printing') {
      setPermissions(prev => ({
        ...prev,
        printing: prev.printing === 'high' ? 'low' : prev.printing === 'low' ? 'none' : 'high'
      }));
    } else {
      setPermissions(prev => ({
        ...prev,
        [permission]: !prev[permission]
      }));
    }
  };

  const getPermissionLabel = (value: string | boolean) => {
    if (typeof value === 'boolean') return value ? 'Allowed' : 'Not Allowed';
    return value.charAt(0).toUpperCase() + value.slice(1);
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
        <span className="text-foreground">Protect PDF</span>
      </nav>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}

        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-foreground mb-2 sm:text-4xl tracking-tight">Protect PDF</h1>
          <p className="text-muted-foreground text-lg">Add password and set permissions to your PDF files</p>
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
                <Lock className="h-10 w-10 text-primary" />
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
                      onChange={handleFileInput}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>{' '}
                  or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">Single PDF file up to 50MB</p>
              </div>
            </div>
          </motion.div>

          {/* Protection Options */}
          {files.length > 0 && (
            <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-lg border border-border/50 p-6 sm:p-8 glass-panel space-y-8">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-6">Protection Settings</h3>
                
                {/* Password Protection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-foreground mb-4">
                    Set Security Password
                  </label>
                  <div className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2 font-medium">Document Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          placeholder="Enter strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2 font-medium">Confirm Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-4">Advanced Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries({
                      printing: 'Printing Quality',
                      modifying: 'Document Modification',
                      copying: 'Content Copying',
                      formFilling: 'Form Filling'
                    }).map(([key, label]) => (
                      <div
                        key={key}
                        onClick={() => togglePermission(key as keyof typeof permissions)}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                          permissions[key as keyof typeof permissions] && permissions[key as keyof typeof permissions] !== 'none'
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border/50 bg-secondary/50 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{label}</span>
                          <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                            permissions[key as keyof typeof permissions] && permissions[key as keyof typeof permissions] !== 'none'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {getPermissionLabel(permissions[key as keyof typeof permissions])}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* File List */}
          {files.length > 0 && (
             <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden glass-panel">
              <div className="p-5 border-b border-border/50 bg-secondary/30">
                <h3 className="text-lg font-bold text-foreground">File to Protect</h3>
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
                Clear
              </button>
            )}
            <button
              onClick={handleProtect}
              disabled={files.length === 0 || isProtecting || !password}
              className={`w-full sm:w-auto ml-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl shadow-xl transition-all ${
                files.length === 0 || !password
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed shadow-none'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:-translate-y-1'
              }`}
            >
              {isProtecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Securing...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-3" />
                  {files.length === 0 ? 'Select File to Protect' : 'Protect PDF'}
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
        <h2 className="text-3xl font-extrabold text-foreground mb-8 text-center tracking-tight">Enterprise-Grade Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">AES-256 Encryption</h3>
              <p className="text-muted-foreground leading-relaxed">We use the strongest encryption standards available. The same encryption used by banks and the military.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Granular Permissions</h3>
              <p className="text-muted-foreground leading-relaxed">Control exactly what viewers can do. Prevent printing, copying, editing, or even form filling with simple toggles.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Zero-Knowledge Architecture</h3>
              <p className="text-muted-foreground leading-relaxed">Your passwords are never stored or logged on our servers. Processing happens dynamically and securely in the moment.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl mt-1">
                <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Compliance Ready</h3>
              <p className="text-muted-foreground leading-relaxed">Designed to help you meet stringent data protection requirements, like GDPR and HIPAA, by securing sensitive documents at rest.</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}