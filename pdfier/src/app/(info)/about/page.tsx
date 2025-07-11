"use client";

import { Users, FileText, Zap, Lock, Settings } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Easy PDF Management",
      description: "Create, edit, and manage your PDFs with our intuitive interface."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Process your documents quickly with our optimized PDF engine."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your documents are encrypted and never stored longer than necessary."
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Powerful Tools",
      description: "Access a suite of PDF tools designed to make your work easier."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-[#471396] text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About PDFier</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Empowering users with simple, powerful PDF tools since 2023
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Our Story */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              PDFier was born out of a simple idea: PDF tools should be accessible, powerful, and easy to use. 
              Frustrated by clunky interfaces and unnecessary complexity, our team set out to create a better solution.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Today, PDFier serves thousands of users worldwide, helping them work with PDFs more efficiently. 
              We're committed to continuous improvement and adding features that make document management a breeze.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Why Choose PDFier?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="w-12 h-12 rounded-lg bg-[#471396]/10 flex items-center justify-center mb-4 text-[#471396] dark:text-[#A294F9]">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Team</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            We're a passionate team of developers and designers dedicated to creating the best PDF tools on the web.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Alex Johnson", role: "Founder & CEO" },
              { name: "Maria Garcia", role: "Lead Developer" },
              { name: "James Wilson", role: "UX Designer" },
              { name: "Sarah Chen", role: "Support Lead" }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Users className="h-12 w-12" />
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
