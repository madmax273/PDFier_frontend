// components/Header.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Settings  } from 'lucide-react';

  
const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    // Implement your logout logic here
    // If using next-auth:
    // await signOut({ callbackUrl: '/login' });
    // Or if managing session manually:
    // Call your backend logout API
    // Redirect user
    console.log("Logging out..."); // Placeholder
  };

  return (
    <header className="bg-[#471396] border-gray-200 dark:bg-[#471396] py-3 px-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between w-full h-full">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">PDFier</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="hidden md:block bg-[#A294F9] hover:bg-[#A294F9]/90 dark:bg-[#A294F9] dark:hover:bg-[#A294F9]/90 text-white font-semibold py-2 border border-[#A294F9] px-4 rounded shadow-sm">
            Login
          </Link>
          <Link href="/signup" className="hidden md:block bg-[#A294F9] hover:bg-[#A294F9]/90 dark:bg-[#A294F9] dark:hover:bg-[#A294F9]/90 text-white font-semibold py-2 border border-[#A294F9] px-4 rounded shadow-sm">
            Sign up
          </Link>
          <div className="relative" onClick={handleDropdown}>
            <User 
              size={20} 
              className='rounded-full hover:shadow-md hover:shadow-gray-500/50'
            />
            {isDropdownOpen && (
              <div className="fixed inset-0 h-full w-full" onClick={handleDropdown} />
            )}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Dashboard
                </Link>
                <Link href="/tools" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Tools
                </Link>
                <Link href="/documents" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Documents
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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