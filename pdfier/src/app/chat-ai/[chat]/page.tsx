"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, ChangeEvent } from "react";
import { fetchConversations } from "@/services/conversations";
import { useConversationStore } from "@/store/ConversationStore";
import { fetchDocuments, uploadDocument } from "@/services/documents";
import { useDocumentStore } from "@/store/DocumentStore";
import { fetchMessages, sendChat } from "@/services/messages";
import Cookies from "js-cookie";

export default function Home() {
  const params = useParams();
  const collectionId = Array.isArray((params as any)?.chat)
    ? (params as any).chat[0]
    : (params as any)?.chat ?? "";

  const [activeTab, setActiveTab] = useState<"conversations" | "documents">(
    "conversations"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const {
    conversations,
    setConversations,
    setSelectedConversation,
    selectedConversation,
  } = useConversationStore();
  const {
    documents,
    selectedDocument,
    setDocuments,
    setSelectedDocument,
  } = useDocumentStore();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (activeTab !== "conversations" || !collectionId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchConversations(collectionId as string);
        if (!cancelled) setConversations(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load conversations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [activeTab, collectionId, setConversations]);

  // Fetch documents when Documents tab is active; default-select first
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (activeTab !== "documents") return;
      const effectiveCollectionId =
        selectedConversation?.collection_id ||
        (conversations && conversations.length > 0 ? conversations[0].collection_id : undefined) ||
        (collectionId as string);
      if (!effectiveCollectionId) return;
      try {
        setDocLoading(true);
        setDocError(null);
        const docs = await fetchDocuments(effectiveCollectionId);
        if (!cancelled) {
          setDocuments(docs);
          if (docs.length > 0) {
            // If no selected doc or selected no longer in list, default to first
            if (!selectedDocument || !docs.find((d) => d.id === selectedDocument.id)) {
              setSelectedDocument(docs[0]);
            }
          } else {
            setSelectedDocument(null);
          }
        }
      } catch (e: any) {
        if (!cancelled) setDocError(e?.message ?? `Failed to load documents for collection ${effectiveCollectionId}`);
      } finally {
        if (!cancelled) setDocLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [activeTab, collectionId, selectedConversation, conversations, setDocuments, setSelectedDocument, selectedDocument]);

  // Load messages when a conversation is selected
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const convId = selectedConversation?.id;
      if (!convId) {
        setMessages([]);
        return;
      }
      try {
        setMessagesLoading(true);
        setMessagesError(null);
        const data = await fetchMessages(convId);
        if (!cancelled) {
          // Normalize: accept array or {data: []}
          const arr = Array.isArray(data) ? data : (data as any)?.data || [];
          setMessages(arr);
        }
      } catch (e: any) {
        if (!cancelled) setMessagesError(e?.message || 'Failed to load messages');
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [selectedConversation]);

  // Typing indicator (animated dots) and bottom visibility
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [typingStep, setTypingStep] = useState(1); // 1 -> '.', 2 -> '..', 3 -> '...'
  const [nearBottom, setNearBottom] = useState(true);
  const [justSent, setJustSent] = useState(false);

  useEffect(() => {
    const hasTyping = Array.isArray(messages) && (messages as any[]).some((m: any) => m?.loading);
    if (!hasTyping) {
      setTypingStep(1);
      return;
    }
    const id = setInterval(() => {
      setTypingStep((prev) => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(id);
  }, [messages]);

  useEffect(() => {
    // Jump to bottom (no animation) only if user is near bottom or just sent
    if ((nearBottom || justSent) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [messages, sending, messagesLoading, selectedConversation, nearBottom, justSent]);

  // Track if user is near the bottom of the scroll container
  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 40; // px from bottom counts as near-bottom
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setNearBottom(distanceFromBottom <= threshold);
  };

  const exampleMessages = [
    { role: "user", text: "Hi, can you summarize this document?" },
    { role: "ai", text: "Sure! The document discusses project requirements and timelines." },
    { role: "user", text: "Great, can you make a bullet point list?" },
    { role: "ai", text: "Absolutely! Here are the key points:\n- Requirement 1\n- Requirement 2\n- Requirement 3" }
  ];

  async function handleCreateConversation(e: React.FormEvent) {
    e.preventDefault();
    // Get collectionId from URL params
    const urlCollectionId = Array.isArray(params?.chat) ? params.chat[0] : params?.chat;
    if (!conversationTitle.trim() || !urlCollectionId) return;
    
    try {
      setIsCreating(true);
      const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/conversations/`);
      url.searchParams.append('collection_id', urlCollectionId);
      url.searchParams.append('title', conversationTitle);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create conversation');
      }
      
      // Reload the page to show the new conversation in the sidebar
      window.location.reload();
    } catch (error) {
      console.error('Error creating conversation:', error);
      // TODO: Show error toast
    } finally {
      setIsCreating(false);
      setShowNewConversationModal(false);
    }
  }

  // Upload handlers
  function handleUploadClick() {
    // Prefer currently selected conversation's collection_id
    const effectiveCollectionId = selectedConversation?.collection_id || (conversations && conversations[0]?.collection_id);
    if (!effectiveCollectionId) {
      setDocError('Please select a conversation to choose its collection for upload.');
      setActiveTab('conversations');
      return;
    }
    // Trigger file picker
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset the input so selecting the same file again triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;
    const effectiveCollectionId = selectedConversation?.collection_id || (conversations && conversations[0]?.collection_id) || (collectionId as string);
    if (!effectiveCollectionId) {
      setDocError('No collection selected for upload.');
      return;
    }
    try {
      setUploading(true);
      setDocError(null);
      await uploadDocument(file, effectiveCollectionId);
      // Refresh documents list after upload
      const docs = await fetchDocuments(effectiveCollectionId);
      setDocuments(docs);
      if (docs.length > 0) {
        // Try to select the most recent (assume first if API returns sorted; otherwise keep existing)
        if (!selectedDocument || !docs.find(d => d.id === selectedDocument.id)) {
          setSelectedDocument(docs[0]);
        }
      }
      // Switch to Documents tab so user sees progress/list
      setActiveTab('documents');
    } catch (err: any) {
      setDocError(err?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  }

  // Send chat handlers
  async function handleSend() {
    const text = chatInput.trim();
    if (!text) return;
    const colId = selectedConversation?.collection_id || (conversations && conversations[0]?.collection_id) || (collectionId as string);
    const convId = selectedConversation?.id;
    if (!colId) {
      setMessagesError("No collection selected. Please pick a conversation first.");
      setActiveTab('conversations');
      return;
    }
    // Optimistically show user message and AI placeholder
    const nowIso = new Date().toISOString();
    const userTempId = `temp-user-${Date.now()}`;
    const aiTempId = `temp-ai-${Date.now()}`;
    setJustSent(true);
    setMessages((prev: any[]) => [
      ...prev,
      { id: userTempId, sender: 'user', content: text, timestamp: nowIso, _temp: true },
      { id: aiTempId, sender: 'ai', content: '...', timestamp: nowIso, _temp: true, loading: true },
    ]);
    try {
      setSending(true);
      setMessagesError(null);
      await sendChat({ query: text, collection_id: colId, conversation_id: convId });
      setChatInput("");
      if (convId) {
        // Reload messages for this conversation to replace placeholders with real data
        setMessagesLoading(true);
        const msgs = await fetchMessages(convId);
        setMessages(msgs);
      } else {
        // If no conversation id yet, keep placeholder until the list refreshes elsewhere
      }
    } catch (e: any) {
      // Replace AI placeholder with an error message
      setMessages((prev: any[]) => prev.map((m: any) => (
        m.id === aiTempId ? { ...m, loading: false, content: 'Failed to send. Please try again.' } : m
      )));
      setMessagesError(e?.message || 'Failed to send message');
    } finally {
      setSending(false);
      setMessagesLoading(false);
      // Give the UI a tick, then clear justSent
      setTimeout(() => setJustSent(false), 0);
    }
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="font-semibold mb-4 text-gray-600">Menu</h2>

        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 rounded-l-lg ${
              activeTab === "conversations"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveTab("conversations")}
          >
            Conversations
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg ${
              activeTab === "documents"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </button>
        </div>

        {activeTab === "conversations" ? (
          <div className="space-y-2 overflow-y-auto flex-1">
            {loading && (
              <div className="text-sm text-gray-500">Loading conversations...</div>
            )}
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!loading && !error && conversations.length === 0 && (
              <div className="text-sm text-gray-500">No conversations found.</div>
            )}
            {!loading && !error &&
              conversations.map((c) => {
                const isActive = selectedConversation?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`border rounded-lg p-3 hover:shadow cursor-pointer ${
                      isActive ? "border-purple-400 bg-purple-50" : ""
                    }`}
                    onClick={() => setSelectedConversation(c)}
                    title={c.title}
                  >
                    <p className="text-purple-700 font-semibold truncate">{c.title}</p>
                    <p className="text-xs text-gray-500">Last active: {new Date(c.last_active_at).toLocaleString()}</p>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1">
            {docLoading && (
              <div className="text-sm text-gray-500">Loading documents...</div>
            )}
            {docError && (
              <div className="text-sm text-red-600">{docError}</div>
            )}
            {!docLoading && !docError && documents.length === 0 && (
              <div className="text-sm text-gray-500">No documents found.</div>
            )}
            {!docLoading && !docError &&
              documents.map((d) => {
                const isActive = selectedDocument?.id === d.id;
                return (
                  <div
                    key={d.id}
                    className={`border rounded-lg p-3 hover:shadow cursor-pointer ${
                      isActive ? "border-purple-400 bg-purple-50" : ""
                    }`}
                    onClick={() => setSelectedDocument(d)}
                    title={d.file_name}
                  >
                    <p className="text-purple-700 font-semibold truncate">{d.file_name}</p>
                    <p className="text-xs text-gray-500">Uploaded: {new Date(d.uploaded_at).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{d.status}</p>
                  </div>
                );
              })}
          </div>
        )}

        <button
          onClick={handleUploadClick}
          disabled={uploading || !selectedConversation}
          className={`mt-4 text-white py-2 rounded-lg ${uploading || !selectedConversation ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          title={!selectedConversation ? 'Select a conversation first' : 'Upload a PDF to this collection'}
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Main Area */}
      {selectedConversation ? (
        <div className="flex flex-1">
          {/* Document Preview */}
          <div className="w-1/2 p-4 flex flex-col">
            <div className="bg-white shadow rounded-lg flex-1 flex flex-col text-gray-700 p-4 min-h-0">
              {selectedDocument ? (
                <div className="w-full h-full flex flex-col min-h-0">
                  <div className="text-xs text-gray-600 font-medium truncate self-start">{selectedDocument.file_name}</div>
                  {selectedDocument.url ? (
                    <iframe
                      key={selectedDocument.url}
                      src={selectedDocument.url}
                      className="w-full flex-1 border rounded mt-2"
                      title={selectedDocument.file_name}
                    />
                  ) : (
                    <div className="mt-2 text-sm text-gray-500">No preview URL available for this document.</div>
                  )}
                </div>
              ) : (
                <span className="text-gray-400">No document selected</span>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="w-1/2 p-4 flex flex-col">
            <div className="bg-white shadow rounded-lg flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messagesLoading && (
                  <div className="text-sm text-gray-500">Loading messages...</div>
                )}
                {messagesError && (
                  <div className="text-sm text-red-600">{messagesError}</div>
                )}
                {!messagesLoading && !messagesError && messages.length === 0 && (
                  <div className="text-sm text-gray-500">No messages yet.</div>
                )}
                {!messagesLoading && !messagesError && [...messages]
                  .sort((a: any, b: any) => {
                    const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return ta - tb;
                  })
                  .map((msg: any, idx: number) => {
                    const senderRaw = (msg.sender ?? msg.role ?? 'ai').toLowerCase();
                    const sender = senderRaw === 'assistant' ? 'ai' : senderRaw;
                    const content = msg.content ?? msg.text ?? msg.message ?? msg.body ?? '';
                    const isLoadingMsg = !!(msg as any)?.loading;
                    const display = isLoadingMsg ? '.'.repeat(Math.max(1, Math.min(3, typingStep))) : content;
                    return (
                      <div key={msg.id || idx} className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-md whitespace-pre-line ${sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`} aria-live={isLoadingMsg ? 'polite' : undefined}>
                          {display || <span className="opacity-60">(no content)</span>}
                          {msg.timestamp && (
                            <div className="mt-1 text-[10px] opacity-70">{new Date(msg.timestamp).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-3 flex items-center">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-3 py-2 mr-2 focus:outline-none focus:ring focus:ring-purple-500 text-black"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!sending && chatInput.trim()) handleSend();
                    }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !chatInput.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${sending || !chatInput.trim() ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="bg-white shadow rounded-xl p-10 max-w-md w-full text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-3xl">
              🤖
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No conversation selected</h3>
            <p className="text-sm text-gray-500 mt-1">
              Please select a conversation from the sidebar or create a new one to start chatting and preview documents.
            </p>
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="mt-6 inline-flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Create new conversation
            </button>
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-lg text-[#471396]">New Conversation</h3>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewConversationModal(false)}
                disabled={isCreating}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateConversation} className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Title</label>
                <input
                  type="text"
                  value={conversationTitle}
                  onChange={(e) => setConversationTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  placeholder="Enter conversation title"
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewConversationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleCreateConversation}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#471396] border border-transparent rounded-lg shadow-sm hover:bg-[#5e1bbf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  disabled={isCreating || !conversationTitle.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
