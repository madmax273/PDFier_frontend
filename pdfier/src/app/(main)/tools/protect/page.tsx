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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="text-sm font-medium text-gray-500 mb-6 flex items-center space-x-2">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          <Home size={16} />
        </Link>
        <ChevronRight size={16} />
        <Link href="/tools" className="text-gray-400 hover:text-gray-600">
          Tools
        </Link>
        <ChevronRight size={16} />
        <span>Protect PDF</span>
      </nav>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Protect PDF</h1>
          <p className="text-gray-600">Add password and set permissions to your PDF files</p>
        </div>

        <div className="space-y-8">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-[#471396] bg-purple-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Lock className="h-6 w-6 text-[#471396]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer font-medium text-[#471396] hover:text-[#3a0f75] focus-within:outline-none"
                  >
                    <span>Upload a PDF file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      onChange={handleFileInput}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">or drag and drop PDF file</p>
              </div>
            </div>
          </div>

          {/* Protection Options */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Protection Settings</h3>
              
              {/* Password Protection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Password
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-gray-500 py-2 rounded-md border-gray-300 shadow-sm focus:border-[#471396] focus:ring-[#471396] text-base"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-gray-500 py-2 rounded-md border-gray-300 shadow-sm focus:border-[#471396] focus:ring-[#471396] text-base"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Set Permissions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries({
                    printing: 'Printing',
                    modifying: 'Document Modification',
                    copying: 'Content Copying',
                    formFilling: 'Form Filling'
                  }).map(([key, label]) => (
                    <div
                      key={key}
                      onClick={() => togglePermission(key as keyof typeof permissions)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        permissions[key as keyof typeof permissions]
                          ? 'border-[#471396] bg-purple-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{label}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200">
                          {getPermissionLabel(permissions[key as keyof typeof permissions])}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">File to Protect</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            {files.length > 0 && (
              <button
                onClick={clearFiles}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleProtect}
              disabled={files.length === 0 || isProtecting || !password}
              className={`ml-auto inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                files.length === 0 || !password
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#471396] hover:bg-[#3a0f75]'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#471396]`}
            >
              {isProtecting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Securing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {files.length === 0 ? 'Select File to Protect' : 'Protect PDF'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Features List */}
            <section className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Features of Smart PDF Merge</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Merge multiple PDFs into a single file in seconds</h3>
                    <p className="text-gray-600 text-sm">Quickly combine documents without hassle.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Works online on any device and operating system</h3>
                    <p className="text-gray-600 text-sm">Access our tool from anywhere, anytime.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Trusted by millions of users worldwide</h3>
                    <p className="text-gray-600 text-sm">Join a global community of satisfied users.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Secure and private processing</h3>
                    <p className="text-gray-600 text-sm">Your documents are safe with us, processed securely in the cloud.</p>
                  </div>
                </div>
              </div>
            </section>
    </div>
  );
}