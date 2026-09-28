'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Server,
  Users,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Sparkles,
  ArrowRight,
  Search,
  Lock,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface GuildItem {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  hasBot: boolean;
  isOwner: boolean;
  plan: 'FREE' | 'PREMIUM';
  antinukeActive: boolean;
}

export default function DashboardServerSelect() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const botInviteUrl =
    'https://discord.com/oauth2/authorize?client_id=1550514533208952894&permissions=8&scope=bot%20applications.commands';

  // Demo user data representing bot owner / manager
  const user = {
    id: '1354252509010722817',
    username: 'Misan',
    discriminator: '0',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    tag: 'Misan#0001',
    isBotOwner: true,
  };

  const [guilds, setGuilds] = useState<GuildItem[]>([
    {
      id: '120000000000000001',
      name: 'Yurei Official Community',
      icon: null,
      memberCount: 14520,
      hasBot: true,
      isOwner: true,
      plan: 'PREMIUM',
      antinukeActive: true,
    },
    {
      id: '120000000000000002',
      name: 'Misan Elite Esports',
      icon: null,
      memberCount: 3840,
      hasBot: true,
      isOwner: true,
      plan: 'PREMIUM',
      antinukeActive: true,
    },
    {
      id: '120000000000000003',
      name: 'Nightcore & Lofi Lounge',
      icon: null,
      memberCount: 1290,
      hasBot: true,
      isOwner: false,
      plan: 'FREE',
      antinukeActive: false,
    },
    {
      id: '120000000000000004',
      name: 'Anime & Manga Realm',
      icon: null,
      memberCount: 890,
      hasBot: false,
      isOwner: true,
      plan: 'FREE',
      antinukeActive: false,
    },
  ]);

  const filteredGuilds = guilds.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="glass-panel rounded-3xl p-10 max-w-md w-full text-center border border-brand-500/30">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Login Required</h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Authorize with your Discord account to manage your servers, configure Anti-Nuke defense, and control AutoMod.
          </p>
          <button
            onClick={() => setIsLoggedIn(true)}
            className="glow-btn w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
          >
            Authorize with Discord <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* User Header Profile */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-dark-border mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-brand-500/20">
              M
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-dark-bg" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{user.username}</h1>
              {user.isBotOwner && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Bot Owner
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {user.id}</p>
            <p className="text-xs text-brand-400 font-medium mt-1">
              Full Administrator Authority across all Yurei instances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={botInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-dark-card border border-dark-border text-gray-200 hover:text-white hover:bg-dark-hover transition flex items-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Invite Bot
          </a>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Control Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Select a Server</h2>
          <p className="text-xs text-gray-400 mt-1">
            Choose a guild below to configure anti-nuke thresholds, custom triggers, and moderation rules.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter servers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>
      </div>

      {/* Guild Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuilds.map((guild) => (
          <div
            key={guild.id}
            className="glass-panel glass-panel-hover rounded-3xl p-6 border border-dark-border flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center font-bold text-white text-base">
                    {guild.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{guild.name}</h3>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" /> {guild.memberCount.toLocaleString()} members
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    guild.plan === 'PREMIUM'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}
                >
                  {guild.plan}
                </span>
              </div>

              <div className="space-y-2 py-3 border-y border-dark-border/80 text-xs">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400">Anti-Nuke Protection</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      guild.antinukeActive ? 'text-emerald-400' : 'text-gray-500'
                    }`}
                  >
                    {guild.antinukeActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400">Ownership</span>
                  <span className="font-semibold text-gray-200">
                    {guild.isOwner ? 'Server Owner' : 'Administrator'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {guild.hasBot ? (
                <Link
                  href={`/dashboard/${guild.id}`}
                  className="glow-btn w-full py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5" /> Manage Server
                </Link>
              ) : (
                <a
                  href={`${botInviteUrl}&guild_id=${guild.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-dark-card border border-dark-border text-brand-400 hover:bg-dark-hover flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Invite Yurei
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
