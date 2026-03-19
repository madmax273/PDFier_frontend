"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/AuthStore";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    // Prevent double-execution in React strict mode
    if (isMounted.current) return;
    isMounted.current = true;

    const code = searchParams.get("code");
    
    if (!code) {
      setError("No authorization code found in the URL.");
      return;
    }

    const authenticateWithGoogle = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (response.ok) {
          login(data.user, data.refresh_token, data.access_token);
          // Redirect to dashboard on success
          setTimeout(() => {
            router.replace('/dashboard');
          }, 500);
        } else {
          setError(data.detail || "Authentication failed. Please try again.");
          setTimeout(() => {
             router.replace('/login');
          }, 3000);
        }
      } catch (err) {
        setError("Network error during authenticating with Google.");
        setTimeout(() => {
             router.replace('/login');
        }, 3000);
      }
    };

    authenticateWithGoogle();
  }, [searchParams, login, router]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary shadow-inner border border-primary/20">
          <Sparkles size={32} className="absolute text-primary" />
        </div>
      </div>
      
      {error ? (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl text-sm font-medium border bg-destructive/10 text-destructive border-destructive/20 max-w-sm text-center"
        >
          {error}
          <p className="mt-2 text-xs opacity-80">Redirecting back to login...</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Authenticating with Google...
          </h2>
          <p className="text-muted-foreground mt-2">
            Please wait while we secure your session.
          </p>
        </motion.div>
      )}
    </div>
  );
}
