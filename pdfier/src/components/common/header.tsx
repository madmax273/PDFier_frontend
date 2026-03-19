"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Settings, LayoutDashboard, FileText, Moon, Sun, Sparkles, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDropdownClose = () => setIsDropdownOpen(false);

  const handleLogout = async () => {
    await logout();
    handleDropdownClose();
    router.replace('/login');
  };

  return (
    <header className="py-2 px-4 md:px-6 h-16 relative z-30 flex items-center justify-between w-full">
      <div className="flex items-center md:hidden">
        {onMenuClick && (
          <button 
            onClick={onMenuClick} 
            className="mr-2 p-2 rounded-md text-foreground hover:bg-secondary transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
            <Sparkles size={18} className="absolute text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground truncate tracking-tight">
            PDFier
          </span>
        </Link>
      </div>

      <div className="flex flex-1 justify-end items-center space-x-3 sm:space-x-4">
        
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-3 pr-2 rounded-full border border-border/50 bg-card hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold tracking-tight text-foreground leading-none">{user?.name || 'User'}</span>
                <span className="text-[10px] uppercase font-bold text-primary mt-1 tracking-wider">{user?.plan_type || 'GUEST'} PLAN</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <User size={16} />
              </div>
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={handleDropdownClose}
                />
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border/50 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-border/50 mb-2 sm:hidden">
                    <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <div className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20 uppercase">
                      {user?.plan_type || 'GUEST'}
                    </div>
                  </div>
                  
                  <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors group" onClick={handleDropdownClose}>
                    <LayoutDashboard size={16} className="mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    Dashboard
                  </Link>
                  <Link href="/documents" className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors group" onClick={handleDropdownClose}>
                    <FileText size={16} className="mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    Documents
                  </Link>
                  <Link href="/settings" className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors group" onClick={handleDropdownClose}>
                    <Settings size={16} className="mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    Settings
                  </Link>
                  <div className="my-1 border-t border-border/50" />
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors focus:outline-none group"
                  >
                    <LogOut size={16} className="mr-3 text-destructive/70 group-hover:text-destructive transition-colors" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link 
              href="/login" 
              className="text-sm font-medium text-foreground hover:text-primary px-4 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 px-5 rounded-full shadow-md shadow-primary/20 transition-all hover:shadow-lg active:scale-95"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;