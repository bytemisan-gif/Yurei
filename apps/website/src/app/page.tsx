import Link from 'next/link';
import {
  ShieldAlert,
  Zap,
  Ticket,
  Headphones,
  Sliders,
  Sparkles,
  Server,
  Lock,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Cpu,
} from 'lucide-react';

export default function Home() {
  const stats = [
    { label: 'Protected Servers', value: '1,450+' },
    { label: 'Active Members', value: '620,000+' },
    { label: 'Total Commands', value: '600+' },
    { label: 'API Uptime', value: '99.99%' },
  ];

  const features = [
    {
      icon: <ShieldAlert className="w-6 h-6 text-red-400" />,
      title: 'Anti-Nuke Defense Engine',
      description:
        'Sub-second audit log interception. Automatically identifies rogue actors attempting mass-bans, kicks, role deletes, or channel drops, stripping dangerous permissions instantaneously.',
    },
    {
      icon: <Lock className="w-6 h-6 text-indigo-400" />,
      title: 'Anti-Raid & Gate Verification',
      description:
        'Sliding-window join velocity tracking paired with customizable minimum account age gating and interactive verification buttons to repel token raid waves.',
    },
    {
      icon: <Sliders className="w-6 h-6 text-emerald-400" />,
      title: 'Smart Case Moderation',
      description:
        'Enforce strict Discord role hierarchy checks across ban, kick, timeout, and warn workflows. Every case is uniquely indexed in PostgreSQL with full audit tracking.',
    },
    {
      icon: <Ticket className="w-6 h-6 text-yellow-400" />,
      title: 'Interactive Ticket Panels',
      description:
        'Deploy customizable button panels, auto-create private support text channels, manage staff claiming, and archive complete transcripts with ease.',
    },
    {
      icon: <Headphones className="w-6 h-6 text-purple-400" />,
      title: 'Join-To-Create Voice Hubs',
      description:
        'Dynamic temporary voice channels generated on-demand whenever members connect to the hub. Automatically deleted when empty to keep voice lists pristine.',
    },
    {
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      title: 'AutoResponder & Custom Commands',
      description:
        'Configure regex patterns, exact keyword matches, and custom server subcommands with embed formatting, variables substitution, and cooldowns.',
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/20 blur-[140px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-semibold text-brand-400 border border-brand-500/30 mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Discord Security Platform • Developed by Misan
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight">
          Fortify, Automate & Supercharge <br />
          <span className="text-gradient">Your Discord Server</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
          The ultimate all-in-one bot <strong className="text-white">Yurei</strong>, engineered by <strong className="text-white">Misan</strong>.
          Equipped with 600+ real commands, impenetrable Anti-Nuke defense, intelligent AutoMod, dynamic Voice Hubs, and a sleek real-time Web Dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://discord.com/oauth2/authorize?client_id=1550514533208952894&permissions=8&scope=bot%20applications.commands"
            target="_blank"
            rel="noopener noreferrer"
            className="glow-btn px-8 py-3.5 rounded-xl font-bold text-white text-base flex items-center gap-2"
          >
            Add Yurei to Discord <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl font-bold text-gray-200 text-base glass-panel glass-panel-hover flex items-center gap-2"
          >
            Open Dashboard
          </Link>
          <Link
            href="/premium"
            className="px-6 py-3.5 rounded-xl font-bold text-yellow-300 border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-base flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" /> Get Premium
          </Link>
          <Link
            href="/commands"
            className="px-6 py-3.5 rounded-xl font-medium text-gray-400 hover:text-white transition flex items-center gap-2"
          >
            <Terminal className="w-4 h-4" /> Browse 600+ Commands
          </Link>
          <a
            href="https://discord.gg/M4P4Qrt6G5"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl font-medium text-indigo-400 hover:text-indigo-300 transition flex items-center gap-2"
          >
            Support Discord
          </a>
        </div>

        {/* Live Stats Bar */}
        <div className="mt-20 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Anti-Nuke Showcase Card */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-brand-500/20 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 mb-4">
                <ShieldAlert className="w-3.5 h-3.5" /> High-Concurrency Threat Neutralization
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                Autonomous Anti-Nuke & Emergency Lockdown
              </h2>
              <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
                Yurei continuously analyzes audit log event streams through sliding time windows. If a compromised administrator attempts mass bans or channel drops, Yurei triggers immediate role stripping, kicks the actor, and activates emergency lockdown.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-gray-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mass-Ban Detection</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Webhook Containment</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Role Stripping</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Server Snapshot Restore</span>
              </div>
            </div>

            {/* Simulated Terminal Box */}
            <div className="w-full lg:w-[420px] bg-dark-bg/90 rounded-2xl p-5 border border-dark-border font-mono text-xs shadow-2xl text-left">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-dark-border/80">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-gray-500 ml-2 text-[11px]">yurei-security-audit.log</span>
              </div>
              <div className="space-y-2 text-gray-300">
                <p className="text-gray-500">[06:35:10] Audit log stream initialized</p>
                <p className="text-yellow-400">[06:35:12] ALERT: Multiple channel deletions detected (3 in 4s)</p>
                <p className="text-red-400 font-bold">[06:35:12] ANTINUKE TRIGGER: Actor 849204... breached threshold</p>
                <p className="text-emerald-400">[06:35:13] SUCCESS: Dangerous roles stripped from actor</p>
                <p className="text-brand-400">[06:35:13] LOCKDOWN: Emergency channel lock engaged</p>
                <p className="text-gray-400">[06:35:14] Incident recorded to PostgreSQL #SEC-4891</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">Everything Included</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Engineered for Modern Discord Communities
          </h2>
          <p className="mt-4 text-gray-400 text-base">
            No empty placeholder commands. Every system is deeply integrated with PostgreSQL, Prisma, Redis, and Discord.js v14.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-8 flex flex-col text-left">
              <div className="w-12 h-12 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center mb-6">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
