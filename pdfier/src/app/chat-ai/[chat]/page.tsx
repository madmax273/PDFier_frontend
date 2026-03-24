"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, ChangeEvent } from "react";
import { fetchConversations } from "@/services/conversations";
import { useConversationStore } from "@/store/ConversationStore";
import { fetchDocuments, uploadDocument } from "@/services/documents";
import { useDocumentStore } from "@/store/DocumentStore";
import { fetchMessages, sendChat } from "@/services/messages";
import Cookies from "js-cookie";
import { MessageSquare, FileText, Send, Upload, Plus, Bot, FileIcon, Loader2, X, AlertCircle, BotMessageSquare, Calendar, ArrowLeft, Menu } from "lucide-react";

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
    { role: "ai", text: "Absolutely! Here are the key points:\\n- Requirement 1\\n- Requirement 2\\n- Requirement 3" }
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-transparent">
      {/* Sidebar Overlay (Mobile) */}
      {selectedConversation && mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[40]"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={
        'flex-shrink-0 flex flex-col border-r border-border/40 bg-card/95 lg:bg-card/40 backdrop-blur-xl transition-all duration-300 h-full ' +
        (selectedConversation 
            ? 'fixed lg:static inset-y-0 left-0 z-[50] w-[80%] sm:w-80 lg:w-80 ' + (mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0')
            : 'w-full lg:w-80'
        )
      }>
        <div className="p-4 border-b border-border/40">
          <div className="flex rounded-lg p-1 bg-muted/50 backdrop-blur-sm border border-border/50">
            <button
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md transition-all duration-200 text-sm font-medium ${
                activeTab === "conversations"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
              onClick={() => setActiveTab("conversations")}
            >
              <MessageSquare className="w-4 h-4" />
              Chats
            </button>
            <button
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md transition-all duration-200 text-sm font-medium ${
                activeTab === "documents"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
              onClick={() => setActiveTab("documents")}
            >
              <FileText className="w-4 h-4" />
              Docs
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {activeTab === "conversations" ? (
            <>
              {loading && (
                <div className="flex flex-col items-center justify-center h-32 space-y-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-sm font-medium">Loading chats...</span>
                </div>
              )}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {!loading && !error && conversations.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-4">
                  <BotMessageSquare className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No conversations found.</p>
                </div>
              )}
              {!loading && !error &&
                conversations.map((c) => {
                  const isActive = selectedConversation?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`group relative p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                        isActive 
                          ? "bg-primary/10 border-primary/30 shadow-sm" 
                          : "bg-card hover:bg-accent/50 border-transparent hover:border-border"
                      }`}
                      onClick={() => {
                        setSelectedConversation(c);
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-primary transition-colors"}`}>
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                            {c.title}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/70">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(c.last_active_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </>
          ) : (
            <>
              {docLoading && (
                <div className="flex flex-col items-center justify-center h-32 space-y-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-sm font-medium">Loading documents...</span>
                </div>
              )}
              {docError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{docError}</span>
                </div>
              )}
              {!docLoading && !docError && documents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-4">
                  <FileIcon className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No documents found.</p>
                </div>
              )}
              {!docLoading && !docError &&
                documents.map((d) => {
                  const isActive = selectedDocument?.id === d.id;
                  return (
                    <div
                      key={d.id}
                      className={`group relative p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                        isActive 
                          ? "bg-primary/10 border-primary/30 shadow-sm" 
                          : "bg-card hover:bg-accent/50 border-transparent hover:border-border"
                      }`}
                      onClick={() => {
                        setSelectedDocument(d);
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-primary transition-colors"}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                            {d.file_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-muted/80 text-muted-foreground uppercase tracking-wider">
                              {d.status}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70 truncate">
                              {new Date(d.uploaded_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>

        <div className="p-4 border-t border-border/40 mt-auto bg-card/60 backdrop-blur-md">
          <button
            onClick={handleUploadClick}
            disabled={uploading || !selectedConversation}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm ${
              uploading || !selectedConversation 
                ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border/50' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload PDF</>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Area */}
      {selectedConversation ? (
        <div className={`flex flex-col lg:flex-row flex-1 overflow-hidden p-2 lg:p-6 gap-3 lg:gap-6 ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
          {/* Document Preview Area */}
          <div className="flex flex-col h-[35%] lg:h-full w-full lg:w-5/12 lg:max-w-2xl bg-card border border-border/40 shadow-xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl">
            <div className="px-4 py-3 bg-muted/30 border-b border-border/40 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">
                  {selectedDocument?.file_name || 'No Document'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 bg-muted/10 relative p-1 pb-0">
              {selectedDocument ? (
                selectedDocument.url ? (
                  <iframe
                    key={selectedDocument.url}
                    src={selectedDocument.url}
                    className="w-full h-full rounded-xl rounded-b-none border border-border/50 shadow-sm bg-white"
                    title={selectedDocument.file_name}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <div className="p-4 bg-background rounded-full border border-border shadow-sm">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No preview available.</p>
                  </div>
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <div className="p-4 bg-background rounded-full border border-border shadow-sm">
                    <FileIcon className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-sm font-medium">Select a document to preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col bg-card/60 backdrop-blur-2xl border border-border/50 shadow-xl rounded-2xl overflow-hidden relative group transition-all duration-300">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />
            
            <div className="px-3 md:px-5 py-3 md:py-4 border-b border-border/40 bg-card/50 backdrop-blur-xl flex items-center justify-between z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-muted text-muted-foreground mr-1"
                  aria-label="Open Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="p-2 bg-primary/10 text-primary rounded-xl hidden sm:flex">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate text-sm md:text-base">{selectedConversation.title}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                    AI Online
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar z-10"
            >
              {messagesLoading && messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">Loading history...</span>
                </div>
              )}
              {messagesError && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20 mx-auto max-w-md">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="leading-relaxed">{messagesError}</p>
                </div>
              )}
              {!messagesLoading && !messagesError && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-sm mx-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite]"></div>
                    <div className="relative bg-background border border-border/50 p-6 rounded-3xl shadow-lg">
                      <BotMessageSquare className="w-12 h-12 text-primary mx-auto" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">How can I help you today?</h3>
                    <p className="text-sm text-muted-foreground">Ask questions about your uploaded PDFs, request summaries, or extract key insights.</p>
                  </div>
                </div>
              )}

              {/* Message List */}
              <div className="space-y-6 pb-4">
                {[...messages]
                  .sort((a, b) => {
                    const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return ta - tb;
                  })
                  .map((msg, idx) => {
                    const senderRaw = (msg.sender ?? msg.role ?? 'ai').toLowerCase();
                    const isUser = senderRaw === 'user';
                    const content = msg.content ?? msg.text ?? msg.message ?? msg.body ?? '';
                    const isLoadingMsg = !!msg?.loading;
                    
                    return (
                      <div key={msg.id || idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-[85%] md:max-w-[75%] group/msg flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                            isUser ? 'bg-purple-600 text-white' : 'bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 backdrop-blur-md'
                          }`}>
                            {isUser ? <span className="text-xs font-bold">U</span> : <Bot className="w-4 h-4 text-primary" />}
                          </div>
                          
                          {/* Bubble */}
                          <div className={`p-4 rounded-2xl shadow-sm relative ${
                            isUser 
                              ? 'bg-purple-600 text-white shadow-md rounded-tr-sm' 
                              : 'bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 text-gray-800 dark:text-gray-100 rounded-tl-sm shadow-sm backdrop-blur-md'
                          }`}>
                            {isLoadingMsg ? (
                              <div className="flex space-x-1.5 items-center h-6 px-2 text-primary">
                                <span className="animate-[bounce_1s_infinite_0ms]">.</span>
                                <span className="animate-[bounce_1s_infinite_150ms]">.</span>
                                <span className="animate-[bounce_1s_infinite_300ms]">.</span>
                              </div>
                            ) : (
                              <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                                {content || <span className="opacity-50 italic">Empty message</span>}
                              </div>
                            )}
                            
                            {/* Timestamp (hover) */}
                            {msg.timestamp && (
                              <div className={`absolute bottom-1 text-[10px] opacity-0 group-hover/msg:opacity-100 transition-opacity whitespace-nowrap ${
                                isUser ? '-left-16 text-muted-foreground' : '-right-16 text-muted-foreground'
                              }`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} className="h-px" />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-background/40 backdrop-blur-md border-t border-border/40 z-10">
              <div className="relative mx-auto flex items-end gap-2 bg-card rounded-xl md:rounded-2xl border border-border shadow-sm p-1 md:p-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all duration-300">
                <textarea
                  rows={1}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent resize-none border-0 px-2 md:px-4 py-2 md:py-3 min-h-[44px] md:min-h-[52px] max-h-32 focus:outline-none focus:ring-0 text-sm md:text-[15px] text-foreground placeholder:text-muted-foreground/70 custom-scrollbar"
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                  }}
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
                  className={`p-2.5 md:p-3 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 mb-0.5 mr-0.5 ${
                    sending || !chatInput.trim() 
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
                      : 'bg-primary text-primary-foreground shadow-[0_2px_10px_rgba(71,19,150,0.3)] hover:shadow-[0_4px_15px_rgba(71,19,150,0.4)] hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {sending ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
              <div className="text-center mt-1.5 md:mt-2">
                <p className="text-[9px] md:text-[11px] text-muted-foreground/60 hidden sm:block">PDFier AI can make mistakes. Consider verifying important information.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-transparent">
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px] mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen" />
          </div>
          
          <div className="relative z-10 bg-card/60 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-3xl p-10 lg:p-16 max-w-2xl w-full text-center">
            <div className="mx-auto mb-8 relative w-24 h-24">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite]"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl shadow-xl rotate-3 transform hover:rotate-6 transition-transform duration-500 flex items-center justify-center">
                <BotMessageSquare className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              Welcome to PDFier AI
            </h2>
            <p className="text-base text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
              Experience the next generation of document interaction. Upload your PDFs, ask questions, and unlock insights instantly with our powerful AI assistant.
            </p>
            
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" />
              Start New Conversation
            </button>
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-0 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-muted/20">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                New Conversation
              </h3>
              <button
                className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
                onClick={() => setShowNewConversationModal(false)}
                disabled={isCreating}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateConversation} className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Conversation Title</label>
                <input
                  type="text"
                  value={conversationTitle}
                  onChange={(e) => setConversationTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g., Financial Report Analysis 2024"
                  required
                  autoFocus
                  disabled={isCreating}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewConversationModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground rounded-xl transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-xl shadow-md transition-all flex items-center gap-2 ${
                    isCreating || !conversationTitle.trim() 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                  disabled={isCreating || !conversationTitle.trim()}
                >
                  {isCreating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    'Create Conversation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
