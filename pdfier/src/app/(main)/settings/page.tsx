"use client";

import { useState } from 'react';
import { Settings, User, Lock, Bell, Moon, Sun, Palette, Shield, CreditCard, LogOut, ChevronRight, Home } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('system');
  const [activeTab, setActiveTab] = useState('account');

  const settingsTabs = [
    { id: 'account', label: 'Account', icon: <User className="h-5 w-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-5 w-5" /> },
  ];

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    action, 
    rightComponent 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <div 
      className="flex items-center justify-between p-5 hover:bg-secondary/40 transition-colors cursor-pointer group rounded-xl"
      onClick={action}
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary transition-transform group-hover:scale-110">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {rightComponent}
    </div>
  );

  const Switch = ({ enabled, setEnabled }: { enabled: boolean; setEnabled: (enabled: boolean) => void }) => (
    <button
      type="button"
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      onClick={() => setEnabled(!enabled)}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );

  const ThemeOption = ({ theme, currentTheme, setTheme }: { theme: string; currentTheme: string; setTheme: (t: string) => void }) => {
    const isSelected = currentTheme === theme;
    const displayName = theme.charAt(0).toUpperCase() + theme.slice(1);
    
    return (
      <div 
        className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-primary bg-primary/10 shadow-md transform -translate-y-1' 
            : 'border-border/50 bg-secondary/50 hover:border-primary/50 hover:bg-secondary'
        }`}
        onClick={() => setTheme(theme)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">{displayName}</span>
          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/50'
          }`}>
             {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
          </div>
        </div>
      </div>
    );
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="text-sm font-medium text-muted-foreground mb-6 flex items-center space-x-2 max-w-5xl mx-auto">
        <Link href="/" className="hover:text-foreground transition-colors">
          <Home size={16} />
        </Link>
        <ChevronRight size={16} />
        <span className="text-foreground">Settings</span>
      </nav>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto">
        <motion.div variants={itemVariants} className="mb-10 flex items-center space-x-4">
          <div className="p-4 bg-primary/10 rounded-2xl shadow-inner border border-primary/20">
            <Settings className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your account preferences and settings</p>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <motion.div variants={itemVariants} className="w-full md:w-64 flex-shrink-0">
            <div className="bg-card glass-panel rounded-3xl shadow-lg border border-border/50 overflow-hidden sticky top-24">
              <div className="p-3 space-y-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span className={`${activeTab === tab.id ? 'opacity-100' : 'opacity-70'} transition-opacity`}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Panel */}
          <motion.div variants={itemVariants} className="flex-1 space-y-8">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-card glass-panel rounded-3xl shadow-lg border border-border/50 overflow-hidden">
                  <div className="p-6 border-b border-border/50 bg-secondary/30">
                    <h2 className="text-xl font-bold text-foreground">Account Information</h2>
                  </div>
                  <div className="p-2 space-y-2">
                    <SettingItem 
                      icon={<User className="h-6 w-6" />}
                      title="Profile"
                      description="Update your personal information"
                    />
                    <SettingItem 
                      icon={<Lock className="h-6 w-6" />}
                      title="Change Password"
                      description="Update your password"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="bg-card glass-panel rounded-3xl shadow-lg border border-border/50 overflow-hidden">
                  <div className="p-6 border-b border-border/50 bg-secondary/30">
                    <h2 className="text-xl font-bold text-foreground">Theme Selection</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ThemeOption theme="light" currentTheme={selectedTheme} setTheme={setSelectedTheme} />
                      <ThemeOption theme="dark" currentTheme={selectedTheme} setTheme={setSelectedTheme} />
                      <ThemeOption theme="system" currentTheme={selectedTheme} setTheme={setSelectedTheme} />
                    </div>
                  </div>
                </div>

                <div className="bg-card glass-panel rounded-3xl shadow-lg border border-border/50 overflow-hidden">
                  <div className="p-6 border-b border-border/50 bg-secondary/30">
                    <h2 className="text-xl font-bold text-foreground">Display Preferences</h2>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/40 transition-colors">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Dark mode toggle</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Toggle between light and dark backgrounds.</p>
                      </div>
                      <Switch enabled={darkMode} setEnabled={setDarkMode} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="bg-card glass-panel rounded-3xl shadow-lg border border-border/50 overflow-hidden">
                  <div className="p-6 border-b border-border/50 bg-secondary/30">
                    <h2 className="text-xl font-bold text-foreground">Email Notifications</h2>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/40 transition-colors">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Marketing & Updates</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Receive emails about new tools and promotions.</p>
                      </div>
                      <Switch enabled={emailNotifications} setEnabled={setEmailNotifications} />
                    </div>
                  </div>
                </div>

                <div className="bg-card glass-panel rounded-3xl shadow-lg border border-border/50 overflow-hidden">
                  <div className="p-6 border-b border-border/50 bg-secondary/30">
                    <h2 className="text-xl font-bold text-foreground">In-app Alerts</h2>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/40 transition-colors">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Feature Announcements</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Show notifications when new capabilities drop.</p>
                      </div>
                      <Switch enabled={emailNotifications} setEnabled={setEmailNotifications} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing Settings */}
            {activeTab === 'billing' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-card glass-panel rounded-3xl shadow-lg border border-border/50 overflow-hidden">
                  <div className="p-6 border-b border-border/50 bg-secondary/30">
                    <h2 className="text-xl font-bold text-foreground">Billing Information</h2>
                  </div>
                  <div className="p-12">
                    <div className="text-center">
                      <div className="inline-flex justify-center items-center h-20 w-20 rounded-full bg-secondary text-muted-foreground mb-6 shadow-inner mx-auto">
                        <CreditCard className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">No payment method</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto mb-8">Add a payment method to seamlessly upgrade to PRO and remove PDF processing limits.</p>
                      <button className="px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-2xl shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all">
                        Add Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="bg-card glass-panel rounded-3xl shadow-lg border border-border/50 overflow-hidden">
                  <div className="p-6 border-b border-border/50 bg-secondary/30">
                    <h2 className="text-xl font-bold text-foreground">Security Settings</h2>
                  </div>
                  <div className="p-2 space-y-2">
                    <SettingItem 
                      icon={<Shield className="h-6 w-6" />}
                      title="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      rightComponent={
                        <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
                          Set up
                        </span>
                      }
                    />
                    <SettingItem 
                      icon={<Lock className="h-6 w-6" />}
                      title="Change Password"
                      description="Update your account password"
                    />
                    <SettingItem 
                      icon={<LogOut className="h-6 w-6" />}
                      title="Log out of all devices"
                      description="Sign out of all active sessions online"
                    />
                  </div>
                </div>

                <div className="bg-destructive/5 glass-panel rounded-3xl shadow-md border border-destructive/20 overflow-hidden">
                  <div className="p-8">
                    <h3 className="text-lg font-bold text-destructive mb-2">Danger Zone</h3>
                    <p className="text-destructive/80 mb-6">
                      Deleting your account will permanently remove all your data, past processed files, and billing profiles. This action cannot be undone.
                    </p>
                    <button className="px-6 py-3 text-sm font-bold text-destructive-foreground bg-destructive rounded-xl hover:bg-destructive/90 hover:-translate-y-0.5 shadow-lg shadow-destructive/20 transition-all">
                      Delete Account Permanently
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;