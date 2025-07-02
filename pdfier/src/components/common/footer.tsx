// components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-[#222831] border-gray-200 dark:bg-[#222831] py-3 px-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between w-full h-full">
        <div className="flex items-center justify-between w-full md:flex-1">
          {/* Copyright */}
          <div className="text-left text-white dark:text-white text-sm md:text-base">
            &copy; {currentYear} PDFier. All rights reserved.
          </div>

          {/* Social Media Icons */}
          <div className="hidden md:flex items-center justify-center space-x-6">
            <a href="https://twitter.com/PDFierApp" target="_blank" rel="noopener noreferrer" className="text-#F7F7F7 hover:text-#F7F7F7 dark:hover:text-#F7F7F7">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="https://www.linkedin.com/company/pdfier" target="_blank" rel="noopener noreferrer" className="text-#F7F7F7 hover:text-#F7F7F7 dark:hover:text-#F7F7F7">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="https://github.com/PDFier/pdfier" target="_blank" rel="noopener noreferrer" className="text-#F7F7F7 hover:text-#F7F7F7 dark:hover:text-#F7F7F7">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-center space-x-6 md:flex-1 md:justify-end">
          <Link href="/privacy" className="text-#F7F7F7 hover:text-#F7F7F7 dark:text-#F7F7F7 dark:hover:text-#F7F7F7 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-#F7F7F7 hover:text-#F7F7F7 dark:text-#F7F7F7 dark:hover:text-#F7F7F7 transition-colors">
            Terms of Service
          </Link>
          <Link href="/about" className="text-#F7F7F7 hover:text-#F7F7F7 dark:text-#F7F7F7 dark:hover:text-#F7F7F7 transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-#F7F7F7 hover:text-#F7F7F7 dark:text-#F7F7F7 dark:hover:text-#F7F7F7 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;