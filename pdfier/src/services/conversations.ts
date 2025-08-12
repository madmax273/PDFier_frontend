import Cookies from 'js-cookie';

export type Conversation = {
  id: string;
  user_id: string;
  collection_id: string;
  title: string;
  created_at: string;
  last_active_at: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchConversations(collectionId: string): Promise<Conversation[]> {
  if (!BACKEND_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  const accessToken = Cookies.get('accessToken');

  const url = `${BACKEND_URL}/api/v1/conversations?collection_id=${encodeURIComponent(collectionId)}`;
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
    throw new Error(`Failed to fetch conversations: ${res.status} ${text}`);
  }
  const data = await res.json();
  // Normalize to array shape
  if (Array.isArray(data)) return data as Conversation[];
  if (data && Array.isArray(data.data)) return data.data as Conversation[];
  return [] as Conversation[];
}
