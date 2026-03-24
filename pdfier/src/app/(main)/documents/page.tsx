'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, FileDown, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { motion, Variants } from 'framer-motion';

interface Document {
  name: string;
  id: string;
  url: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
        const accessToken = Cookies.get('accessToken');
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;
        if(!accessToken) {
            setIsLoading(false);
            return;
        }
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/documents/list-user-files`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data.files || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const formatFileName = (name: string) => {
    return name
      .replace(/^chat_\d+_/, '')
      .replace(/\.pdf$/i, '')
      .replace(/_/g, ' ');
  };

  const formatDate = (timestamp: string) => {
    const match = timestamp.match(/^chat_(\d+)_/);
    if (!match) return 'Unknown date';
    
    const date = new Date(parseInt(match[1]));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-primary">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg font-medium animate-pulse text-muted-foreground">Loading your secure vault...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center py-20">
        <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Sync Error</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="rounded-full px-8">Try Again</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-2">
                Cloud <span className="text-primary">Vault</span>
            </h1>
            <p className="text-lg text-muted-foreground">
                Securely manage and access your processed PDFs.
            </p>
        </div>
        <Link 
            href="/tools" 
            className="inline-flex items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8 py-2"
        >
          Process New PDF
        </Link>
      </motion.div>

      {!Cookies.get('accessToken') ? (
         <motion.div variants={itemVariants} className="bg-card border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center py-24 text-center glass-panel">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Sign in to Access Your Vault</h3>
            <p className="text-muted-foreground mb-8 max-w-md text-lg">Your processed documents are securely stored in the cloud. Log in to view them.</p>
            <Link href="/login" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              Sign In Now
            </Link>
        </motion.div>
      ) : documents.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-card border border-border/50 rounded-3xl flex flex-col items-center justify-center py-24 text-center glass-panel">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Your Vault is Empty</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-lg">You haven't processed any documents yet. Try compressing or chatting with a PDF.</p>
          <Link href="/tools" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            Explore Tools
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc, idx) => (
            <motion.div 
               variants={itemVariants}
               key={doc.id} 
               className="group relative bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden glass-panel flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
              
              <div className="relative z-10 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {formatFileName(doc.name)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {formatDate(doc.name)}
                  </p>
              </div>

              <div className="relative z-10 border-t border-border/50 pt-4 mt-auto flex items-center justify-between gap-2">
                <a 
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(doc.url)}&embedded=true`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors py-2 rounded-lg"
                >
                    <Eye className="w-4 h-4" /> Preview
                </a>
                <a 
                    href={doc.url} 
                    download
                    className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-secondary hover:bg-secondary/80 transition-colors rounded-lg text-foreground"
                    title="Download Original PDF"
                >
                    <FileDown className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
