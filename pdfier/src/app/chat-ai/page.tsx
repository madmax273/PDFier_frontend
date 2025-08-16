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
    }
  }, [user]);

  const handleLogin = () => {
    router.push('/login');
  };

  useEffect(() => {
    let cancelled = false;
    async function loadCollections() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/collections/`, {
          method: "GET",
          headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch collections: ${response.status}`);
        const raw = await response.json();
        const list: Collection[] =
          Array.isArray(raw) ? raw : Array.isArray(raw?.results) ? raw.results : Array.isArray(raw?.data) ? raw.data : [];
        if (!cancelled) setCollections(list);
      } catch (e: any) {
        setToast({ message: e?.message ?? "Failed to load collections", type: "error" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCollections();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/collections/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
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
    return <div className="flex justify-center items-center h-[60vh] text-lg text-gray-500">Loading collections...</div>;
  }

  // Show login modal for guest users
  if (user?.plan_type === 'guest' && showLoginDialog) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Login Required</h3>
            <p className="text-sm text-gray-500 mt-1">
              Please log in to access the Chat AI feature. This feature is only available for registered users.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleLogin}
              className="bg-[#471396] hover:bg-[#5e1bbf] text-white"
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
    
    <div className="px-4 sm:px-6 space-y-6">
      <div className="h-4"></div> {/* Added space */}
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#471396]">My Collections</h2>
        <p className="mt-2 text-sm text-gray-500">Please select a conversation to start a conversation.</p>
        
       

        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#471396] hover:bg-[#5e1bbf] text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          Create Collection
        </Button>
      </div>
      
      

      {/* Collection Grid */}
      {!isEmpty && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <button
              key={c.id}
              className="text-left rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] bg-white"
              onClick={() => onSelectCollection(c)}
            >
              <div className="font-semibold text-lg text-[#471396]">{c.name}</div>
              {c.description ? (
                <div className="text-sm text-gray-700 mt-2">{c.description}</div>
              ) : (
                <div className="text-sm italic text-gray-400 mt-2">No description</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="rounded-xl border border-dashed p-8 flex flex-col items-center gap-4 bg-white shadow-sm">
          <div className="text-center">
            <div className="font-semibold text-lg text-gray-800">No collections found</div>
            <div className="text-sm text-gray-500 mt-1">Please create a collection to get started</div>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-[#471396] hover:bg-[#5e1bbf] text-white px-5 py-2 rounded-lg shadow-md transition"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-lg text-[#471396]">Create Collection</h3>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter collection name"
                  className="focus:ring-white focus:border-black bg-white border-2 border-black text-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="focus:ring-white focus:border-black bg-white border-2 border-black text-black"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#471396] hover:bg-[#5e1bbf] text-white shadow-md"
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
