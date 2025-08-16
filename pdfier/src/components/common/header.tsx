"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { useRouter } from 'next/navigation';
  
const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();

  const handleDropdown = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    handleDropdownClose();
    router.replace('/dashboard');
  };

  return (
    <header className="bg-[#471396] border-gray-200 dark:bg-[#471396] py-2 px-4 md:px-6 h-14 relative z-30">
      <div className="flex flex-wrap items-center justify-between w-full h-full">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">PDFier</span>
        </Link>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="relative">
              <div className="relative">
                <User 
                  size={20} 
                  className='rounded-full hover:shadow-md hover:shadow-gray-500/50 cursor-pointer text-white'
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
                {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50" 
                  onMouseLeave={handleDropdownClose}
                >
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={handleDropdownClose}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/tools" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={handleDropdownClose}
                  >
                    Tools
                  </Link>
                  <Link 
                    href="/documents" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={handleDropdownClose}
                  >
                    Documents
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={handleDropdownClose}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                  >
                    Log out
                  </button>
                </div>
              )}
              </div>
            </div>
          ) : (
            <>
              <Link 
                href="/login" 
                className="bg-[#A294F9] hover:bg-[#A294F9]/90 text-white font-semibold py-2 px-4 rounded shadow-sm transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-[#A294F9] hover:bg-[#A294F9]/90 text-white font-semibold py-2 px-4 rounded shadow-sm transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;