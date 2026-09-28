'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Music,
  Headphones,
  Sliders,
  HelpCircle,
  ArrowRight,
  Gift,
  ExternalLink,
} from 'lucide-react';

export default function PremiumPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'lifetime'>('monthly');
  const [redeemInput, setRedeemInput] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<string | null>(null);

  const discordInvite = 'https://discord.gg/M4P4Qrt6G5';

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;
    setRedeemStatus(
      `Code "${redeemInput.toUpperCase()}" submitted. Please run "/premium code redeem ${redeemInput.toUpperCase()}" inside your Discord server to bind it to your guild or account.`
    );
  };

  const plans = [
    {
      name: 'Free Community',
      badge: 'Free Forever',
      price: '$0',
      period: 'forever',
      description: 'Core security and moderation essentials for developing servers.',
      features: [
        'Real-time Anti-Nuke basic alerts',
        'Standard Kick, Ban, Mute & Warn case logs',
        '5 AutoResponder rules',
        '1 Join-to-Create voice generator',
        '2 Support ticket panels',
        '50 Music queue track capacity',
        'Standard Discord support',
      ],
      popular: false,
      ctaText: 'Current Plan',
      ctaHref: 'https://discord.com/oauth2/authorize?client_id=1550514533208952894&permissions=8&scope=bot%20applications.commands',
      isPrimary: false,
    },
    {
      name: 'Server Premium',
      badge: 'Most Popular',
      price: billingCycle === 'monthly' ? '$4.99' : '$39.99',
      period: billingCycle === 'monthly' ? '/ month' : 'one-time lifetime',
      description: 'Maximum defense, unlimited automation, and 24/7 audio for your server.',
      features: [
        'Impenetrable Anti-Nuke with Instant Role Stripping',
        'Automated Snapshot Backups & Restoration',
        '24/7 Music Mode (Stays in Voice Indefinitely)',
        'Audio FX Filters (8D, Bassboost, Nightcore)',
        '100 AutoResponder rules & 50 Custom Commands',
        '25 Interactive Ticket panels with HTML transcripts',
        '10 Join-to-Create dynamic voice hubs',
        'Zero command cooldowns',
        'Priority VIP Ticket Support in Discord',
      ],
      popular: true,
      ctaText: 'Buy Server Premium',
      ctaHref: discordInvite,
      isPrimary: true,
    },
    {
      name: 'Ultimate Bundle',
      badge: 'Maximum Value',
      price: billingCycle === 'monthly' ? '$7.99' : '$59.99',
      period: billingCycle === 'monthly' ? '/ month' : 'one-time lifetime',
      description: '3 Server Premium licenses + User Premium for the ultimate guild owner.',
      features: [
        'Everything in Server Premium for 3 Guilds',
        'User Premium included for yourself globally',
        'Custom Bot Vanity presence access',
        'Exclusive VIP Role in Yurei Support Server',
        'Early access to all upcoming experimental modules',
        'Dedicated 1-on-1 staff setup assistance',
        'Lifetime upgrade protection',
      ],
      popular: false,
      ctaText: 'Buy Ultimate Bundle',
      ctaHref: discordInvite,
      isPrimary: false,
    },
  ];

  const comparisonRows = [
    { feature: 'Autonomous Anti-Nuke Engine', free: 'Basic Alert', premium: 'Full Auto-Containment + Role Strip' },
    { feature: 'Server Structure Backup & Restore', free: '❌', premium: '✅ 15 Encrypted Snapshot Slots' },
    { feature: '24/7 Voice Channel Stay', free: '❌', premium: '✅ Stays 24/7 in Voice' },
    { feature: 'Audio Distortion Filters (8D, Nightcore)', free: '❌', premium: '✅ All Filters Unlocked' },
    { feature: 'AutoResponder Rules', free: '5 triggers', premium: '100 triggers' },
    { feature: 'Support Ticket Panels', free: '2 panels', premium: '25 panels + transcripts' },
    { feature: 'Join-to-Create Voice Hubs', free: '1 hub', premium: '10 hubs' },
    { feature: 'Music Queue Size', free: '50 songs', premium: '1,000 songs' },
    { feature: 'Audit Log Threat Suppression', free: 'Standard', premium: 'Sub-second real-time window' },
    { feature: 'Support Level', free: 'Standard Forum', premium: 'Priority VIP Discord Support' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-semibold mb-4 border border-yellow-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Unlock Enterprise Superpowers
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Level Up Your Discord with <br />
          <span className="text-gradient">Yurei Premium</span>
        </h1>
        <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
          Upgrade your community with autonomous server recovery, 24/7 high-fidelity music, 100+ automation triggers, and dedicated VIP support.
        </p>

        {/* Billing Switcher */}
        <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-dark-card border border-dark-border">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
              billingCycle === 'monthly'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('lifetime')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              billingCycle === 'lifetime'
                ? 'bg-yellow-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Lifetime Pass <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-yellow-900 font-extrabold">BEST VALUE</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
              plan.isPrimary
                ? 'glass-panel border-2 border-yellow-500/60 shadow-2xl shadow-yellow-500/10 scale-105 z-10'
                : 'glass-panel border border-dark-border hover:border-gray-600'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-xs font-extrabold tracking-wide uppercase shadow-lg">
                {plan.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                {!plan.popular && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-dark-card border border-dark-border text-gray-400 font-medium">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-xs text-gray-400 font-medium">{plan.period}</span>
              </div>

              <p className="text-xs text-gray-300 mb-6 leading-relaxed">{plan.description}</p>

              <div className="h-px w-full bg-dark-border mb-6" />

              <div className="space-y-3 mb-8">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <a
                href={plan.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                  plan.isPrimary
                    ? 'glow-btn bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:opacity-90 shadow-lg shadow-yellow-500/25'
                    : 'bg-dark-card border border-dark-border text-white hover:bg-dark-hover hover:border-gray-600'
                }`}
              >
                {plan.ctaText} <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-gray-500 text-center mt-2.5">
                Instant delivery via Discord ticket in <span className="text-brand-400">#support</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Buy & Code Redemption Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        {/* Buy Information Card - Direct Discord Ticket */}
        <div className="glass-panel rounded-3xl p-8 border border-brand-500/30 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold mb-4">
              <Zap className="w-3.5 h-3.5" /> Official Discord Purchase
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">How to Purchase Yurei Premium</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              All premium orders and inquiries are handled directly inside our official Discord support server.
              Simply join the server and open a ticket in <strong className="text-brand-400">#tickets</strong> or <strong className="text-brand-400">#premium-support</strong>.
              Our team will activate your Server Premium immediately.
            </p>

            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border mb-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Check className="w-4 h-4 text-emerald-400" /> Instant Activation via Support Ticket
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Check className="w-4 h-4 text-emerald-400" /> Direct Server License Grant or Code
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Check className="w-4 h-4 text-emerald-400" /> Exclusive VIP Role in Community
              </div>
            </div>
          </div>

          <a
            href={discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="glow-btn px-6 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
          >
            Join Discord to Purchase <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Redeem Code Card */}
        <div className="glass-panel rounded-3xl p-8 border border-dark-border flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4">
              <Gift className="w-3.5 h-3.5" /> Have an Activation Code?
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Redeem Your Premium Code</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Got a promo code or gift license? Enter your code below or use the slash command{' '}
              <code className="px-2 py-0.5 rounded bg-dark-bg text-brand-400 font-mono text-xs">/premium code redeem</code>{' '}
              in your server.
            </p>

            <form onSubmit={handleRedeem} className="space-y-4">
              <input
                type="text"
                placeholder="e.g. YUREI-A1B2-C3D4"
                value={redeemInput}
                onChange={(e) => setRedeemInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-sm text-white placeholder-gray-500 uppercase tracking-widest font-mono focus:outline-none focus:border-brand-500 transition"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white transition flex items-center justify-center gap-2"
              >
                Validate Activation Code
              </button>
            </form>

            {redeemStatus && (
              <div className="mt-4 p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-300 leading-relaxed">
                {redeemStatus}
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-500 text-center mt-6">
            Codes can also be redeemed directly in Discord using <span className="font-mono text-gray-400">/premium code redeem</span>.
          </p>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-dark-border mb-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Full Feature Breakdown</h2>
          <p className="text-sm text-gray-400 mt-2">Compare Free vs Server Premium capabilities side-by-side.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-border/80 text-gray-400 text-xs uppercase">
                <th className="pb-4 font-bold">Feature Capability</th>
                <th className="pb-4 font-bold text-center">Free Tier</th>
                <th className="pb-4 font-bold text-center text-yellow-400">Yurei Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50 text-gray-300">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition">
                  <td className="py-4 font-medium text-white">{row.feature}</td>
                  <td className="py-4 text-center text-gray-400 font-mono text-xs">{row.free}</td>
                  <td className="py-4 text-center font-bold text-emerald-400 font-mono text-xs">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-400 mt-2">Have questions before upgrading? We have answers.</p>
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-dark-border">
            <h4 className="font-bold text-white text-base mb-2">How fast is premium delivered after purchase?</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Instantly! As soon as you purchase in our Discord support server, an activation code or direct server grant is applied to your guild within seconds.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-dark-border">
            <h4 className="font-bold text-white text-base mb-2">Can I transfer my Premium to another server?</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Yes, Server Premium licenses can be transferred to a new server once every 7 days via our support team or dashboard.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-dark-border">
            <h4 className="font-bold text-white text-base mb-2">What happens if my subscription lapses?</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your server seamlessly falls back to the Free plan. None of your data, case logs, or custom settings will be deleted.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-dark-border">
            <h4 className="font-bold text-white text-base mb-2">Where do I get support?</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Our 24/7 staff is available at{' '}
              <a href={discordInvite} target="_blank" rel="noopener noreferrer" className="text-brand-400 underline">
                https://discord.gg/M4P4Qrt6G5
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
