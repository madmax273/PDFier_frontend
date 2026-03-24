"use client";

import React from "react";
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
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  collapsed: boolean;
  onCollapse: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, collapsed, onCollapse, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Documents", href: "/documents", icon: FileText },
    { name: "Chat with PDF (AI)", href: "/chat-ai", icon: MessageSquare },
    { name: "Merge PDF", href: "/tools/merge", icon: ArrowRightLeft },
    { name: "Compress PDF", href: "/tools/compress", icon: Minimize2 },
    { name: "Protect PDF", href: "/tools/protect", icon: Lock },
    { name: "All Tools", href: "/tools", icon: Sparkles },
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col z-40 transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform shadow-2xl shadow-primary/5 ${
          collapsed ? "w-20" : "w-64"
        } ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center space-x-2 group shrink-0">
            <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Sparkles size={18} className="absolute text-primary" />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 truncate">
                PDFier
              </span>
            )}
          </Link>
          {!collapsed && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground md:hidden transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5 scrollbar-none">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`group relative flex items-center ${
                  collapsed ? "justify-center" : "justify-start"
                } px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95"
                }`}
              >
                <item.icon
                  className={`shrink-0 w-5 h-5 transition-transform duration-200 ${
                    !isActive && "group-hover:scale-110"
                  } ${collapsed ? "" : "mr-3"} ${
                    isActive ? "text-primary-foreground" : ""
                  }`}
                  aria-hidden="true"
                />
                {!collapsed && <span className="text-sm font-medium tracking-wide truncate">{item.name}</span>}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-14 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-border/50 space-y-1.5 bg-card/50">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`group relative flex items-center ${
                  collapsed ? "justify-center" : "justify-start"
                } px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${collapsed ? "" : "mr-3"} ${
                    isActive ? "text-primary" : ""
                  }`}
                  aria-hidden="true"
                />
                {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                
                {/* Tooltip */}
                {collapsed && (
                  <div className="absolute left-14 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Collapse toggle */}
          <button
            onClick={onCollapse}
            className={`w-full mt-2 flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            } px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-secondary hover:text-foreground transition-all duration-200 active:scale-95`}
          >
            <div className="flex items-center">
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5 mr-3" />
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
