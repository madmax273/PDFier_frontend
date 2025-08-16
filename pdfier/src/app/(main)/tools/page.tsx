"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tools = [
  {
    title: "Merge PDFs",
    description: "Combine multiple PDFs into a single document",
    href: "/tools/merge",
    icon: "🧩",
  },
  {
    title: "Split PDF",
    description: "Extract pages or split PDF into multiple files",
    href: "/tools/split",
    icon: "✂️",
  },
  {
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    href: "/tools/compress",
    icon: "🗜️",
  },
  {
    title: "PDF to Word",
    description: "Convert PDF files to editable Word documents",
    href: "/tools/word",
    icon: "📝",
  },
  {
    title: "Word to PDF",
    description: "Convert Word documents to PDF format",
    href: "/tools/word-to-pdf",
    icon: "📄",
  },
  {
    title: "PDF to Excel",
    description: "Extract tables from PDF to Excel spreadsheets",
    href: "/tools/excel",
    icon: "📊",
  },
  {
    title: "PDF to PPT",
    description: "Convert PDF to PowerPoint presentations",
    href: "/tools/ppt",
    icon: "📑",
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images",
    href: "/tools/jpg",
    icon: "🖼️",
  },
  {
    title: "JPG to PDF",
    description: "Convert images to PDF documents",
    href: "/tools/jpg-to-pdf",
    icon: "📸",
  },
  {
    title: "Protect PDF",
    description: "Add password protection to your PDF files",
    href: "/tools/protect",
    icon: "🔒",
  },
  {
    title: "Sign PDF",
    description: "Add digital signatures to your documents",
    href: "/tools/sign",
    icon: "✍️",
  },
  {
    title: "Organize PDF",
    description: "Rearrange, delete, or rotate pages",
    href: "/tools/organize",
    icon: "📑",
  },
  {
    title: "PDF to TXT",
    description: "Extract text from PDF files",
    href: "/tools/txt",
    icon: "📝",
  },
  {
    title: "Add Watermark",
    description: "Add text or image watermarks to PDFs",
    href: "/tools/watermark",
    icon: "💧",
  },
  {
    title: "Redact PDF",
    description: "Permanently remove sensitive information",
    href: "/tools/redact",
    icon: "⚫",
  },
  {
    title: "Fill & Sign",
    description: "Fill out and sign PDF forms",
    href: "/tools/fill-sign",
    icon: "📝",
  },
];

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-[#2d0f57]">PDF Tools</h1>
        <p className="text-[#4a4a4a] max-w-2xl mx-auto text-lg">
          All the PDF tools you need to work with your documents efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.href} className="group">
            <Card className="h-full flex flex-col transition-all hover:shadow-lg hover:border-[#471396] border-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <span className="text-3xl" aria-hidden>
                    {tool.icon}
                  </span>
                  <div>
                    <CardTitle className="text-[#2d0f57]">{tool.title}</CardTitle>
                    <CardDescription className="text-[#4a4a4a]">{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button variant="ghost" className="group-hover:text-[#471396] group-hover:underline text-[#471396]" asChild>
                  <div>
                    Use tool <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
