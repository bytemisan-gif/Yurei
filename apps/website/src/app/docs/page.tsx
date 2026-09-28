'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Shield,
  Sliders,
  Ticket,
  Headphones,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Terminal,
} from 'lucide-react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const discordInvite = 'https://discord.gg/M4P4Qrt6G5';
  const botInvite = 'https://discord.com/oauth2/authorize?client_id=1550514533208952894&permissions=8&scope=bot%20applications.commands';

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'antinuke', title: 'Anti-Nuke Defense', icon: <Shield className="w-4 h-4" /> },
    { id: 'antiraid', title: 'Anti-Raid & Verification', icon: <Shield className="w-4 h-4" /> },
    { id: 'moderation', title: 'Moderation & Cases', icon: <Sliders className="w-4 h-4" /> },
    { id: 'tickets', title: 'Ticket Panels', icon: <Ticket className="w-4 h-4" /> },
    { id: 'voice', title: 'Join-To-Create Voice', icon: <Headphones className="w-4 h-4" /> },
    { id: 'automation', title: 'AutoResponder & Custom Commands', icon: <Zap className="w-4 h-4" /> },
    { id: 'premium', title: 'Premium Activation', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 glass-panel rounded-2xl p-4 border border-dark-border space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1 block">
              Documentation
            </span>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSection === sec.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-dark-card'
                }`}
              >
                <div className="flex items-center gap-2">
                  {sec.icon}
                  <span>{sec.title}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-dark-border">
              <a
                href={discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 transition"
              >
                Support Server <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 max-w-4xl space-y-12">
          {activeSection === 'getting-started' && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" /> Quick Start
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Getting Started with Yurei
              </h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Welcome to <strong className="text-white">Yurei</strong>, the ultimate 600+ command Discord bot platform developed by <strong className="text-white">Misan</strong>.
                Follow the 3-minute setup below to invite and initialize your bot.
              </p>

              <div className="space-y-4">
                <div className="glass-panel rounded-2xl p-6 border border-dark-border">
                  <h3 className="text-base font-bold text-white mb-2">Step 1: Invite Yurei to Your Server</h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    Ensure you have the <strong>Administrator</strong> or <strong>Manage Server</strong> permission in the Discord guild.
                  </p>
                  <a
                    href={botInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glow-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white"
                  >
                    Authorize Bot <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="glass-panel rounded-2xl p-6 border border-dark-border">
                  <h3 className="text-base font-bold text-white mb-2">Step 2: Position Yurei's Role at the Top</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Discord enforces strict role hierarchy. For Yurei's Anti-Nuke and Moderation systems to protect administrator roles and manage members, drag the <code className="text-brand-400">Yurei</code> role as high as possible in your <strong>Server Settings → Roles</strong> list.
                  </p>
                </div>

                <div className="glass-panel rounded-2xl p-6 border border-dark-border">
                  <h3 className="text-base font-bold text-white mb-2">Step 3: Enable Anti-Nuke Protection</h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    Activate the autonomous defense engine with one slash command:
                  </p>
                  <div className="bg-dark-bg p-3 rounded-xl font-mono text-xs text-emerald-400 border border-dark-border">
                    /antinuke enable
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'antinuke' && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" /> Core Security
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Anti-Nuke Defense Engine
              </h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                Yurei provides sub-second audit log interception. When an administrator or compromised bot breaches safety thresholds, Yurei immediately executes quarantine actions.
              </p>

              <div className="space-y-4">
                <div className="glass-panel rounded-2xl p-6 border border-dark-border space-y-3">
                  <h3 className="font-bold text-white text-base">Key Anti-Nuke Commands</h3>
                  <ul className="space-y-2 text-xs font-mono text-gray-300">
                    <li><span className="text-brand-400">/antinuke enable</span> — Turn on real-time protection</li>
                    <li><span className="text-brand-400">/antinuke status</span> — View active thresholds</li>
                    <li><span className="text-brand-400">/antinuke punishment &lt;action&gt;</span> — Set punishment (STRIP_ROLES, BAN, KICK)</li>
                    <li><span className="text-brand-400">/antinuke lockdown</span> — Lock all channels immediately</li>
                    <li><span className="text-brand-400">/antinuke whitelist &lt;user/role&gt;</span> — Add trusted bypass entity</li>
                    <li><span className="text-brand-400">/antinuke incidents</span> — View suppression audit logs</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'antiraid' && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" /> Join Protection
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Anti-Raid & Button Verification
              </h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                Block token mass-join attacks and botnets using velocity join windows, account-age gating, and interactive button verification.
              </p>

              <div className="glass-panel rounded-2xl p-6 border border-dark-border space-y-3">
                <h3 className="font-bold text-white text-base">Setup Verification Gate</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Deploy an interactive button that assigns a verified member role upon clicking:
                </p>
                <div className="bg-dark-bg p-3 rounded-xl font-mono text-xs text-brand-400 border border-dark-border">
                  /verification setup role:@Member channel:#verify
                </div>
              </div>
            </div>
          )}

          {activeSection === 'premium' && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Premium System
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Redeeming & Activating Premium
              </h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                Purchased a premium license or received a code? Here is how to bind it:
              </p>

              <div className="glass-panel rounded-2xl p-6 border border-dark-border space-y-4">
                <h3 className="font-bold text-white text-base">Redeem via Slash Command</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Type the following command in any channel where Yurei can read messages:
                </p>
                <div className="bg-dark-bg p-3 rounded-xl font-mono text-xs text-yellow-400 border border-dark-border">
                  /premium code redeem code:YUREI-XXXX-XXXX
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  For Server Premium, run the command inside the server you wish to upgrade. For User Premium, run it anywhere.
                </p>
                <div className="pt-2">
                  <Link
                    href="/premium"
                    className="glow-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white"
                  >
                    View Premium Pricing <Sparkles className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'getting-started' &&
            activeSection !== 'antinuke' &&
            activeSection !== 'antiraid' &&
            activeSection !== 'premium' && (
              <div className="glass-panel rounded-2xl p-8 border border-dark-border text-center">
                <Terminal className="w-8 h-8 text-brand-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Module Guide</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                  Browse the comprehensive command list to inspect usage, options, and permission requirements.
                </p>
                <div className="mt-6">
                  <Link
                    href="/commands"
                    className="glow-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white"
                  >
                    Open Command Catalog
                  </Link>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
