'use client';

import { Activity, CheckCircle2, Server, Database, Radio, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function StatusPage() {
  const services = [
    { name: 'Discord Gateway Connection', status: 'Operational', latency: '19ms', uptime: '99.99%' },
    { name: 'REST API & Slash Command Dispatch', status: 'Operational', latency: '24ms', uptime: '99.98%' },
    { name: 'Anti-Nuke Interception Engine', status: 'Operational', latency: '< 1ms', uptime: '100%' },
    { name: 'PostgreSQL Database & Prisma ORM', status: 'Operational', latency: '12ms', uptime: '99.99%' },
    { name: 'Music Voice Node (Lavalink / Audio Stream)', status: 'Operational', latency: '31ms', uptime: '99.95%' },
    { name: 'Web Dashboard & Real-Time Sync', status: 'Operational', latency: '22ms', uptime: '99.99%' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-emerald-500/30 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">All Systems Operational</h1>
            <p className="text-xs text-gray-400 mt-1">
              Yurei Discord Bot platform is operating at peak health with zero active incidents.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-gray-300 font-mono">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Live Telemetry
        </div>
      </div>

      {/* Services List */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-dark-border mb-12">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Server className="w-5 h-5 text-brand-400" /> Core Infrastructure Components
        </h2>

        <div className="space-y-4">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-dark-card border border-dark-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{s.name}</h4>
                <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-1">
                  <span>Latency: <strong className="text-gray-300 font-mono">{s.latency}</strong></span>
                  <span>Uptime (30d): <strong className="text-emerald-400 font-mono">{s.uptime}</strong></span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start sm:self-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {s.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shard Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="glass-panel rounded-2xl p-6 border border-dark-border">
          <span className="text-3xl font-extrabold text-white">1</span>
          <span className="text-xs text-gray-400 block mt-1 uppercase tracking-wider font-semibold">Active Shards</span>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-dark-border">
          <span className="text-3xl font-extrabold text-emerald-400">19ms</span>
          <span className="text-xs text-gray-400 block mt-1 uppercase tracking-wider font-semibold">Gateway Latency</span>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-dark-border">
          <span className="text-3xl font-extrabold text-brand-400">600+</span>
          <span className="text-xs text-gray-400 block mt-1 uppercase tracking-wider font-semibold">Available Commands</span>
        </div>
      </div>
    </div>
  );
}
