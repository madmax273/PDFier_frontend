import Cookies from 'js-cookie';

export interface MessageItem {
  id: string;
  conversation_id: string;
  timestamp?: string;
  // optional fields if backend provides them
  role?: 'user' | 'ai' | string;
  content?: string;
  text?: string;
  message?: string;
  sender?: string;
}

export interface ChatMessagePayload {
  query: string;
  collection_id: string;
  conversation_id?: string | null;
}

export async function sendChat(payload: ChatMessagePayload): Promise<any> {
  if (!BACKEND_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  if (!payload?.query || !payload?.collection_id) throw new Error('Missing query or collection_id');
  const accessToken = Cookies.get('accessToken');
  const base = BACKEND_URL.replace(/\/$/, '');
  const candidates = [
    `${base}/api/v1/chat`,
    `${base}/chat`,
  ];

  let lastError: any = null;
  for (const url of candidates) {
    try {
      try { console.debug('[chat] sending to:', url, payload); } catch {}
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        lastError = new Error(`Failed ${url}: ${res.status} ${text}`);
        try { console.debug('[chat] failed:', `${res.status} ${text}`); } catch {}
        continue;
      }
      const data = await res.json().catch(() => ({}));
      try { console.debug('[chat] success from:', url); } catch {}
      return data;
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }
  throw lastError ?? new Error('Failed to send chat message');
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export async function fetchMessages(conversationId: string): Promise<MessageItem[]> {
  if (!BACKEND_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  const accessToken = Cookies.get('accessToken');
  const base = BACKEND_URL.replace(/\/$/, '');

  // Try common candidates
  const candidates = [
    `${base}/api/v1/messages?conversation_id=${encodeURIComponent(conversationId)}`,
    `${base}/messages?conversation_id=${encodeURIComponent(conversationId)}`,
    `${base}/?conversation_id=${encodeURIComponent(conversationId)}`,
  ];

  let lastError: any = null;
  for (const url of candidates) {
    try {
      try { console.debug('[messages] trying:', url); } catch {}
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        lastError = new Error(`Failed ${url}: ${res.status} ${text}`);
        try { console.debug('[messages] failed:', `${res.status} ${text}`); } catch {}
        continue;
      }
      const data = await res.json();
      try { console.debug('[messages] success from:', url); } catch {}
      if (Array.isArray(data)) return data as MessageItem[];
      if (data && Array.isArray(data.data)) return data.data as MessageItem[];
      // Unexpected shape; continue trying others
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }
  throw lastError ?? new Error('Failed to fetch messages');
}
