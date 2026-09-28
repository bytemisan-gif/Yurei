'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Ticket,
  Headphones,
  Zap,
  ArrowLeft,
  Save,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  UserPlus,
  Trash2,
  Volume2,
} from 'lucide-react';

export default function GuildDashboard({ params }: { params: { guildId: string } }) {
  const [activeTab, setActiveTab] = useState<'antinuke' | 'automod' | 'antiraid' | 'tickets' | 'jtc' | 'welcomer' | 'vanity' | 'premium'>('antinuke');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Server Vanity & Custom Prefix State (Premium)
  const [customPrefix, setCustomPrefix] = useState('!');
  const [serverNickname, setServerNickname] = useState('Yurei');
  const [serverAvatarUrl, setServerAvatarUrl] = useState('');
  const [serverBannerUrl, setServerBannerUrl] = useState('');
  const [serverBio, setServerBio] = useState('Official Security & Multipurpose Bot for this community.');

  // Guild Config State
  const [antinukeEnabled, setAntinukeEnabled] = useState(true);
  const [punishment, setPunishment] = useState('STRIP_ROLES');
  const [channelLimit, setChannelLimit] = useState(3);
  const [roleLimit, setRoleLimit] = useState(2);
  const [banLimit, setBanLimit] = useState(5);
  const [whitelistedUsers, setWhitelistedUsers] = useState(['1354252509010722817']);
  const [newWhitelistInput, setNewWhitelistInput] = useState('');

  // AutoMod State
  const [antiSpam, setAntiSpam] = useState(true);
  const [antiInvites, setAntiInvites] = useState(true);
  const [antiLinks, setAntiLinks] = useState(false);
  const [maxMentions, setMaxMentions] = useState(5);
  const [maxCaps, setMaxCaps] = useState(70);

  // Anti-Raid State
  const [antiRaidEnabled, setAntiRaidEnabled] = useState(true);
  const [joinThreshold, setJoinThreshold] = useState(10);
  const [minAccountAge, setMinAccountAge] = useState(7);
  const [verifyRole, setVerifyRole] = useState('@Member');

  // Welcomer State
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);
  const [welcomeChannel, setWelcomeChannel] = useState('#welcome');
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Welcome {user} to {server}! You are our {count}th member. Enjoy your stay!'
  );

  // Tickets State
  const [ticketCategory, setTicketCategory] = useState('Support Tickets');
  const [ticketStaffRole, setTicketStaffRole] = useState('@Support Team');

  // JTC State
  const [jtcEnabled, setJtcEnabled] = useState(true);
  const [jtcHubName, setJtcHubName] = useState('➕ Join to Create');
  const [jtcChannelFormat, setJtcChannelFormat] = useState("{user}'s Lounge");

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistInput.trim()) return;
    if (!whitelistedUsers.includes(newWhitelistInput.trim())) {
      setWhitelistedUsers([...whitelistedUsers, newWhitelistInput.trim()]);
    }
    setNewWhitelistInput('');
  };

  const handleRemoveWhitelist = (id: string) => {
    if (id === '1354252509010722817') return; // Owner cannot be removed
    setWhitelistedUsers(whitelistedUsers.filter((u) => u !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-dark-border">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl bg-dark-card border border-dark-border hover:bg-dark-hover text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Yurei Official Community</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 uppercase">
                Premium Guild
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Guild ID: {params.guildId}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="glow-btn px-6 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" /> Settings successfully synchronized to PostgreSQL & Yurei Bot gateway!
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Module Sidebar Tabs */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="glass-panel rounded-2xl p-3 border border-dark-border space-y-1">
            <button
              onClick={() => setActiveTab('antinuke')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'antinuke'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" /> Anti-Nuke Suite
            </button>

            <button
              onClick={() => setActiveTab('automod')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'automod'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              <Sliders className="w-4 h-4 text-cyan-400" /> AutoMod Rules
            </button>

            <button
              onClick={() => setActiveTab('antiraid')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'antiraid'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-400" /> Anti-Raid & Gate
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'tickets'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              <Ticket className="w-4 h-4 text-yellow-400" /> Ticket Panels
            </button>

            <button
              onClick={() => setActiveTab('jtc')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'jtc'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              <Headphones className="w-4 h-4 text-purple-400" /> Join-To-Create Voice
            </button>

            <button
              onClick={() => setActiveTab('welcomer')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'welcomer'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-400" /> Welcomer Message
            </button>

            <button
              onClick={() => setActiveTab('vanity')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'vanity'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              <Zap className="w-4 h-4 text-pink-400" /> Bot Vanity & Prefix
            </button>

            <button
              onClick={() => setActiveTab('premium')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'premium'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" /> Server Premium
            </button>
          </div>
        </aside>

        {/* Tab Content Panes */}
        <main className="flex-1 space-y-6">
          {/* 1. ANTI-NUKE */}
          {activeTab === 'antinuke' && (
            <div className="glass-panel rounded-3xl p-8 border border-dark-border space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-dark-border">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400" /> Autonomous Anti-Nuke Engine
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Intercept rogue administrators performing mass deletions or unauthorized role edits.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={antinukeEnabled}
                    onChange={(e) => setAntinukeEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-card peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Rogue Actor Punishment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">Rogue Enforcement Punishment</label>
                <select
                  value={punishment}
                  onChange={(e) => setPunishment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="STRIP_ROLES">Strip Dangerous Roles (Recommended)</option>
                  <option value="BAN">Instant Guild Ban</option>
                  <option value="KICK">Kick Actor</option>
                </select>
              </div>

              {/* Threshold Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-300">Channel Deletions</span>
                    <span className="text-xs font-mono font-bold text-red-400">{channelLimit} / 10s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={channelLimit}
                    onChange={(e) => setChannelLimit(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-300">Role Deletions</span>
                    <span className="text-xs font-mono font-bold text-red-400">{roleLimit} / 10s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={roleLimit}
                    onChange={(e) => setRoleLimit(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-300">Member Bans</span>
                    <span className="text-xs font-mono font-bold text-red-400">{banLimit} / 10s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={banLimit}
                    onChange={(e) => setBanLimit(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
              </div>

              {/* Whitelist Manager */}
              <div className="space-y-3 pt-4 border-t border-dark-border">
                <h3 className="text-sm font-bold text-white">Anti-Nuke Whitelist Bypass</h3>
                <p className="text-xs text-gray-400">
                  Entities on this list bypass sliding-window threshold checks. Bot Owner is permanently exempt.
                </p>

                <form onSubmit={handleAddWhitelist} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter User ID or Role ID..."
                    value={newWhitelistInput}
                    onChange={(e) => setNewWhitelistInput(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition"
                  >
                    Add Target
                  </button>
                </form>

                <div className="space-y-2 pt-2">
                  {whitelistedUsers.map((id) => (
                    <div
                      key={id}
                      className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-gray-300">
                        {id} {id === '1354252509010722817' && <strong className="text-yellow-400 font-sans ml-2">(Bot Owner • Immune)</strong>}
                      </span>
                      {id !== '1354252509010722817' && (
                        <button
                          onClick={() => handleRemoveWhitelist(id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. AUTOMOD */}
          {activeTab === 'automod' && (
            <div className="glass-panel rounded-3xl p-8 border border-dark-border space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-4 border-b border-dark-border">
                <Sliders className="w-5 h-5 text-cyan-400" /> AutoMod Content Filter Suite
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Anti-Spam Filter</h4>
                    <p className="text-[11px] text-gray-400">Block rapid message flood waves</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiSpam}
                    onChange={(e) => setAntiSpam(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Anti-Discord Invites</h4>
                    <p className="text-[11px] text-gray-400">Auto-delete foreign server invite links</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiInvites}
                    onChange={(e) => setAntiInvites(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Anti-External Links</h4>
                    <p className="text-[11px] text-gray-400">Block unauthorized URL links</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiLinks}
                    onChange={(e) => setAntiLinks(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Max Mentions Allowed</span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{maxMentions} mentions</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={maxMentions}
                    onChange={(e) => setMaxMentions(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. ANTI-RAID */}
          {activeTab === 'antiraid' && (
            <div className="glass-panel rounded-3xl p-8 border border-dark-border space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-4 border-b border-dark-border">
                <Shield className="w-5 h-5 text-indigo-400" /> Join-Wave Security & Button Verification
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
                  <span className="text-xs font-bold text-white block mb-1">Join Velocity Limit</span>
                  <span className="text-xs text-gray-400 block mb-2">Max joins within 10-second window</span>
                  <input
                    type="number"
                    value={joinThreshold}
                    onChange={(e) => setJoinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-xs text-white font-mono"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
                  <span className="text-xs font-bold text-white block mb-1">Minimum Discord Account Age</span>
                  <span className="text-xs text-gray-400 block mb-2">Filter accounts created recently</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minAccountAge}
                      onChange={(e) => setMinAccountAge(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-xs text-white font-mono"
                    />
                    <span className="text-xs text-gray-400">days</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-300">Verified Role Target</label>
                <input
                  type="text"
                  value={verifyRole}
                  onChange={(e) => setVerifyRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* 4. TICKETS */}
          {activeTab === 'tickets' && (
            <div className="glass-panel rounded-3xl p-8 border border-dark-border space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-4 border-b border-dark-border">
                <Ticket className="w-5 h-5 text-yellow-400" /> Interactive Ticket Panels
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Support Category Name</label>
                  <input
                    type="text"
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Support Staff Role</label>
                  <input
                    type="text"
                    value={ticketStaffRole}
                    onChange={(e) => setTicketStaffRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. JTC */}
          {activeTab === 'jtc' && (
            <div className="glass-panel rounded-3xl p-8 border border-dark-border space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-4 border-b border-dark-border">
                <Headphones className="w-5 h-5 text-purple-400" /> Dynamic Join-To-Create Voice Hubs
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Generator Channel Name</label>
                  <input
                    type="text"
                    value={jtcHubName}
                    onChange={(e) => setJtcHubName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Generated Channel Naming Format</label>
                  <input
                    type="text"
                    value={jtcChannelFormat}
                    onChange={(e) => setJtcChannelFormat(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Available variables: {'{user}'}, {'{number}'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 6. WELCOMER */}
          {activeTab === 'welcomer' && (
            <div className="glass-panel rounded-3xl p-8 border border-dark-border space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-4 border-b border-dark-border">
                <UserPlus className="w-5 h-5 text-emerald-400" /> Welcome Greeting Engine
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Welcome Channel</label>
                  <input
                    type="text"
                    value={welcomeChannel}
                    onChange={(e) => setWelcomeChannel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Greeting Template</label>
                  <textarea
                    rows={4}
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Available variables: {'{user}'}, {'{server}'}, {'{count}'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 7. BOT VANITY & CUSTOM PREFIX (PREMIUM) */}
          {activeTab === 'vanity' && (
            <div className="glass-panel rounded-3xl p-8 border border-pink-500/30 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-pink-400" /> Bot Vanity & Custom Prefix
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Customize Yurei's server profile (avatar, banner, bio, nickname) and command symbol specifically for this server.
                  </p>
                </div>
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  Premium Feature
                </span>
              </div>

              {/* Custom Command Prefix Selector */}
              <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Custom Command Prefix</h4>
                    <p className="text-[11px] text-gray-400">Trigger text commands using any custom symbol like !, @, #, $, ?, ., etc.</p>
                  </div>
                  <span className="text-sm font-mono font-bold text-pink-400 bg-dark-bg px-3 py-1 rounded-lg border border-dark-border">
                    {customPrefix}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {['!', '$', '#', '@', '?', '.', '>', '/', '%', '&'].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setCustomPrefix(sym)}
                      className={`w-9 h-9 rounded-xl font-mono text-sm font-bold flex items-center justify-center transition ${
                        customPrefix === sym
                          ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30'
                          : 'bg-dark-bg text-gray-400 hover:text-white border border-dark-border'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="Custom"
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-xl bg-dark-bg border border-dark-border text-xs font-mono text-white text-center focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Bot Server Identity Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Server Nickname</label>
                  <input
                    type="text"
                    value={serverNickname}
                    onChange={(e) => setServerNickname(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Changes bot display name in this server member list</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Server Avatar Image URL</label>
                  <input
                    type="text"
                    placeholder="https://i.imgur.com/example.png"
                    value={serverAvatarUrl}
                    onChange={(e) => setServerAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Direct link to PNG or WEBP avatar image</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-300 block mb-1">Server Banner Image URL</label>
                  <input
                    type="text"
                    placeholder="https://i.imgur.com/banner.png"
                    value={serverBannerUrl}
                    onChange={(e) => setServerBannerUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-300 block mb-1">Server About Me / Bio</label>
                  <textarea
                    rows={3}
                    value={serverBio}
                    onChange={(e) => setServerBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Custom server profile description shown to your members</p>
                </div>
              </div>

              {/* Dedicated Save & PostgreSQL Sync Button */}
              <div className="pt-4 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-yellow-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Server Vanity & Custom Prefix (Premium Unlocked)
                </p>
                <button
                  type="button"
                  onClick={handleSave}
                  className="glow-btn w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save & Sync to PostgreSQL
                </button>
              </div>
            </div>
          )}

          {/* 8. PREMIUM */}
          {activeTab === 'premium' && (
            <div className="glass-panel rounded-3xl p-8 border border-yellow-500/30 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" /> Server Premium Status
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Current subscription details and lifetime unlocks.</p>
                </div>
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Lifetime Active
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300 space-y-2">
                <p className="font-bold">🌟 Unlocked Superpowers for this Server:</p>
                <ul className="space-y-1 list-disc list-inside text-gray-300">
                  <li>Autonomous Anti-Nuke Recovery & Lockdown</li>
                  <li>24/7 Voice Channel Connection</li>
                  <li>All Audio FX Distortion Filters (8D, Bassboost)</li>
                  <li>100 AutoResponder rules & 50 Custom Commands</li>
                  <li>15 Encrypted Server Structure Snapshot Slots</li>
                </ul>
              </div>

              <p className="text-xs text-gray-400">
                Granted by Bot Owner <strong className="text-white">1354252509010722817</strong>.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
