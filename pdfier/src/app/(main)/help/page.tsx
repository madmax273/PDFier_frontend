"use client";

import { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, FileText, ChevronDown, ChevronUp, ChevronRight, Home, Search, BookOpen, Shield, CreditCard, HelpCircle as HelpIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';

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

  const topics = [
    {
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: "Getting Started",
      description: "Learn how to create and manage your PDFs"
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Account & Billing",
      description: "Manage your subscription and payment methods"
    },
    {
      icon: <HelpIcon className="h-6 w-6 text-primary" />,
      title: "Troubleshooting",
      description: "Find solutions to common issues"
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Privacy & Security",
      description: "Learn how we protect your data"
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "API Documentation",
      description: "Integrate PDFier into your applications"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Feature Requests",
      description: "Suggest new features for PDFier"
    }
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
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
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="text-sm font-medium text-muted-foreground mb-6 flex items-center space-x-2 max-w-5xl mx-auto">
        <Link href="/" className="hover:text-foreground transition-colors">
          <Home size={16} />
        </Link>
        <ChevronRight size={16} />
        <span className="text-foreground">Help & Support</span>
      </nav>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl shadow-inner border border-primary/20 mb-6 transition-transform hover:scale-105">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground tracking-tight">How can we help you?</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support team.
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 max-w-xl mx-auto relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search help articles..."
                  className="w-full pl-12 pr-6 py-4 bg-card border-2 border-border/50 text-foreground rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm glass-panel"
                />
            </div>
        </motion.div>

        {/* Popular Topics */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                key={index}
                className="bg-card glass-panel rounded-2xl p-6 shadow-md border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {topic.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{topic.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-card glass-panel rounded-2xl overflow-hidden shadow-sm border border-border/50 transition-all hover:border-primary/50"
              >
                <button
                  className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg font-bold text-foreground">{faq.question}</span>
                  <div className={`p-1 rounded-full bg-secondary/50 text-muted-foreground transition-transform duration-300 ${activeFaq === index ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
                      <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-5 pt-0 text-muted-foreground leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div variants={itemVariants} className="relative overflow-hidden bg-primary rounded-3xl p-8 md:p-12 text-primary-foreground shadow-2xl">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-6 shadow-inner border border-white/20">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Still need help?</h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto font-medium">
              Our support team is here to help you with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:support@pdfier.com" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl font-bold shadow-lg hover:bg-gray-50 hover:-translate-y-1 transition-all"
              >
                <Mail className="h-5 w-5 mr-3" />
                Email Support
              </a>
              <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10 hover:-translate-y-1 transition-all">
                Live Chat
              </button>
            </div>
            <p className="mt-8 text-white/80 text-sm font-medium tracking-wide">
              We typically respond within 24 hours.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HelpPage;