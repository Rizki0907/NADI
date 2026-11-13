import { motion } from 'framer-motion';
import { Menu, Moon, Search, ShieldAlert, Sun, X } from 'lucide-react';
import { useState } from 'react';
import type { Theme } from '../../hooks/useTheme';
import type { NavTabId } from '../../types/nadi';
import type { ScenarioMode } from '../../utils/physics';
import { cn } from '../../utils/cn';

interface TopNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  scenario: ScenarioMode;
  onChangeScenario: (s: ScenarioMode) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
}

const NAV_ITEMS: { id: NavTabId; shortLabel: string; label: string }[] = [
  { id: 'overview', shortLabel: 'Ringkasan', label: 'Ringkasan & Fisika' },
  { id: 'cases', shortLabel: 'Kartu Kasus', label: 'Kartu Kasus & SHAP' },
  { id: 'physics-graph', shortLabel: 'Fitur & Graf', label: '29 Fitur & Graf Kolusi' },
  { id: 'benchmarks', shortLabel: 'Uji 20-Seed', label: 'Benchmark & Ketahanan' },
  { id: 'impact-team', shortLabel: 'Dampak & Tim', label: 'Dampak, Etika & Tim' },
];

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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]/95 backdrop-blur-md">
      {/* Calibration hair-rule stripe distinguishing NADI metrology console */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-red)] to-[var(--accent-green)] opacity-85" />

      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 h-16 flex items-center justify-between gap-2 lg:gap-3">
        {/* NADI Wordmark */}
        <button
          onClick={() => onSelectTab('overview')}
          className="flex items-center gap-2.5 shrink-0 focus:outline-none group"
          aria-label="Kembali ke Ringkasan & Fisika NADI"
        >
          <img
            src={theme === 'dark' ? './brand/logo-dark.png' : './brand/logo-light.png'}
            alt="Logo NADI"
            className="h-7 sm:h-8 w-auto max-w-[126px] object-contain transition-transform duration-150 group-hover:scale-[1.02]"
          />
          <span className="hidden 2xl:inline-flex flex-col text-left pl-3 border-l border-[var(--border-hairline)] leading-tight">
            <span className="text-[10px] font-sub uppercase tracking-[0.14em] text-[var(--accent-blue)] font-semibold">
              IKMS 2026 · v2.1
            </span>
            <span className="text-[11px] font-sub text-[var(--text-muted)]">
              Triase Susut BBM
            </span>
          </span>
        </button>

        {/* Auto-fit Desktop Nav */}
        <nav
          className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1 min-w-0"
          aria-label="Navigasi Utama NADI"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'relative px-2 xl:px-3 py-2 text-xs font-sub font-semibold transition-colors duration-150 whitespace-nowrap',
                  active
                    ? 'text-[var(--accent-blue)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <span className="2xl:hidden">{item.shortLabel}</span>
                <span className="hidden 2xl:inline">{item.label}</span>
                {active && (
                  <motion.span
                    layoutId="nadi-nav-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute left-2 xl:left-3 right-2 xl:right-3 -bottom-[17px] h-[2.5px] bg-[var(--accent-red)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Console Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenCommandPalette}
            aria-label="Cari Kasus Trip, Kru, SPBU, atau Fitur"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-sub text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5 text-[var(--accent-blue)] shrink-0" />
            <span className="hidden 2xl:inline">Cari Kasus, Kru, Fitur...</span>
            <span className="hidden sm:inline 2xl:hidden">Cari</span>
          </button>

          {/* Scenario Toggle: Dasar (83a4a949) vs Sulit (5eb161c3) */}
          <div
            className="hidden md:flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] p-0.5 text-[11px] font-sub whitespace-nowrap"
            role="group"
            aria-label="Pilih Skenario Uji Ketidakpastian"
            title="Skenario Dasar (σ=0,280%, TRACE_PROB=0,90) vs Skenario Sulit (σ=0,559%, TRACE_PROB=0,55)"
          >
            <button
              onClick={() => onChangeScenario('dasar')}
              className={cn(
                'px-2 xl:px-2.5 py-1 rounded font-semibold transition-colors',
                scenario === 'dasar'
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              Dasar <span className="hidden 2xl:inline opacity-80">(0,28%)</span>
            </button>
            <button
              onClick={() => onChangeScenario('sulit')}
              className={cn(
                'px-2 xl:px-2.5 py-1 rounded font-semibold transition-colors inline-flex items-center gap-1',
                scenario === 'sulit'
                  ? 'bg-[var(--accent-red)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <ShieldAlert className="w-3 h-3 hidden 2xl:inline" />
              Sulit <span className="hidden 2xl:inline opacity-80">(0,56%)</span>
            </button>
          </div>

          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-blue)] transition-colors active:scale-95 shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu Navigasi"
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shrink-0"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded text-xs font-sub font-semibold border transition-colors',
                    active
                      ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2 text-xs font-sub">
            <span className="text-[var(--text-muted)]">Skenario Simulasi:</span>
            <div className="flex gap-1">
              <button
                onClick={() => onChangeScenario('dasar')}
                className={cn(
                  'px-2.5 py-1 rounded border',
                  scenario === 'dasar'
                    ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]'
                    : 'border-[var(--border-strong)] text-[var(--text-secondary)]'
                )}
              >
                Dasar (83a4a949)
              </button>
              <button
                onClick={() => onChangeScenario('sulit')}
                className={cn(
                  'px-2.5 py-1 rounded border',
                  scenario === 'sulit'
                    ? 'bg-[var(--accent-red)] text-white border-[var(--accent-red)]'
                    : 'border-[var(--border-strong)] text-[var(--text-secondary)]'
                )}
              >
                Sulit (5eb161c3)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

