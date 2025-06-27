"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Sparkles,
  Settings,
  HelpCircle,
  FilePlus,
  ArrowRightLeft,
  Minimize2,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  Sigma,
} from "lucide-react";

// In sidebar.tsx
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse: () => void;  // Add this line
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, collapsed, onCollapse }) => {
  const pathname = usePathname();


const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload PDF", href: "/upload", icon: FilePlus },
    { name: "All PDF Tools", href: "/tools", icon: FileText },
    { name: "My Documents", href: "/documents", icon: FileText },
    { name: "Merge PDF", href: "/tools/merge", icon: ArrowRightLeft },
    { name: "Compress PDF", href: "/tools/compress", icon: Minimize2 },
    { name: "Protect PDF", href: "/tools/protect", icon: Lock },
    { name: "OCR & AI", href: "/tools/ocr-ai", icon: Sigma },
    { name: "Chat with PDF (AI)", href: "/chat-ai", icon: MessageSquare },
];

const bottomNavItems = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help & Support", href: "/help", icon: HelpCircle },
];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 ${
          collapsed ? "w-20" : "w-64"
        } bg-[#471396] dark:bg-[#471396] border-r border-gray-200 dark:border-gray-700 flex flex-col z-40 transform md:translate-x-0 transition-all duration-200 ease-in-out h-full`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white-700">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2"
          >
            <img
              src="/images/PDFier_logo.png"
              className="h-8 w-8"
              alt="PDFier Logo"
            />
            {!collapsed && (
              <span className="text-xl font-semibold dark:text-white">
                PDFier
              </span>
            )}
          </Link>
          {!collapsed && (
            <X size={25} onClick={onCollapse} className="text-gray-600 hover:text-white" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    collapsed ? "" : "mr-3"
                  } ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  aria-hidden="true"
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-white dark:border-white">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    collapsed ? "" : "mr-3"
                  } ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  aria-hidden="true"
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {/* Collapse button */}
          <button
            
            onClick={onCollapse}
            className={`w-full mt-2 flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            } px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200`}
          >
            <div className="flex items-center">
              {collapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Collapse</span>
                </>
              )}
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
