// types/auth.ts (Create this file if it doesn't exist, or update your existing one)

export interface UsageMetrics {
    pdf_processed_today: number;
    pdf_processed_limit_daily: number;
    rag_queries_this_month: number;
    rag_queries_limit_monthly: number;
    rag_indexed_documents_count: number;
    rag_indexed_documents_limit: number;
    word_conversions_today: number;
    word_conversions_limit_daily: number;
    last_quota_reset_date: string; // ISO string
  }
  
  export interface User {
    name: string;
    verified: boolean;
    ip_address?: string; // Optional if not always present
    plan_type: 'basic' | 'premium'; // Explicitly basic or premium for logged-in users
    usage_metrics: UsageMetrics;
    created_at: string; // ISO string
    updated_at: string; // ISO string
  }
  
  export interface GuestUser {
    id: 'guest'; // A fixed ID for guest users
    name: 'Guest';
    email: 'guest@example.com'; // Or a placeholder email
    verified: false;
    plan_type: 'guest';
    // Guest users will have a simplified usage_metrics for frontend display
    usage_metrics: {
      pdf_processed_limit_daily: number;
      rag_queries_limit_monthly: number;
      rag_indexed_documents_limit: number;
      word_conversions_limit_daily: number;
    };
  }
  
  // Union type for the user state in the store
  export type AuthUser = User | GuestUser | null;