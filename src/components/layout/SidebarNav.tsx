import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  ShieldAlert,
  Users,
} from 'lucide-react';
import type { NavTabId } from '../../types/nadi';
import type { ScenarioMode } from '../../utils/physics';
import { cn } from '../../utils/cn';

interface SidebarNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  scenario: ScenarioMode;
}

export const NAV_SECTIONS: {
  id: NavTabId;
  code: string;
  label: string;
  subtitle: string;
  pill: string;
  icon: typeof Activity;
}[] = [
  {
    id: 'overview',
    code: '01',
    label: 'Ringkasan & Fisika',
    subtitle: 'Konteks Tuban/Sumut & VCF 15°C',
    pill: 'v2.1',
    icon: Activity,
  },
  {
    id: 'cases',
    code: '02',
    label: 'Kartu Kasus & SHAP',
    subtitle: 'Triase Kuota 5% & Atribusi',
    pill: '12 Top',
    icon: ShieldAlert,
  },
  {
    id: 'physics-graph',
    code: '03',
    label: '29 Fitur & Graf Kolusi',
    subtitle: 'DBSCAN, Residual & Galeri',
    pill: 'D1–D16',
    icon: GitBranch,
  },
  {
    id: 'benchmarks',
    code: '04',
    label: 'Benchmark & Ketahanan',
    subtitle: '20 Seed, Ablasi & Grade Etanol',
    pill: '20 Seed',
    icon: BarChart3,
  },
  {
    id: 'impact-team',
    code: '05',
    label: 'Dampak, Etika & Tim',
    subtitle: 'SECI, Ekonomi & Tim UNESA',
    pill: 'IKMS',
    icon: Users,
  },
];

export function SidebarNav({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  scenario,
}: SidebarNavProps) {
  return (
    <aside
      aria-label="Navigasi Konsol NADI"
      className={cn(
        'hidden lg:flex flex-col shrink-0 sticky top-0 h-screen bg-[var(--bg-rail)] text-slate-100 border-r border-slate-800/80 transition-[width] duration-200 select-none z-30',
        collapsed ? 'w-[72px]' : 'w-[264px]'
      )}
    >
      {/* Brand Lockup inside Deep Slate Console Rail */}
      <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectTab('overview')}
          className="flex items-center gap-2.5 min-w-0 focus:outline-none text-left group"
          title="Kembali ke Ringkasan NADI"
        >
          {collapsed ? (
            <img
              src="./brand/favicon.svg"
              alt="NADI"
              className="w-8 h-8 rounded object-contain shrink-0"
            />
          ) : (
            <div className="flex flex-col">
              <img
                src="./brand/logo-dark.png"
                alt="Logo NADI"
                className="h-7 w-auto max-w-[126px] object-contain object-left transition-transform duration-150 group-hover:scale-[1.02]"
              />
              <span className="text-[9.5px] font-sub uppercase tracking-[0.16em] text-sky-400 mt-0.5">
                Console · IKMS 2026
              </span>
            </div>
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          className="w-7 h-7 rounded border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/80 flex items-center justify-center text-slate-300 shrink-0 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Section Navigation */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5">
        {!collapsed && (
          <p className="px-2.5 pb-1.5 text-[10px] font-sub uppercase tracking-[0.16em] text-slate-500">
            Modul Investigasi
          </p>
        )}

        {NAV_SECTIONS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'relative w-full rounded-md px-2.5 py-2.5 flex items-start gap-3 text-left transition-colors',
                active
                  ? 'bg-sky-500/15 text-white border border-sky-500/40'
                  : 'text-slate-300 hover:bg-[var(--bg-rail-hover)] hover:text-white border border-transparent'
              )}
            >
              {active && (
                <motion.span
                  layoutId="nadi-rail-indicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-rose-500"
                />
              )}

              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 mt-0.5',
                  active ? 'text-sky-400' : 'text-slate-400'
                )}
              />

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-sub text-xs font-semibold truncate">{item.label}</span>
                    <span
                      className={cn(
                        'font-mono-num text-[9.5px] px-1.5 py-0.5 rounded shrink-0',
                        active
                          ? 'bg-sky-400/20 text-sky-300'
                          : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      {item.pill}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Calibration Telemetry Spec Box */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-[11px]">
          <div className="rounded-md border border-slate-800 bg-slate-900/80 p-3 space-y-1.5">
            <div className="flex items-center justify-between font-sub">
              <span className="text-slate-400 uppercase text-[10px]">Arsip v2.1</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-semibold text-[10px]',
                  scenario === 'sulit' ? 'text-rose-400' : 'text-emerald-400'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    scenario === 'sulit' ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'
                  )}
                />
                {scenario === 'sulit' ? 'Sulit · σ 0,559%' : 'Dasar · σ 0,280%'}
              </span>
            </div>
            <p className="font-mono-num text-[11px] text-slate-300 leading-snug">
              49.508 Trip · 180 Hari · Kuota 5%/Hr
            </p>
            <p className="font-mono-num text-[10px] text-slate-500">
              SHA: {scenario === 'sulit' ? '5eb161c3' : '83a4a949'} · Seed 42–61
            </p>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug px-0.5">
            Pertamina Patra Niaga · Tim Sains Data UNESA
          </p>
        </div>
      )}
    </aside>
  );
}

