'use client';

import Link from 'next/link';
import { Shield, Sparkles, Terminal, FileText, Activity, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-dark-border/80">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              Yurei <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 font-semibold">v2.0</span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium -mt-1">by Misan</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/commands" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-brand-400" /> Commands
          </Link>
          <Link href="/docs" className="hover:text-white transition-colors flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" /> Docs
          </Link>
          <Link href="/premium" className="hover:text-yellow-400 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" /> Premium
          </Link>
          <Link href="/status" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" /> Status
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-dark-card border border-dark-border text-gray-200 hover:text-white hover:bg-dark-hover transition"
          >
            <LayoutDashboard className="w-4 h-4 text-brand-400" /> Dashboard
          </Link>
          <a
            href="https://discord.gg/M4P4Qrt6G5"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:text-white transition"
          >
            Support Server
          </a>
          <a
            href="https://discord.com/oauth2/authorize?client_id=1550514533208952894&permissions=8&scope=bot%20applications.commands"
            target="_blank"
            rel="noopener noreferrer"
            className="glow-btn px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5"
          >
            Invite Yurei
          </a>
        </div>
      </div>
    </header>
  );
}
