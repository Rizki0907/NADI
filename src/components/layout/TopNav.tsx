import { Menu, Moon, Search, ShieldAlert, Sun, X } from 'lucide-react';
import { useState } from 'react';
import type { Theme } from '../../hooks/useTheme';
import type { NavTabId } from '../../types/nadi';
import type { ScenarioMode } from '../../utils/physics';
import { cn } from '../../utils/cn';
import { NAV_SECTIONS } from './SidebarNav';

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
  const currentSection = NAV_SECTIONS.find((s) => s.id === activeTab) ?? NAV_SECTIONS[0];

  return (
    <header className="sticky top-0 z-20 w-full border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Logo + Active Workbench Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onSelectTab('overview')}
            className="lg:hidden shrink-0 focus:outline-none"
            aria-label="Beranda NADI"
          >
            <img
              src={theme === 'dark' ? './brand/logo-dark.png' : './brand/logo-light.png'}
              alt="Logo NADI"
              className="h-7 w-auto max-w-[116px] object-contain"
            />
          </button>

          <div className="hidden lg:flex items-center gap-2.5 min-w-0">
            <span className="font-mono-num text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--accent-blue)]">
              MODUL {currentSection.code}
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-[var(--text-primary)] truncate leading-tight">
                {currentSection.label}
              </p>
              <p className="text-[11px] font-sub text-[var(--text-muted)] truncate leading-tight">
                {currentSection.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Utility Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCommandPalette}
            aria-label="Cari Kasus Trip, Kru, Fitur, atau Model"
            className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-sub text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5 text-[var(--accent-blue)] shrink-0" />
            <span className="hidden sm:inline">Cari Kasus / Fitur...</span>
            <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
              Ctrl K
            </kbd>
          </button>

          {/* Scenario Toggle */}
          <div
            className="hidden sm:flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-0.5 text-[11px] font-sub whitespace-nowrap"
            role="group"
            aria-label="Pilih Skenario Uji"
            title="Skenario Dasar (σ=0,280%, TRACE_PROB=0,90) vs Skenario Sulit (σ=0,559%, TRACE_PROB=0,55)"
          >
            <button
              onClick={() => onChangeScenario('dasar')}
              className={cn(
                'px-2.5 py-1 rounded font-semibold transition-colors',
                scenario === 'dasar'
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              Dasar <span className="hidden xl:inline opacity-80">(0,28%)</span>
            </button>
            <button
              onClick={() => onChangeScenario('sulit')}
              className={cn(
                'px-2.5 py-1 rounded font-semibold transition-colors inline-flex items-center gap-1',
                scenario === 'sulit'
                  ? 'bg-[var(--accent-red)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <ShieldAlert className="w-3 h-3 hidden xl:inline" />
              Sulit <span className="hidden xl:inline opacity-80">(0,56%)</span>
            </button>
          </div>

          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--accent-blue)] transition-colors active:scale-95 shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu Navigasi"
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] shrink-0"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {NAV_SECTIONS.map((item) => {
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
                  {item.code}. {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2 text-xs font-sub sm:hidden">
            <span className="text-[var(--text-muted)]">Skenario:</span>
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
