"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { Toast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/AuthStore";

type Collection = {
  id: string;
  name: string;
  description?: string | null;
};

export default function ChatAiCollectionsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  
  // Debug user state
  console.log('Current user state:', { user, isLoggedIn, userId: user?.id });
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Check if user is guest and show login dialog
  useEffect(() => {
    if (user?.plan_type === 'guest') {
      setShowLoginDialog(true);
      setCollections([]); // Clear collections for guest users
    } else if (user) {
      setShowLoginDialog(false); // Hide login dialog for authenticated users
    }
  }, [user]);

  const handleLogin = () => {
    router.push('/login');
  };

  // Clear collections when user changes to prevent showing wrong data
  useEffect(() => {
    setCollections([]);
    setLoading(true);
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadCollections() {
      // Only fetch if we have a valid user and they're not a guest
      if (!user || user.plan_type === 'guest') {
        console.log('Skipping collections fetch - no valid user or guest user');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Loading collections for user:', user?.id);
        console.log('Access token exists:', !!Cookies.get("accessToken"));
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/collections/?user_id=${user?.id}&_t=${Date.now()}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch collections: ${response.status}`);
        const raw = await response.json();
        console.log('Raw API response:', raw);
        
        const list: Collection[] =
          Array.isArray(raw) ? raw : Array.isArray(raw?.results) ? raw.results : Array.isArray(raw?.data) ? raw.data : [];
        console.log('Processed collections list:', list);
        
        if (!cancelled) setCollections(list);
      } catch (e: any) {
        console.error('Error loading collections:', e);
        setToast({ message: e?.message ?? "Failed to load collections", type: "error" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCollections();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/collections/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, user_id: user?.id }),
      });
      if (!res.ok) throw new Error(`Failed to create collection: ${res.status}`);
      const created: Collection = await res.json();
      router.push(`/chat-ai/${created.id}`);
    } catch (e: any) {
      setToast({ message: e?.message ?? "Failed to create collection", type: "error" });
    }
  };

  const onSelectCollection = (c: Collection) => {
    router.push(`/chat-ai/${c.id}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh] text-lg text-muted-foreground">Loading collections...</div>;
  }

  // Show login modal for guest users
  if (user?.plan_type === 'guest' && showLoginDialog) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-card border border-border/50 p-6 shadow-2xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground">Login Required</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Please log in to access the Chat AI feature. This feature is only available for registered users.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="bg-transparent hover:bg-muted text-muted-foreground border-border/50"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleLogin}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = collections.length === 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-border/40 pb-6 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            My Collections
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            Organize your documents into collections and start chatting with the AI to extract insights and summaries.
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-semibold whitespace-nowrap"
        >
          + Create Collection
        </Button>
      </div>

      {/* Collection Grid */}
      {!isEmpty && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((c) => (
            <button
              key={c.id}
              className="group text-left rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-6 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              onClick={() => onSelectCollection(c)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500" />
              <div className="font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                {c.name}
              </div>
              {c.description ? (
                <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {c.description}
                </div>
              ) : (
                <div className="text-sm italic text-muted-foreground/60 mt-2">
                  No description provided
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="rounded-3xl border-2 border-dashed border-border/60 p-12 flex flex-col items-center justify-center gap-6 bg-card/30 backdrop-blur-sm shadow-sm min-h-[400px]">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-6 bg-background rounded-full border border-border shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="text-center space-y-2 max-w-md mx-auto">
            <h3 className="font-bold text-2xl text-foreground">No collections yet</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Create your first collection to upload documents and start chatting with our AI assistant.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 bg-foreground text-background hover:bg-foreground/90 px-8 py-3 rounded-full shadow-lg transition-all hover:-translate-y-1 font-semibold"
          >
            Get Started Now
          </Button>
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border/50 bg-card/95 backdrop-blur-xl p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-muted/20">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Collection
              </h3>
              <button
                className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5 flex flex-col">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Legal Documents 2024"
                  className="w-full px-4 py-3 h-auto bg-background border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Description (Optional)</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief context about this collection..."
                  className="w-full px-4 py-3 h-auto bg-background border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                  className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl px-5 py-2.5 h-auto transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl px-6 py-2.5 h-auto transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
