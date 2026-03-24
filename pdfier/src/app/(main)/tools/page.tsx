"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, FilePlus, FileText, Minimize2, Lock, ArrowRightLeft, Type, SplitSquareHorizontal, Edit3, Camera, PenTool, Hash, Droplets, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tools = [
  {
    title: "Merge PDFs",
    description: "Combine multiple PDFs into a single document",
    href: "/tools/merge",
    icon: ArrowRightLeft,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Split PDF",
    description: "Extract pages or split PDF into multiple files",
    href: "/tools/split",
    icon: SplitSquareHorizontal,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    href: "/tools/compress",
    icon: Minimize2,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "PDF to Word",
    description: "Convert PDF files to editable Word documents",
    href: "/tools/word",
    icon: Type,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
  },
  {
    title: "Word to PDF",
    description: "Convert Word documents to PDF format",
    href: "/tools/word-to-pdf",
    icon: FileText,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    title: "PDF to Excel",
    description: "Extract tables from PDF to Excel spreadsheets",
    href: "/tools/excel",
    icon: LayoutTemplate,
    color: "text-emerald-600",
    bg: "bg-emerald-600/10",
  },
  {
    title: "PDF to PPT",
    description: "Convert PDF to PowerPoint presentations",
    href: "/tools/ppt",
    icon: Edit3,
    color: "text-orange-600",
    bg: "bg-orange-600/10",
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images",
    href: "/tools/jpg",
    icon: Camera,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    title: "JPG to PDF",
    description: "Convert images to PDF documents",
    href: "/tools/jpg-to-pdf",
    icon: FilePlus,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Protect PDF",
    description: "Add password protection to your PDF files",
    href: "/tools/protect",
    icon: Lock,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    title: "Sign PDF",
    description: "Add digital signatures to your documents",
    href: "/tools/sign",
    icon: PenTool,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    title: "Organize PDF",
    description: "Rearrange, delete, or rotate pages",
    href: "/tools/organize",
    icon: Hash,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Add Watermark",
    description: "Add text or image watermarks to PDFs",
    href: "/tools/watermark",
    icon: Droplets,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
];

export default function ToolsPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    show: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
          All <span className="text-primary">PDF Tools</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to merge, compress, convert, and edit your PDF documents completely free for basic usage.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.href} className="group outline-none">
            <motion.div 
                whileHover={{ y: -5 }}
                className="relative bg-card rounded-2xl border border-border/50 p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:border-primary/50 overflow-hidden glass-panel h-full flex flex-col"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-${tool.color.replace('text-', '')}/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />
              
              <div className="relative z-10 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-inner border border-white/10 dark:border-black/10 ${tool.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className={`w-7 h-7 ${tool.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-border/50 flex items-center text-sm font-semibold text-primary">
                Use Tool <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
