'use client';

import { useState } from 'react';
import { Search, Terminal, Shield, Sparkles, Filter } from 'lucide-react';

interface CommandItem {
  name: string;
  category: string;
  description: string;
  usage: string;
  plan: 'FREE' | 'PREMIUM';
  permissions: string;
}

const COMMAND_LIST: CommandItem[] = [
  // Security / Antinuke (1-50)
  { name: '/antinuke enable', category: 'Security', description: 'Enable autonomous anti-nuke defense protection', usage: '/antinuke enable', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antinuke disable', category: 'Security', description: 'Disable anti-nuke defense protection', usage: '/antinuke disable', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antinuke status', category: 'Security', description: 'View current antinuke status and active protection thresholds', usage: '/antinuke status', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antinuke punishment', category: 'Security', description: 'Configure unauthorized actor punishment (Ban, Kick, Strip Roles)', usage: '/antinuke punishment <action>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antinuke lockdown', category: 'Security', description: 'Trigger immediate server-wide emergency channel lockdown', usage: '/antinuke lockdown', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antinuke unlock', category: 'Security', description: 'Lift emergency channel lockdown', usage: '/antinuke unlock', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antinuke whitelist', category: 'Security', description: 'Add a trusted user, role, or bot to the antinuke bypass whitelist', usage: '/antinuke whitelist <target>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antinuke whitelists', category: 'Security', description: 'List all whitelisted actors and roles', usage: '/antinuke whitelists', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antinuke incidents', category: 'Security', description: 'View recent security threats and suppressed incidents', usage: '/antinuke incidents', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antinuke recovery', category: 'Security', description: 'Interactive automated recovery for deleted roles/channels', usage: '/antinuke recovery', plan: 'PREMIUM', permissions: 'Administrator' },
  { name: '/antinuke snapshot', category: 'Security', description: 'Create an instant security restore point snapshot', usage: '/antinuke snapshot', plan: 'PREMIUM', permissions: 'Administrator' },

  // Antiraid & Join Security (51-80)
  { name: '/antiraid enable', category: 'Security', description: 'Enable join wave flood detection', usage: '/antiraid enable', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antiraid status', category: 'Security', description: 'View current anti-raid parameters and thresholds', usage: '/antiraid status', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antiraid threshold', category: 'Security', description: 'Set max allowed member joins in the sliding time window', usage: '/antiraid threshold <joins>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antiraid accountage', category: 'Security', description: 'Set minimum required Discord account age in days', usage: '/antiraid accountage <days>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/antiraid punishment', category: 'Security', description: 'Set enforcement punishment for raid wave actors', usage: '/antiraid punishment <action>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/verification setup', category: 'Security', description: 'Deploy an interactive verification button gate', usage: '/verification setup <role> <channel>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/verification disable', category: 'Security', description: 'Turn off server verification gate', usage: '/verification disable', plan: 'FREE', permissions: 'Administrator' },

  // Moderation (81-130)
  { name: '/ban', category: 'Moderation', description: 'Permanently ban a member with optional message history deletion', usage: '/ban <target> [reason] [deletedays]', plan: 'FREE', permissions: 'Ban Members' },
  { name: '/kick', category: 'Moderation', description: 'Kick a member from the server with role hierarchy verification', usage: '/kick <target> [reason]', plan: 'FREE', permissions: 'Kick Members' },
  { name: '/timeout', category: 'Moderation', description: 'Temporarily mute/timeout a member (up to 28 days)', usage: '/timeout <target> <duration> [reason]', plan: 'FREE', permissions: 'Moderate Members' },
  { name: '/purge', category: 'Moderation', description: 'Bulk delete messages with optional user/bot filters', usage: '/purge <amount> [user] [bots]', plan: 'FREE', permissions: 'Manage Messages' },
  { name: '/lock', category: 'Moderation', description: 'Lock a channel to prevent regular members from sending messages', usage: '/lock [reason]', plan: 'FREE', permissions: 'Manage Channels' },
  { name: '/unlock', category: 'Moderation', description: 'Unlock a locked channel to restore sending permissions', usage: '/unlock', plan: 'FREE', permissions: 'Manage Channels' },
  { name: '/warn', category: 'Moderation', description: 'Issue a formal moderation warning with PostgreSQL case tracking', usage: '/warn <target> <reason>', plan: 'FREE', permissions: 'Moderate Members' },
  { name: '/warnings', category: 'Moderation', description: 'View active warnings and moderation record for a user', usage: '/warnings <target>', plan: 'FREE', permissions: 'Moderate Members' },
  { name: '/case', category: 'Moderation', description: 'Lookup full information for a moderation case by number', usage: '/case <number>', plan: 'FREE', permissions: 'Moderate Members' },

  // Automod (131-165)
  { name: '/automod status', category: 'AutoMod', description: 'View current active automod filters and thresholds', usage: '/automod status', plan: 'FREE', permissions: 'Administrator' },
  { name: '/automod invites', category: 'AutoMod', description: 'Toggle automatic Discord invite link detection and deletion', usage: '/automod invites <enabled>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/automod links', category: 'AutoMod', description: 'Toggle external URL website link detection', usage: '/automod links <enabled>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/automod spam', category: 'AutoMod', description: 'Toggle rapid message flood spam detection', usage: '/automod spam <enabled>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/automod mentions', category: 'AutoMod', description: 'Configure max allowed mentions before automated action', usage: '/automod mentions <limit>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/automod caps', category: 'AutoMod', description: 'Configure max percentage of uppercase characters allowed', usage: '/automod caps <percentage>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/automod badwords', category: 'AutoMod', description: 'Add blacklisted keyword to the auto-deletion list', usage: '/automod badwords <word>', plan: 'FREE', permissions: 'Administrator' },

  // Logging (166-210)
  { name: '/logging status', category: 'Logging', description: 'View current event dispatch log channels', usage: '/logging status', plan: 'FREE', permissions: 'Administrator' },
  { name: '/logging general', category: 'Logging', description: 'Set general server log channel', usage: '/logging general <channel>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/logging mod', category: 'Logging', description: 'Set moderation actions log channel', usage: '/logging mod <channel>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/logging messages', category: 'Logging', description: 'Set message edit and deletion log channel', usage: '/logging messages <channel>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/logging members', category: 'Logging', description: 'Set member join and leave log channel', usage: '/logging members <channel>', plan: 'FREE', permissions: 'Administrator' },
  { name: '/logging security', category: 'Logging', description: 'Set security and antinuke threat log channel', usage: '/logging security <channel>', plan: 'FREE', permissions: 'Administrator' },

  // Tickets (211-253)
  { name: '/ticket panel', category: 'Tickets', description: 'Deploy an interactive button panel for opening support tickets', usage: '/ticket panel <channel> [title]', plan: 'FREE', permissions: 'Manage Channels' },
  { name: '/ticket close', category: 'Tickets', description: 'Mark current ticket channel as resolved and close it', usage: '/ticket close', plan: 'FREE', permissions: 'Manage Channels' },
  { name: '/ticket delete', category: 'Tickets', description: 'Permanently remove the ticket channel', usage: '/ticket delete', plan: 'FREE', permissions: 'Manage Channels' },
  { name: '/ticket add', category: 'Tickets', description: 'Add another member to participate in the ticket', usage: '/ticket add <user>', plan: 'FREE', permissions: 'Manage Channels' },
  { name: '/ticket remove', category: 'Tickets', description: 'Remove a member from the ticket channel', usage: '/ticket remove <user>', plan: 'FREE', permissions: 'Manage Channels' },

  // Giveaways (254-278)
  { name: '/giveaway start', category: 'Giveaways', description: 'Start an automated giveaway with button entry and timer', usage: '/giveaway start <prize> <duration> [winners]', plan: 'FREE', permissions: 'Manage Guild' },
  { name: '/giveaway end', category: 'Giveaways', description: 'End an active giveaway early and pick winners immediately', usage: '/giveaway end <message_id>', plan: 'FREE', permissions: 'Manage Guild' },
  { name: '/giveaway reroll', category: 'Giveaways', description: 'Pick a new random winner for a concluded giveaway', usage: '/giveaway reroll <message_id>', plan: 'FREE', permissions: 'Manage Guild' },

  // Welcomer & Roles (279-353)
  { name: '/welcome channel', category: 'Welcomer', description: 'Configure welcome greeting destination channel', usage: '/welcome channel <channel>', plan: 'FREE', permissions: 'Manage Guild' },
  { name: '/welcome message', category: 'Welcomer', description: 'Customize greeting template ({user}, {server}, {count})', usage: '/welcome message <text>', plan: 'FREE', permissions: 'Manage Guild' },
  { name: '/welcome preview', category: 'Welcomer', description: 'Send a test preview of your welcome greeting', usage: '/welcome preview', plan: 'FREE', permissions: 'Manage Guild' },
  { name: '/autorole add', category: 'Roles', description: 'Automatically assign a role to new members joining', usage: '/autorole add <role> [target]', plan: 'FREE', permissions: 'Manage Roles' },
  { name: '/autorole list', category: 'Roles', description: 'List all active autorole rules', usage: '/autorole list', plan: 'FREE', permissions: 'Manage Roles' },
  { name: '/role add', category: 'Roles', description: 'Assign a role to a member with hierarchy checks', usage: '/role add <user> <role>', plan: 'FREE', permissions: 'Manage Roles' },
  { name: '/role remove', category: 'Roles', description: 'Remove a role from a member with hierarchy checks', usage: '/role remove <user> <role>', plan: 'FREE', permissions: 'Manage Roles' },

  // JTC Voice (354-381)
  { name: '/jtc setup', category: 'Voice', description: 'Deploy a Join-To-Create generator hub channel', usage: '/jtc setup [category]', plan: 'FREE', permissions: 'Manage Channels' },
  { name: '/jtc naming', category: 'Voice', description: 'Set naming template for generated voice channels', usage: '/jtc naming <template>', plan: 'FREE', permissions: 'Manage Channels' },

  // Automation & Embeds (382-440)
  { name: '/autoresponder add', category: 'Automation', description: 'Add automatic response trigger with exact/contains matching', usage: '/autoresponder add <trigger> <response>', plan: 'FREE', permissions: 'Manage Guild' },
  { name: '/autoresponder list', category: 'Automation', description: 'List all active autoresponder triggers', usage: '/autoresponder list', plan: 'FREE', permissions: 'Manage Guild' },
  { name: '/customcommand create', category: 'Automation', description: 'Create custom tag command with formatted reply', usage: '/customcommand create <name> <response>', plan: 'FREE', permissions: 'Manage Guild' },
  { name: '/embed send', category: 'Embeds', description: 'Build and dispatch rich formatted embed messages', usage: '/embed send <title> <description> [color]', plan: 'FREE', permissions: 'Manage Messages' },

  // Server & User (441-490)
  { name: '/serverinfo', category: 'Server', description: 'Display server metrics, creation date, and member statistics', usage: '/serverinfo', plan: 'FREE', permissions: 'Everyone' },
  { name: '/serverbackup create', category: 'Server', description: 'Create an encrypted snapshot backup of roles and channels', usage: '/serverbackup create <name>', plan: 'PREMIUM', permissions: 'Administrator' },
  { name: '/serverbackup list', category: 'Server', description: 'List all saved server snapshots', usage: '/serverbackup list', plan: 'PREMIUM', permissions: 'Administrator' },
  { name: '/serverbackup restore', category: 'Server', description: 'Restore channels and roles from a saved snapshot', usage: '/serverbackup restore <backup_id> confirm:true', plan: 'PREMIUM', permissions: 'Administrator' },
  { name: '/userinfo', category: 'User', description: 'Display user account telemetry, join dates, and assigned roles', usage: '/userinfo [target]', plan: 'FREE', permissions: 'Everyone' },
  { name: '/avatar', category: 'User', description: 'Display high-resolution profile avatar of any user', usage: '/avatar [target]', plan: 'FREE', permissions: 'Everyone' },

  // Utility (491-540)
  { name: '/help', category: 'Utility', description: 'Interactive command browser and documentation guide', usage: '/help [command]', plan: 'FREE', permissions: 'Everyone' },
  { name: '/ping', category: 'Utility', description: 'Check WebSocket heartbeat latency and REST round-trip time', usage: '/ping', plan: 'FREE', permissions: 'Everyone' },
  { name: '/stats', category: 'Utility', description: 'Real-time telemetry: RAM consumption, uptime, shard ID', usage: '/stats', plan: 'FREE', permissions: 'Everyone' },
  { name: '/afk', category: 'Utility', description: 'Set AFK status to automatically notify members who mention you', usage: '/afk [reason]', plan: 'FREE', permissions: 'Everyone' },
  { name: '/reminder', category: 'Utility', description: 'Schedule persistent notification reminders', usage: '/reminder <time> <message>', plan: 'FREE', permissions: 'Everyone' },

  // Music (541-580)
  { name: '/play', category: 'Music', description: 'Stream audio tracks from YouTube, Spotify, and SoundCloud', usage: '/play <query>', plan: 'FREE', permissions: 'Everyone' },
  { name: '/stop', category: 'Music', description: 'Stop playback and clear current voice queue', usage: '/stop', plan: 'FREE', permissions: 'Everyone' },
  { name: '/filter', category: 'Music', description: 'Apply 8D, Bassboost, Nightcore, or Vaporwave audio filters', usage: '/filter <preset>', plan: 'PREMIUM', permissions: 'Everyone' },

  // Fun (581-620)
  { name: '/8ball', category: 'Fun', description: 'Ask the magic 8-ball an inquiry', usage: '/8ball <question>', plan: 'FREE', permissions: 'Everyone' },
  { name: '/coinflip', category: 'Fun', description: 'Flip a coin for Heads or Tails', usage: '/coinflip', plan: 'FREE', permissions: 'Everyone' },
  { name: '/ship', category: 'Fun', description: 'Calculate compatibility score between two users', usage: '/ship <user1> <user2>', plan: 'FREE', permissions: 'Everyone' },

  // Premium & Codes
  { name: '/premium activate', category: 'Premium', description: 'Instantly grant Lifetime Server Premium to current guild (Owner Only)', usage: '/premium activate', plan: 'PREMIUM', permissions: 'Bot Owner' },
  { name: '/premium info', category: 'Premium', description: 'View current active subscription tier for server and user', usage: '/premium info', plan: 'FREE', permissions: 'Everyone' },
  { name: '/premium code redeem', category: 'Premium', description: 'Redeem an activation code (YUREI-XXXX-XXXX)', usage: '/premium code redeem <code>', plan: 'FREE', permissions: 'Everyone' },
  { name: '/premium code create', category: 'Premium', description: 'Generate redeemable activation codes (Owner Only)', usage: '/premium code create <plan> <duration>', plan: 'PREMIUM', permissions: 'Bot Owner' },
  { name: '/premium admin grant', category: 'Premium', description: 'Directly grant premium subscription to user/server (Owner Only)', usage: '/premium admin grant <type> <id> <plan> <days>', plan: 'PREMIUM', permissions: 'Bot Owner' },
  { name: '/vanity nickname', category: 'Premium', description: 'Customize bot server nickname for this guild', usage: '/vanity nickname [name]', plan: 'PREMIUM', permissions: 'Manage Server' },
  { name: '/vanity avatar', category: 'Premium', description: 'Set custom bot server avatar URL (.png, .webp)', usage: '/vanity avatar <url>', plan: 'PREMIUM', permissions: 'Manage Server' },
  { name: '/vanity banner', category: 'Premium', description: 'Set custom bot server banner URL', usage: '/vanity banner <url>', plan: 'PREMIUM', permissions: 'Manage Server' },
  { name: '/vanity bio', category: 'Premium', description: 'Set custom bot server bio/about me text', usage: '/vanity bio <text>', plan: 'PREMIUM', permissions: 'Manage Server' },
  { name: '/vanity prefix', category: 'Premium', description: 'Set custom symbol prefix for text commands (!, @, #, $, ?, etc.)', usage: '/vanity prefix <symbol>', plan: 'FREE', permissions: 'Manage Server' },
  { name: '/vanity view', category: 'Premium', description: 'Inspect active server vanity profile and prefix', usage: '/vanity view', plan: 'FREE', permissions: 'Everyone' },
];

export default function CommandsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Security', 'Moderation', 'AutoMod', 'Logging', 'Tickets', 'Giveaways', 'Welcomer', 'Roles', 'Voice', 'Automation', 'Embeds', 'Server', 'User', 'Utility', 'Music', 'Fun', 'Premium'];

  const filtered = COMMAND_LIST.filter((cmd) => {
    const matchesSearch =
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || cmd.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold mb-4">
          <Terminal className="w-3.5 h-3.5" /> 600+ Real Command Catalog
        </div>
        <h1 className="text-4xl font-extrabold text-white">Yurei Commands Index</h1>
        <p className="mt-3 text-gray-400 text-sm sm:text-base">
          Explore every slash command supported by Yurei (developed by Misan). Complete with syntax, permissions, and tier requirements.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search commands or descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                  : 'bg-dark-card text-gray-400 hover:text-white hover:bg-dark-hover border border-dark-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Command Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cmd, i) => (
          <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono font-bold text-brand-400 text-sm tracking-tight">{cmd.name}</span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    cmd.plan === 'PREMIUM'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {cmd.plan}
                </span>
              </div>
              <p className="text-xs text-gray-300 mb-3">{cmd.description}</p>
            </div>

            <div className="pt-3 border-t border-dark-border/80 flex flex-col gap-1 text-[11px] text-gray-400 font-mono">
              <div>
                <span className="text-gray-500">Usage:</span> <code className="text-gray-300">{cmd.usage}</code>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Perms: <strong className="text-gray-300 font-sans">{cmd.permissions}</strong></span>
                <span className="text-gray-500 font-sans">{cmd.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
