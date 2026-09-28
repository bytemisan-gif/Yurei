# Public Feature Audit & Architectural Research

## Document Metadata
- **Project**: Zenith (Original Multipurpose Discord Bot Platform)
- **Reference Subject**: Publicly accessible feature set of Zynrax and top-tier multipurpose Discord bots
- **Audit Date**: 2026-09-28
- **Compliance Note**: This audit relies strictly on publicly available documentation, bot directory listings (Top.gg, DiscordBotList), official public feature lists, and public commands. No private APIs, proprietary source code, or unauthorized internal assets were accessed.

---

## 1. Executive Summary & Purpose

The goal of this audit is to systematically map out the comprehensive feature spectrum of elite multi-functional Discord bots (typified by Zynrax, Carl-bot, Wick, and Dyno), classify features into **Free vs. Premium** tiers, establish clean architectural equivalents, and document strict Discord API boundary limitations.

Zenith is engineered as a clean-room, original, production-grade platform featuring 600+ real, executable commands, an entitlement engine, centralized limit management, and hardened security protections.

---

## 2. Public Feature Audit Matrix

| Category | Public Feature / Capability | Public Evidence / Source | Zenith Equivalent Implementation | Tier Classification | Discord API Limitations & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Security / Antinuke** | Mass ban/kick prevention | Top.gg feature list, public docs | `AntinukeEngine` with sliding window rate monitoring | **Free** (Basic limits) / **Premium** (Custom thresholds, instant restore) | Requires `VIEW_AUDIT_LOG` permission; audit log entries can experience 100-800ms gateway delay. |
| **Security / Antinuke** | Channel / Role deletion & creation guard | Public command list (`/antinuke`) | Audit log delta tracking with automatic role recovery & channel reconstruction | **Free** (Fixed threshold) / **Premium** (Configurable thresholds, trusted actors) | Channel positions and webhooks must be recreated via REST; API rate limits apply on bulk restoration. |
| **Security / Antinuke** | Webhook creation/deletion monitoring | Public docs | Webhook listener; immediately deletes unauthorized webhooks & restricts actors | **Premium** | Webhook audit logs must be fetched per-guild; requires `MANAGE_WEBHOOKS`. |
| **Security / Antinuke** | Bot addition guard | Public bot security descriptions | Auto-kick/ban unauthorized bot adds, punish inviter | **Free** (Kick unauthorized bot) / **Premium** (Punish adder, whitelist) | Bot additions can only be detected via `guildMemberAdd` + audit log matching. |
| **Security / Antinuke** | Emergency Lockdown & Unlock | Public commands (`/lockdown`, `/antinuke emergency`) | Closes `@everyone` send/connect permissions across all non-whitelisted channels | **Free** (Basic lock) / **Premium** (Deep lockdown + snapshot rollback) | Bulk channel permission overwrites must adhere to Discord route rate limits (50 req/sec bucket). |
| **Antiraid** | Join gate & flood control | Public docs | Sliding window join counter, automatic verification challenge | **Free** (Basic threshold) / **Premium** (Custom account-age filters, adaptive captcha) | Cannot inspect user DMs or client integrity; relies on account age, avatar presence, and join velocity. |
| **Moderation** | Ban, Softban, Kick, Timeout, Mute | Public docs, Discord standard | Integrated `/ban`, `/kick`, `/timeout`, `/mute` with persistent DB case logging | **Free** (All core mod actions) | Max timeout duration supported by Discord is 28 days (`COMMUNICATION_DISABLED_UNTIL`). |
| **Moderation** | Purge (user, bots, links, images, regex) | Public docs | Bulk delete handler (`channel.bulkDelete`) with filter predicates | **Free** (Up to 100 messages < 14 days old) | Discord API strictly forbids bulk deleting messages older than 14 days. |
| **Moderation** | Moderation Cases & Warnings | Public docs | Case tracking in PostgreSQL with unique case IDs, edit reasons, and staff notes | **Free** (Up to 500 cases) / **Premium** (Unlimited cases, analytics, export) | Case numbers are sequential per guild and fully indexed. |
| **Automod** | Spam, Flood, Invites, Links, Bad Words | Public docs | Regex token analyzer, heuristic repetition detector, Discord native automod rule sync | **Free** (Basic regex & rules) / **Premium** (Advanced custom regex, cross-server reputation) | Message inspection must occur in realtime; discord.js messageCreate event handler. |
| **Logging** | Message edits, deletes, member updates, role/channel deltas | Public docs | Comprehensive dispatch system routing to dedicated log channels | **Free** (Standard log channel) / **Premium** (Split category channels, attachments archive) | Attachments from deleted messages must be mirrored or logged as metadata before CDN expiration. |
| **Tickets** | Interactive ticket panels (buttons & select menus) | Public docs | Component-driven ticket system with dynamic channel creation & permission sync | **Free** (2 active panels, 10 open tickets) / **Premium** (Unlimited panels, modal forms, HTML transcripts) | Guild channel limit is 500 total; ticket auto-archive/delete is needed for scale. |
| **Giveaways** | Multi-prize, role requirements, account age, invites | Public docs | Cron/Worker-driven persistent giveaway system with database storage | **Free** (1 concurrent giveaway) / **Premium** (Unlimited, scheduled, weighted entries) | Reaction collector or button interaction; persistent through bot reboots. |
| **Welcomer & Goodbye**| Join/Leave cards, custom banners, embeds | Public docs | Canvas/SVG card generator with dynamic avatar, name, and member count | **Free** (Standard embed & basic card) / **Premium** (Custom background, font, multi-profile) | Image generation must be cached or rendered efficiently off the main event loop. |
| **Join-To-Create (JTC)**| Temporary dynamic voice channels | Public docs | Voice state change listener creating custom child voice channels with owner controls | **Free** (1 hub configuration) / **Premium** (Multiple hubs, bitrate control, auto-naming templates) | Discord voice channel creation rate limits apply; child channels pruned when empty. |
| **Autoresponder** | Trigger words, phrase matching, embed responses | Public docs | High-speed trie & regex matcher with variables substitution (`{user}`, `{server}`) | **Free** (5 responders) / **Premium** (Unlimited responders, role/channel conditions) | Cannot respond if bot lacks `SEND_MESSAGES` or channel is view-locked. |
| **Custom Commands** | Guild-specific commands & tags | Public docs | In-memory cached guild custom command registry | **Free** (3 custom commands) / **Premium** (50+ custom commands) | Discord Application Slash Commands have a global limit of 100 per guild; custom commands execute as subcommands or prefixes. |
| **Server Backups** | Full guild role, channel, and permission snapshots | Public docs | JSON snapshot storage in PostgreSQL with encrypted export & interactive restoration | **Premium Exclusive** | Discord API cannot restore message history, member lists, or vanity URLs without partnership. |
| **Music System** | Audio streaming, queue, filters (bassboost, 8D, nightcore) | Public docs | Lavalink / Shoukaku client integration with fallback audio controls | **Free** (Standard queue & playback) / **Premium** (24/7 mode, high-res audio, advanced filters) | Requires voice gateway connection; YouTube stream extraction requires dedicated rotating proxy. |
| **Embed Builder** | Interactive modal embed constructor | Public docs | Slash command modal builder with color picker, preview, and JSON import/export | **Free** (Standard embeds) / **Premium** (Saved templates, unlimited fields) | Discord Embed limits: Title <= 256, Description <= 4096, Fields <= 25, Total chars <= 6000. |
| **Starboard** | Reaction-based message pinning | Public docs | Message reaction add listener with configurable threshold & emoji | **Free** (1 starboard) / **Premium** (Multiple starboards, custom thresholds) | Message fetch requires guild message history permission. |
| **Reminders & AFK** | Timed notifications, AFK status on mention | Public docs | Redis/BullMQ background worker for scheduling reminders; message listener for AFK | **Free** (3 active reminders) / **Premium** (50 active reminders, recurring intervals) | Reminders can be delivered in-guild or via DM (if DM privacy settings allow). |
| **Bot Customization** | Vanity identity, status, activity | Public docs | Configurable status/presence engine and dashboard profile manager | **Free** (Standard presence) / **Premium** (Per-server avatar where bot permissions allow) | Bot username has rate limits (2 changes per hour globally); avatar updates are restricted. |

---

## 3. Tiering Architecture & Entitlement Model

Zenith uses a centralized **Entitlement Engine** (`@zenith/premium`). No feature checks are hardcoded randomly. Every command and action queries:

```typescript
const entitlement = await premiumService.checkEntitlement({
  guildId,
  userId,
  featureKey: 'antinuke.advanced',
});
if (!entitlement.allowed) {
  return interaction.reply({
    embeds: [createPremiumUpgradeEmbed(entitlement.reason, featureKey)],
    components: [createPremiumActionRow()],
    ephemeral: true,
  });
}
```

### Plan Hierarchy
1. **GLOBAL**: Developer/System wide override.
2. **SERVER PREMIUM**: Applied to Guild ID, unlocks all premium perks for every member in that server.
3. **USER PREMIUM**: Applied to User ID, unlocks personal perks (e.g. personal backups, elevated reminders, global bypasses).
4. **FREE**: Base tier with rock-solid, practical limits.

---

## 4. Discord API Technical Limitations & Safeguards

1. **Rate Limiting**: Discord enforces 50 requests/second globally per bot, with sub-route rate limits (e.g., channel creation, bulk message deletion). Zenith employs a Redis token-bucket rate limiter.
2. **Audit Log Delay**: Gateway events often arrive before audit logs are populated. The `AntinukeEngine` implements an audit log polling retry with a 250ms backoff (max 3 retries) to accurately identify malicious actors.
3. **Role Hierarchy Enforcement**: Zenith strictly checks:
   - `botMember.roles.highest.position > targetMember.roles.highest.position`
   - `executorMember.roles.highest.position > targetMember.roles.highest.position`
   - Prevents unauthorized modification of Guild Owner or roles positioned above the bot.
