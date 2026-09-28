# 🤖 Yurei — Multipurpose Discord Bot

A premium-grade multipurpose Discord bot with 600+ commands, antinuke/antiraid protection, music, tickets, giveaways, and a full web dashboard.

**Bot Name: Yurei**  
**Developed by: Misan**  
**Official Discord Support:** https://discord.gg/M4P4Qrt6G5  
**Bot Invite Link:** [Invite Yurei](https://discord.com/oauth2/authorize?client_id=1550514533208952894&permissions=8&scope=bot%20applications.commands)

---

## ✨ Features

| Category | Commands |
|---|---|
| 🛡 Moderation | ban, kick, timeout, warn, purge, lock, unlock, case |
| 🔒 Security | antinuke, antiraid, verification |
| 🤖 AutoMod | spam, links, mentions, invites, caps, bad words |
| 🎫 Tickets | create, close, add/remove users |
| 🎉 Giveaways | start, end, reroll |
| 👋 Welcomer | custom messages, cards, DMs |
| 🎭 Roles | add/remove, autorole, reaction roles |
| 🔊 JTC | join-to-create temporary voice channels |
| ⚙️ Automation | autoresponder, custom commands |
| 🎵 Music | play, stop, filters (Premium) |
| 🎮 Fun | 8ball, coinflip, ship |
| 📊 Logging | member, message, role, channel, voice events |
| 💎 Premium | code redemption, plan management |
| 🛠 Utility | help, ping, stats, afk, reminders |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- A Discord Bot token

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Setup Database
```bash
cd packages/database
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Build All Packages
```bash
npm run build --workspaces
```

### 6. Deploy Slash Commands
```bash
cd apps/bot
npm run deploy:commands
```

### 7. Start the Bot
```bash
npm run dev
```

---

## 🐳 Docker (Recommended)

```bash
docker-compose up -d
```

This starts:
- `misan-bot` — The Discord bot
- `misan-web` — The website/dashboard (port 3000)
- `postgres` — PostgreSQL database (port 5432)

---

## 📁 Project Structure

```
arrkiii-main/
├── apps/
│   ├── bot/              # Discord bot (discord.js v14)
│   │   └── src/
│   │       ├── client/   # MisanClient
│   │       ├── commands/ # All slash command modules
│   │       └── handlers/ # Event & command handlers
│   └── website/          # Next.js website & dashboard
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── config/           # Bot configuration
│   ├── database/         # Prisma ORM + PostgreSQL
│   ├── logger/           # Winston logger
│   ├── permissions/      # Discord permission management
│   ├── premium/          # Premium entitlement engine
│   ├── security/         # Antinuke + Antiraid engines
│   └── utils/            # Shared embed builders & utils
└── scripts/              # Dev scripts
```

---

## 💎 Premium System

Premium codes follow the `MISAN-XXXX-XXXX-XXXX` format.
Redeem with `/premium code redeem <code>`.

Plans:
- **Server Pro** — Enhanced limits per server
- **Server Elite** — Maximum limits + exclusive features
- **User Pro** — Premium across all servers you're in

---

## 📝 License

Copyright © 2025 Misan. All rights reserved.
