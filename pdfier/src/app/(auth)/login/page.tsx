"use client";
import { FcGoogle } from "react-icons/fc";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { useAuthStore } from "@/store/AuthStore";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username, password }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        login(data.user, data.refresh_token, data.access_token);
        setMessage({ type: 'success', text: data.message || 'Login successful!' });
        
        setTimeout(() => {
          router.replace('/dashboard'); 
        }, 800);
      } else {
        const errorMessage = Array.isArray(data.detail) 
          ? data.detail.map((err: any) => err.msg).join('. ') 
          : (data.detail?.message || data.detail || 'Login failed. Please check your credentials.');
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setIsLoading(false);
      setMessage({ type: 'error', text: 'Network error or unable to connect to the server.' });
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div variants={formVariants} initial="hidden" animate="show" className="w-full">
      <motion.div variants={formVariants} className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary shadow-inner border border-primary/20">
            <Sparkles size={24} className="absolute text-primary" />
          </div>
          <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 tracking-tight">
            PDFier
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">Sign in to your PDFier account</p>
      </motion.div>

      {message && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 mb-6 rounded-xl text-sm font-medium border ${
                message.type === 'success' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}
        >
          {message.text}
        </motion.div>
      )}

      <form className="space-y-5" onSubmit={handleLogin}>
        <motion.div variants={formVariants} className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </motion.div>

        <motion.div variants={formVariants} className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </motion.div>

        <motion.div variants={formVariants} className="pt-2">
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-primary/40 hover:shadow-xl hover:-translate-y-1"
            >
                {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...</>
                ) : (
                    <>Sign in <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
            </Button>
        </motion.div>
      </form>

      <motion.div variants={formVariants} className="mt-8">
        <div className="flex items-center justify-center">
          <div className="flex-grow border-t border-border/50"></div>
          <span className="mx-4 text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            Or continue with
          </span>
          <div className="flex-grow border-t border-border/50"></div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google/login`;
            }}
            className="w-full py-6 rounded-xl border-border/50 hover:bg-secondary/80 focus:ring-2 focus:ring-primary transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            disabled={isLoading}
          >
            <FcGoogle className="h-6 w-6 mr-2" /> Continue with Google
          </Button>
        </div>
      </motion.div>

      <motion.div variants={formVariants} className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Create an account
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
