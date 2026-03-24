"use client";

import { ArrowRight, Wrench, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ToolPlaceholderPage() {
  const params = useParams();
  const toolSlug = typeof params.tool === 'string' ? params.tool : 'unknown';
  const toolName = toolSlug.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="text-sm font-medium text-muted-foreground mb-6 flex items-center space-x-2 max-w-4xl mx-auto">
        <Link href="/" className="hover:text-foreground transition-colors">
          <Home size={16} />
        </Link>
        <ChevronRight size={16} />
        <Link href="/tools" className="hover:text-foreground transition-colors">
          Tools
        </Link>
        <ChevronRight size={16} />
        <span className="text-foreground">{toolName}</span>
      </nav>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-card border border-border/50 rounded-3xl p-12 text-center glass-panel shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
              <Wrench className="w-12 h-12 text-primary" />
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
              {toolName} Tool
            </h1>
            
            <div className="inline-flex px-4 py-2 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm mb-6 uppercase tracking-wider">
              Under Development
            </div>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              We are currently building the backend processing pipelines for the <span className="text-primary font-bold">{toolName}</span> tool. It will be available very soon to automate your workflows!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                <Link href="/tools">
                  Explore Available Tools <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
