import { useEffect, useState } from 'react';
import { CommandPalette } from './components/layout/CommandPalette';
import { TopNav } from './components/layout/TopNav';
import { BenchmarksView } from './components/views/BenchmarksView';
import { CaseCardsView } from './components/views/CaseCardsView';
import { ImpactTeamView } from './components/views/ImpactTeamView';
import { OverviewView } from './components/views/OverviewView';
import { PhysicsGraphView } from './components/views/PhysicsGraphView';
import { useTheme } from './hooks/useTheme';
import type { NavTabId } from './types/nadi';
import type { ScenarioMode } from './utils/physics';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [scenario, setScenario] = useState<ScenarioMode>('dasar');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [highlightTripId, setHighlightTripId] = useState<number | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSelectTab = (tab: NavTabId, tripId?: number) => {
    setActiveTab(tab);
    if (tripId !== undefined) setHighlightTripId(tripId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <TopNav
        activeTab={activeTab}
        onSelectTab={(t) => handleSelectTab(t)}
        scenario={scenario}
        onChangeScenario={setScenario}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCommandPalette={() => setPaletteOpen(true)}
      />

      <main className="flex-1 w-full">
        {activeTab === 'overview' && (
          <OverviewView
            scenario={scenario}
            onChangeScenario={setScenario}
            onNavigate={(t) => handleSelectTab(t)}
          />
        )}
        {activeTab === 'cases' && <CaseCardsView highlightTripId={highlightTripId} />}
        {activeTab === 'physics-graph' && <PhysicsGraphView />}
        {activeTab === 'benchmarks' && (
          <BenchmarksView scenario={scenario} onChangeScenario={setScenario} />
        )}
        {activeTab === 'impact-team' && <ImpactTeamView />}
      </main>

      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-xs text-[var(--text-secondary)]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <img
                src={theme === 'dark' ? './brand/logo-dark.png' : './brand/logo-light.png'}
                alt="NADI Wordmark"
                className="h-6 sm:h-7 w-auto object-contain"
              />
              <span className="font-sub text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                Neraca Aliran Distribusi Intelligence
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Tim Sains Data Universitas Negeri Surabaya (Faishal Muflih Irfanu Tsaqib, Daffa Ahmad
              Pangreksa, Muhammad Habib Nur Aiman, Rizki Piji Fathoni) · IKMS 2026 PT Pertamina Patra
              Niaga.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:text-right text-[11px] text-[var(--text-muted)] font-sub">
            <span>49.508 Trip · 3 Terminal · 120 SPBU · 150 Kru · 100 Truk</span>
            <span className="hidden sm:inline text-[var(--border-strong)]">|</span>
            <span>Seed Utama = 42 · Hash: 83a4a949 / 5eb161c3</span>
          </div>
        </div>
      </footer>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(tab, tripId) => handleSelectTab(tab, tripId)}
      />
    </div>
  );
}

