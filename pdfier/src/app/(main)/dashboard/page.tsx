// app/(app)/dashboard/page.tsx
import React from 'react';
import Link from 'next/link';
import { FilePlus, MessageSquare, Minimize2, ArrowRightLeft, FileText } from 'lucide-react';

// This component will automatically be rendered inside app/(app)/layout.tsx
export default function DashboardPage() {
  return (
    <> {/* Fragment because this content is wrapped by the layout */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome To PDFier! 👋</h1>

      {/* AI Assistant Call-to-action */}
      <section className="hidden md:flex bg-white p-6 rounded-xl shadow-sm mb-8 flex justify-between">
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold mb-2">Unlock Insights with AI Chat!</h2>
          <p className="text-gray-600">Ask anything about your PDFs and get instant, intelligent answers.</p>
        </div>
        <div className="flex justify-end">
          <Link href="/chat-ai" className="bg-[#A294F9] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#A294F9]/90 transition-colors duration-200 flex items-center space-x-2">
            <MessageSquare size={20} />
            <span>Chat with a PDF now</span>
          </Link>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Action Card 1 */}
          <Link href="/upload" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-app-purple-200 transition-all duration-200 flex flex-col items-center text-center">
            <FilePlus size={36} className="text-[#471396] mb-3" />
            <h3 className="text-lg font-medium text-gray-800">Upload New PDF</h3>
            <p className="text-sm text-gray-500 mt-1">Get started with a fresh document.</p>
          </Link>

          {/* Quick Action Card 2 */}
          <Link href="/tools/merge" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-app-purple-200 transition-all duration-200 flex flex-col items-center text-center">
            <ArrowRightLeft size={36} className="text-[#471396] mb-3" />
            <h3 className="text-lg font-medium text-gray-800">Merge PDFs</h3>
            <p className="text-sm text-gray-500 mt-1">Combine multiple documents.</p>
          </Link>

          {/* Quick Action Card 3 */}
          <Link href="/tools/compress" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-app-purple-200 transition-all duration-200 flex flex-col items-center text-center">
            <Minimize2 size={36} className="text-[#471396] mb-3" />
            <h3 className="text-lg font-medium text-gray-800">Compress PDF</h3>
            <p className="text-sm text-gray-500 mt-1">Reduce file size without quality loss.</p>
          </Link>

          {/* Quick Action Card 4 (Placeholder for another common action) */}
          <Link href="/documents" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-app-purple-200 transition-all duration-200 flex flex-col items-center text-center">
            <FileText size={36} className="text-[#471396] mb-3" />
            <h3 className="text-lg font-medium text-gray-800">My Documents</h3>
            <p className="text-sm text-gray-500 mt-1">Access your saved PDFs.</p>
          </Link>
        </div>
      </section>

      {/* Recent Documents Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Documents</h2>
        {/* Placeholder for a list of recent documents */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <ul className="space-y-4">
            <li className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-[#471396]" />
                <span className="font-medium text-gray-700">Project_Report_v2.pdf</span>
                <span className="text-sm text-gray-500 ml-2"> (Merged, 2 days ago)</span>
              </div>
              <Link href="/documents/project-report-v2" className="text-app-purple-600 hover:underline text-sm">View</Link>
            </li>
            <li className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-[#471396]" />
                <span className="font-medium text-gray-700">Contract_Signed.pdf</span>
                <span className="text-sm text-gray-500 ml-2"> (Signed, 5 days ago)</span>
              </div>
              <Link href="/documents/contract-signed" className="text-app-purple-600 hover:underline text-sm">View</Link>
            </li>
            <li className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-[#471396]" />
                <span className="font-medium text-gray-700">Invoice_Q2_2025.pdf</span>
                <span className="text-sm text-gray-500 ml-2"> (Compressed, 1 week ago)</span>
              </div>
              <Link href="/documents/invoice-q2" className="text-app-purple-600 hover:underline text-sm">View</Link>
            </li>
          </ul>
          <div className="mt-4 text-right">
            <Link href="/documents" className="text-app-purple-500 hover:text-app-purple-600 font-medium">
              View All Documents &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}