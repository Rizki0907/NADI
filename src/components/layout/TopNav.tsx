import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  GitBranch,
  Menu,
  Moon,
  Search,
  ShieldAlert,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { Theme } from '../../hooks/useTheme';
import type { NavTabId } from '../../types/nadi';
import { cn } from '../../utils/cn';
import type { ScenarioMode } from '../../utils/physics';

export const TOP_NAV_ITEMS: {
  id: NavTabId;
  code: string;
  label: string;
  subtitle: string;
  icon: typeof Activity;
}[] = [
  {
    id: 'overview',
    code: '01',
    label: 'Ringkasan & Fisika',
    subtitle: 'Konteks & VCF 15°C',
    icon: Activity,
  },
  {
    id: 'cases',
    code: '02',
    label: 'Kartu Kasus',
    subtitle: 'Triase Kuota 5% & SHAP',
    icon: ShieldAlert,
  },
  {
    id: 'physics-graph',
    code: '03',
    label: 'Graf & Fitur',
    subtitle: '29 Fitur, DBSCAN & Figur',
    icon: GitBranch,
  },
  {
    id: 'benchmarks',
    code: '04',
    label: 'Benchmark',
    subtitle: '20 Seed, Ablasi & Etanol',
    icon: BarChart3,
  },
  {
    id: 'impact-team',
    code: '05',
    label: 'Dampak & Tim',
    subtitle: 'SECI, Pilot & Tim UNESA',
    icon: Users,
  },
];

interface TopNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  scenario: ScenarioMode;
  onChangeScenario: (s: ScenarioMode) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
}

export function TopNav({
  activeTab,
  onSelectTab,
  scenario,
  onChangeScenario,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
}: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
      {/* Subtle 2px clinical signal bar */}
      <div className="h-[2px] w-full bg-[var(--accent-blue)] flex">
        <span className="h-full w-1/4 bg-[var(--accent-red)]" />
        <span className="h-full w-1/4 bg-[var(--accent-green)]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Brand Lockup (Balanced & Auto-Fit) */}
        <button
          onClick={() => {
            onSelectTab('overview');
            setMobileOpen(false);
          }}
          className="flex items-center gap-2.5 shrink-0 focus:outline-none group"
          aria-label="Beranda NADI"
        >
          <img
            src={theme === 'dark' ? './brand/logo-dark.png' : './brand/logo-light.png'}
            alt="Logo NADI"
            className="h-6 sm:h-7 w-auto max-w-[104px] object-contain transition-transform duration-150 group-hover:scale-[1.02]"
          />
          <div className="hidden 2xl:flex flex-col text-left leading-none border-l border-[var(--border-hairline)] pl-2.5">
            <span className="font-sub text-[10px] font-bold tracking-[0.14em] text-[var(--accent-blue)] uppercase">
              IKMS 2026
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">v2.1 · 49.508 Trip</span>
          </div>
        </button>

        {/* Center: Horizontal Navigation Menu */}
        <nav
          aria-label="Navigasi Utama NADI"
          className="hidden lg:flex items-center gap-1 min-w-0"
        >
          {TOP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'relative px-2.5 xl:px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[11px] xl:text-xs font-sub transition-colors whitespace-nowrap shrink-0',
                  active
                    ? 'text-[var(--text-primary)] font-semibold bg-[var(--bg-canvas)] border border-[var(--border-strong)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)]/70 border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-3.5 h-3.5 shrink-0',
                    active ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)]'
                  )}
                />
                <span>{item.label}</span>
                {active && (
                  <motion.span
                    layoutId="nadi-topnav-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute left-2.5 right-2.5 -bottom-[1px] h-[2px] rounded-full bg-[var(--accent-blue)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Command Search, Scenario Mode, Theme & Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenCommandPalette}
            aria-label="Cari Kasus Trip, Kru, Fitur, atau Model"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[11px] font-sub text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5 text-[var(--accent-blue)] shrink-0" />
            <span className="hidden sm:inline">Cari</span>
            <kbd className="hidden xl:inline-block px-1 py-0.5 text-[9.5px] rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
              Ctrl K
            </kbd>
          </button>

          <div
            className="hidden sm:flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-0.5 text-[10.5px] font-sub whitespace-nowrap"
            role="group"
            aria-label="Pilih skenario simulasi"
          >
            <button
              onClick={() => onChangeScenario('dasar')}
              className={cn(
                'px-2 py-1 rounded transition-colors',
                scenario === 'dasar'
                  ? 'bg-[var(--accent-blue)] text-white font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              Dasar
            </button>
            <button
              onClick={() => onChangeScenario('sulit')}
              className={cn(
                'px-2 py-1 rounded transition-colors flex items-center gap-1',
                scenario === 'sulit'
                  ? 'bg-[var(--accent-red)] text-white font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <ShieldAlert className="w-3 h-3 shrink-0" />
              Sulit
            </button>
          </div>

          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className="w-8 h-8 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Buka menu navigasi"
            className="lg:hidden w-8 h-8 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] flex items-center justify-center text-[var(--text-primary)]"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {TOP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 rounded-md border text-left flex items-center justify-between text-xs font-sub',
                    active
                      ? 'bg-sky-500/10 border-[var(--accent-blue)] text-[var(--text-primary)] font-semibold'
                      : 'bg-[var(--bg-canvas)] border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                    {item.label}
                  </span>
                  <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                    {item.code}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sm:hidden flex items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
            <button
              onClick={() => onChangeScenario('dasar')}
              className={cn(
                'flex-1 py-1.5 rounded border text-xs font-sub',
                scenario === 'dasar'
                  ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] font-semibold'
                  : 'border-[var(--border-strong)] text-[var(--text-secondary)]'
              )}
            >
              Dasar (0,28%)
            </button>
            <button
              onClick={() => onChangeScenario('sulit')}
              className={cn(
                'flex-1 py-1.5 rounded border text-xs font-sub',
                scenario === 'sulit'
                  ? 'bg-[var(--accent-red)] text-white border-[var(--accent-red)] font-semibold'
                  : 'border-[var(--border-strong)] text-[var(--text-secondary)]'
              )}
            >
              Sulit (0,56%)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
