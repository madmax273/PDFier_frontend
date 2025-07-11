"use client";

import { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, FileText, ChevronDown, ChevronUp } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

const HelpPage = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I convert a document to PDF?",
      answer: "To convert a document to PDF, simply click on the 'Upload' button, select your file, and choose 'Convert to PDF'. The converted file will be available for download once the process is complete."
    },
    {
      question: "What file formats can I convert to PDF?",
      answer: "PDFier supports a wide range of file formats including DOCX, DOC, XLSX, XLS, PPTX, PPT, JPG, PNG, and more. You can find the complete list on our pricing page."
    },
    {
      question: "Is there a file size limit?",
      answer: "Yes, the maximum file size for free accounts is 50MB. For larger files, please consider upgrading to our premium plan."
    },
    {
      question: "How secure are my documents?",
      answer: "Your privacy is our top priority. All uploaded files are automatically deleted from our servers after 24 hours. We use 256-bit SSL encryption to protect your data during transfer and storage."
    },
    {
      question: "Can I edit a PDF after conversion?",
      answer: "Yes, you can edit your PDFs using our built-in PDF editor. Simply select the 'Edit PDF' option after conversion to make changes to your document."
    }
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-[#471396] text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Find answers to common questions or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search help articles..."
                className="w-full px-6 py-4 rounded-lg border-0 focus:ring-2 focus:ring-white/20 bg-white/10 text-white placeholder-white/70"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-[#471396] px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Topics */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FileText className="h-6 w-6 text-[#471396]" />,
                title: "Getting Started",
                description: "Learn how to create and manage your PDFs"
              },
              {
                icon: <FileText className="h-6 w-6 text-[#471396]" />,
                title: "Account & Billing",
                description: "Manage your subscription and payment methods"
              },
              {
                icon: <FileText className="h-6 w-6 text-[#471396]" />,
                title: "Troubleshooting",
                description: "Find solutions to common issues"
              },
              {
                icon: <FileText className="h-6 w-6 text-[#471396]" />,
                title: "Privacy & Security",
                description: "Learn how we protect your data"
              },
              {
                icon: <FileText className="h-6 w-6 text-[#471396]" />,
                title: "API Documentation",
                description: "Integrate PDFier into your applications"
              },
              {
                icon: <FileText className="h-6 w-6 text-[#471396]" />,
                title: "Feature Requests",
                description: "Suggest new features for PDFier"
              }
            ].map((topic, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 rounded-lg bg-[#471396]/10 flex items-center justify-center mb-4">
                  {topic.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{topic.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  {activeFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 pt-0 text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-[#471396] to-[#6B46C1] rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Our support team is here to help you with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:support@pdfier.com" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#471396] rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Email Support
              </a>
              <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                Live Chat
              </button>
            </div>
            <p className="mt-6 text-white/80">
              We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;