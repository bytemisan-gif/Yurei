import Link from 'next/link';
import { Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-border bg-dark-bg/80 mt-28">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base">Yurei</span>
            <span className="text-xs text-gray-500">The Ultimate All-in-One Discord Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <Link href="/commands" className="hover:text-white transition">Commands</Link>
          <Link href="/docs" className="hover:text-white transition">Documentation</Link>
          <Link href="/premium" className="hover:text-white transition">Premium</Link>
          <Link href="/status" className="hover:text-white transition">System Status</Link>
          <a href="https://discord.gg/M4P4Qrt6G5" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Support Server</a>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1">
          Developed with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by <strong className="text-gray-300">Misan</strong>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
