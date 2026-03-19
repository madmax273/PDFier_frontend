"use client";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useState } from "react";
import OtpInput from "@/components/auth/otp";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [user_id, setUser_id] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      setIsLoading(false);

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Signup successful! Please verify your email with the OTP.' });
        setUser_id(data.user_id);
        setShowOtpInput(true);
        setPassword('');
      } else {
        setMessage({ type: 'error', text: data.detail || 'Signup failed. Please try again.' });
      }

    } catch (error) {
      setIsLoading(false);
      setMessage({ type: 'error', text: 'Network error or unable to connect to the server.' });
    }
  };
   
  const handleVerifyOtp = async (otp: string, user_id: string) => {
    setMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, otp }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Account verified successfully! Redirecting to login...' });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.detail || 'OTP verification failed. Please try again.' });
      }
    } catch (error) {
      setIsLoading(false);
      setMessage({ type: 'error', text: 'Network error during OTP verification.' });
    }
  };

  const handleResendOtp = async (user_id: string, email: string) => {
    setMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, email }),
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'OTP resent successfully!' });
      } else {
        setMessage({ type: 'error', text: Array.isArray(data.detail) ? data.detail.map((err: any) => err.msg).join('. ') : (data.detail?.message || data.detail || 'Failed to resend OTP.') });
      }
    } catch (error) {
      setIsLoading(false);
      setMessage({ type: 'error', text: 'Network error during OTP resend.' });
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div variants={formVariants} initial="hidden" animate="show" className="w-full">
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

      {showOtpInput ? (
        <motion.div variants={formVariants}>
            <div className="text-center mb-8">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
                    <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Verify Email</h1>
                <p className="text-muted-foreground mt-2">We sent a verification code to your email.</p>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border/50">
               <OtpInput onVerify={handleVerifyOtp} onResend={handleResendOtp} email={email} user_id={user_id} />
            </div>
        </motion.div>
      ) : (
        <>
          <motion.div variants={formVariants} className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary shadow-inner border border-primary/20">
                <Sparkles size={24} className="absolute text-primary" />
              </div>
              <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 tracking-tight">
                PDFier
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Account</h1>
            <p className="text-muted-foreground mt-2">Join PDFier for advanced document tools</p>
          </motion.div>

          <form className="space-y-4" onSubmit={handleSignup}>
            <motion.div variants={formVariants} className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-foreground">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div variants={formVariants} className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email Address
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div variants={formVariants} className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Create a strong password"
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
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating account...</>
                    ) : (
                        <>Sign up <ArrowRight className="ml-2 h-5 w-5" /></>
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
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
