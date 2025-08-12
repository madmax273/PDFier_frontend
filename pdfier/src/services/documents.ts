import Cookies from 'js-cookie';

export interface DocumentItem {
  id: string;
  file_name: string;
  uploaded_at: string;
  status: string;
  storage_path?: string;
  url?: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchDocuments(collectionId: string): Promise<DocumentItem[]> {
  if (!BACKEND_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  const accessToken = Cookies.get('accessToken');
  const base = BACKEND_URL.replace(/\/$/, '');
  const candidates = [
    `${base}/api/v1/documents?collection_id=${encodeURIComponent(collectionId)}`,
    `${base}/documents?collection_id=${encodeURIComponent(collectionId)}`,
  ];

  let lastError: any = null;
  for (const url of candidates) {
    try {
      // Debug: show which URL we are trying
      try { console.debug('[documents] trying:', url); } catch {}
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
        try { console.debug('[documents] failed:', `${res.status} ${text}`); } catch {}
        // Try next on 404; abort on 401/403 or 5xx? we'll continue to try all
        continue;
      }
      const data = await res.json();
      try { console.debug('[documents] success from:', url); } catch {}
      if (Array.isArray(data)) return data as DocumentItem[];
      if (data && Array.isArray(data.data)) return data.data as DocumentItem[];
      // If shape unexpected, continue trying others
      lastError = new Error(`Unexpected response shape from ${url}`);
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  throw lastError ?? new Error('Failed to fetch documents: unknown error');
}

export async function uploadDocument(file: File, collectionId: string): Promise<any> {
  if (!BACKEND_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  if (!file) throw new Error('No file provided');
  const accessToken = Cookies.get('accessToken');
  const base = BACKEND_URL.replace(/\/$/, '');
  const candidates = [
    `${base}/api/v1/documents/upload?collection_id=${encodeURIComponent(collectionId)}`,
  ];

  const formData = new FormData();
  formData.append('file', file);

  let lastError: any = null;
  for (const url of candidates) {
    try {
      try { console.debug('[upload] trying:', url); } catch {}
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          // Do NOT set Content-Type; browser will set multipart boundary
        } as any,
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        lastError = new Error(`Failed ${url}: ${res.status} ${text}`);
        try { console.debug('[upload] failed:', `${res.status} ${text}`); } catch {}
        continue;
      }
      const data = await res.json().catch(() => ({}));
      try { console.debug('[upload] success from:', url); } catch {}
      return data;
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }
  throw lastError ?? new Error('Failed to upload document');
}
