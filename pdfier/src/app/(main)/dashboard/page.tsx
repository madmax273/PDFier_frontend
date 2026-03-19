'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus, MessageSquare, Minimize2, ArrowRightLeft, FileText, Lock, Sparkles, Zap, ArrowRight, Activity } from 'lucide-react';
import Cookies from 'js-cookie';
import { motion, Variants } from 'framer-motion';
import { useAuthStore } from '@/store/AuthStore';

interface Document {
  id: string;
  name: string;
  displayName?: string;
  url: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/documents/list-user-files`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }

        const data = await response.json();
        const processedDocs = data.files
          .map((doc: Document) => ({
            ...doc,
            displayName: doc.name.replace(/^chat_\d+_/, '')
          }))
          .sort((a: Document, b: Document) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 4);

        setDocuments(processedDocs);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load recent documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const getGoogleDocsUrl = (pdfUrl: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
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


  const userName = user?.name || 'Guest';
  const isGuest = user?.plan_type === 'guest';
  const currentPlan = user?.plan_type?.toUpperCase() || 'GUEST';

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-2">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">{userName}</span> 👋
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Manage your documents, optimize your workflow, and chat with AI in seconds.
          </p>
        </div>
        
        {/* Plan Badge / Upsell */}
        <div className="flex items-center gap-3 bg-card border border-border/50 p-2 pr-4 rounded-full shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Current Plan</p>
            <p className="text-sm font-bold text-foreground">{currentPlan}</p>
          </div>
          {isGuest && (
            <Link href="/login" className="ml-2 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
              Upgrade
            </Link>
          )}
        </div>
      </motion.div>

      {/* AI Assistant Banner */}
      <motion.section variants={itemVariants}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-[#3b0980] border border-primary/20 shadow-2xl p-8 sm:p-10">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-white max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" /> Wait-Free AI Parsing
              </div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight">Unlock Insights from any PDF</h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed mb-0">
                Instantly summarize, analyze, and query massive documents using our state-of-the-art vision models. Stop reading, start asking.
              </p>
            </div>
            <Link 
              href="/chat-ai" 
              className="group relative inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <MessageSquare className="w-5 h-5" />
              <span>Chat with a PDF</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Tool Grid + Usage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <motion.section variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Quick Actions</h2>
            <Link href="/tools" className="text-sm font-medium text-primary flex items-center hover:underline">
              View all tools <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Merge PDFs', desc: 'Combine multiple documents', icon: ArrowRightLeft, href: '/tools/merge', color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { title: 'Compress PDF', desc: 'Reduce file size massively', icon: Minimize2, href: '/tools/compress', color: 'text-green-500', bg: 'bg-green-500/10' },
              { title: 'Protect PDF', desc: 'Add passwords & encryption', icon: Lock, href: '/tools/protect', color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { title: 'My Documents', desc: 'Access your cloud vault', icon: FileText, href: '/documents', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((tool, idx) => (
              <Link 
                key={idx} 
                href={tool.href} 
                className="group relative bg-card hover:bg-secondary/50 p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-${tool.color.replace('text-', '')}/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
                <div className="relative z-10 flex items-start gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${tool.bg} shadow-inner`}>
                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Usage Limits Sidebar */}
        <motion.section variants={itemVariants} className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-6">Daily Quota</h2>
          <div className="bg-card glass-panel rounded-2xl p-6 h-[calc(100%-3rem)] flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* PDF Processing Limit */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">PDFs Processed</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {user?.usage_metrics?.pdf_processed_today || 0} / {user?.usage_metrics?.pdf_processed_limit_daily || 5}
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((user?.usage_metrics?.pdf_processed_today || 0) / (user?.usage_metrics?.pdf_processed_limit_daily || 5)) * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* RAG Indexed Documents */}
              <div>
                 <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">AI Database Size</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {('rag_indexed_documents_count' in (user?.usage_metrics || {})) ? (user?.usage_metrics as any).rag_indexed_documents_count : 0} / 
                    {('rag_indexed_documents_limit' in (user?.usage_metrics || {})) ? (user?.usage_metrics as any).rag_indexed_documents_limit : 2}
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((('rag_indexed_documents_count' in (user?.usage_metrics || {})) ? (user?.usage_metrics as any).rag_indexed_documents_count : 0) / (('rag_indexed_documents_limit' in (user?.usage_metrics || {})) ? (user?.usage_metrics as any).rag_indexed_documents_limit : 2)) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  />
                </div>
              </div>

            </div>
            
            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground mb-3">Limits reset daily at midnight UTC.</p>
              <Link href="/settings" className="w-full inline-block text-center py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold rounded-xl transition-colors">
                Manage Plan
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Recent Documents Section */}
      <motion.section variants={itemVariants}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Recent Documents</h2>
          <Link href="/documents" className="text-sm font-medium text-primary hover:underline group flex items-center">
            View Cloud Vault <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {!Cookies.get('accessToken') ? (
          <div className="bg-card border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Vault Locked</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">Sign in securely to automatically sync and access your processed documents across all your devices.</p>
            <Link href="/login" className="bg-foreground text-background px-6 py-2.5 rounded-full font-semibold hover:bg-foreground/90 transition-colors">
              Sign In to View
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-secondary rounded max-w-[200px] animate-pulse" />
                      <div className="h-3 bg-secondary rounded max-w-[100px] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-destructive bg-destructive/5 font-medium">{error}</div>
            ) : documents.length > 0 ? (
              <div className="divide-y divide-border/50">
                {documents.map((doc, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    key={doc.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-secondary/30 transition-colors gap-4 group"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{doc.displayName || doc.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Added {new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-16 sm:pl-0 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <a 
                        href={getGoogleDocsUrl(doc.url)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                      >
                        Preview
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                 <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-6">Drop a PDF to test out our tools</p>
                <Link 
                  href="/tools" 
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold shadow hover:bg-primary/90 transition-colors"
                >
                  Explore Tools
                </Link>
              </div>
            )}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}