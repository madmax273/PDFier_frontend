// components/Header.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
  
const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);

  const handleDropdown = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    logout();
    console.log("Logging out..."); // Placeholder
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsDropdownOpen(false), 500);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  return (
    <header className="bg-[#471396] border-gray-200 dark:bg-[#471396] py-2 px-4 md:px-6 h-14">
      <div className="flex flex-wrap items-center justify-between w-full h-full">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">PDFier</span>
        </Link>
        <div className="flex items-center space-x-4">
          {!isLoggedIn && <Link href="/login" className="hidden md:block bg-[#A294F9] hover:bg-[#A294F9]/90 dark:bg-[#A294F9] dark:hover:bg-[#A294F9]/90 text-white font-semibold py-2 border border-[#A294F9] px-4 rounded shadow-sm">
            Login
          </Link>}
          {!isLoggedIn && <Link href="/signup" className="hidden md:block bg-[#A294F9] hover:bg-[#A294F9]/90 dark:bg-[#A294F9] dark:hover:bg-[#A294F9]/90 text-white font-semibold py-2 border border-[#A294F9] px-4 rounded shadow-sm">
            Sign up
          </Link>}
          <div className="relative" >
            {isLoggedIn && <User 
              size={20} 
              className='rounded-full hover:shadow-md hover:shadow-gray-500/50'
              onMouseOver={handleDropdown}
            />}
            {isDropdownOpen && (
              <div className="fixed inset-0 h-full w-full" />
            )}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2" onMouseLeave={handleDropdownClose}>
                <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                  Dashboard
                </Link>
                <Link href="/tools" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                  Tools
                </Link>
                <Link href="/documents" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                  Documents
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                  Settings
                </Link>
                <button onClick={() => { handleLogout(); setTimeout(() => setIsDropdownOpen(false), 50); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;