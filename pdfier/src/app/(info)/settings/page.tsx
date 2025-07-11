"use client";

import { useState } from 'react';
import { Settings, User, Lock, Bell, Moon, Sun, Palette, Shield, CreditCard, LogOut } from 'lucide-react';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
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
      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={action}
    >
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-[#471396]/10 rounded-lg text-[#471396] dark:text-[#A294F9]">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {rightComponent}
    </div>
  );

  const Switch = ({ enabled, setEnabled }: { enabled: boolean; setEnabled: (enabled: boolean) => void }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#471396] focus:ring-offset-2 ${enabled ? 'bg-[#471396]' : 'bg-gray-200 dark:bg-gray-700'}`}
      onClick={() => setEnabled(!enabled)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );

  const ThemeOption = ({ theme, currentTheme, setTheme }: { theme: string; currentTheme: string; setTheme: (t: string) => void }) => {
    const isSelected = currentTheme === theme;
    const displayName = theme.charAt(0).toUpperCase() + theme.slice(1);
    
    return (
      <div 
        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
          isSelected 
            ? 'border-[#471396] bg-[#471396]/10' 
            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        onClick={() => setTheme(theme)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayName}</span>
          {isSelected && <div className="h-2 w-2 rounded-full bg-[#471396]" />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-[#471396] text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Account Settings</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-56 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#471396]/10 text-[#471396] dark:bg-[#471396]/20 dark:text-[#A294F9]'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className={`${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="flex-1">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <SettingItem 
                      icon={<User className="h-5 w-5" />}
                      title="Profile"
                      description="Update your personal information"
                    />
                    <SettingItem 
                      icon={<Lock className="h-5 w-5" />}
                      title="Change Password"
                      description="Update your password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Theme</h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <ThemeOption theme="light" currentTheme={selectedTheme} setTheme={setSelectedTheme} />
                      <ThemeOption theme="dark" currentTheme={selectedTheme} setTheme={setSelectedTheme} />
                      <ThemeOption theme="system" currentTheme={selectedTheme} setTheme={setSelectedTheme} />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Display</h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                      </div>
                      <Switch enabled={darkMode} setEnabled={setDarkMode} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Notifications</h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Receive email notifications</p>
                      </div>
                      <Switch enabled={emailNotifications} setEnabled={setEmailNotifications} />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">In-app Notifications</h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Show notifications</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enable in-app notifications</p>
                      </div>
                      <Switch enabled={emailNotifications} setEnabled={setEmailNotifications} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Settings */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Information</h2>
                  </div>
                  <div className="p-5">
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">No payment method</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Add a payment method to get started</p>
                      <button className="mt-4 px-4 py-2 bg-[#471396] text-white text-sm font-medium rounded-lg hover:bg-[#3a0f75] transition-colors">
                        Add Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <SettingItem 
                      icon={<Shield className="h-5 w-5" />}
                      title="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      rightComponent={
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Set up
                        </span>
                      }
                    />
                    <SettingItem 
                      icon={<Lock className="h-5 w-5" />}
                      title="Change Password"
                      description="Update your account password"
                    />
                    <SettingItem 
                      icon={<LogOut className="h-5 w-5" />}
                      title="Log out of all devices"
                      description="Sign out of all active sessions"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
                  <div className="p-5">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Danger Zone</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Deleting your account will permanently remove all your data.
                    </p>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;