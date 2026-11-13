import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Cpu, FileSearch, Search, ShieldAlert, X } from 'lucide-react';
import { caseCardsTop, kamusData, metodeArsitektur } from '../../data';
import type { NavTabId } from '../../types/nadi';
import { cn } from '../../utils/cn';
import { formatNumberId } from '../../utils/format';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTabId, highlightTripId?: number) => void;
}

const QUICK_CHIPS = ['C071', 'E50', 'inter_z_stop', 'B_plus', 'kolusi'];

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const cases = caseCardsTop
      .filter(
        (c) =>
          !q ||
          `${c.trip_id} ${c.crew_id} ${c.spbu_id} ${c.terminal_id} ${c.ethanol_grade} ${c.dugaan_sebab}`
            .toLowerCase()
            .includes(q)
      )
      .slice(0, 6);

    const dictionary = kamusData
      .filter(
        (d) =>
          !q ||
          `${d.kode} ${d.fitur} ${d.tier} ${d.sumber_di_lapangan}`.toLowerCase().includes(q)
      )
      .slice(0, 6);

    const models = metodeArsitektur.filter(
      (m) =>
        !q ||
        `${m.metode} ${m.peran_arsitektur} ${m.mekanisme_kerja}`.toLowerCase().includes(q)
    );

    return { cases, dictionary, models };
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-start justify-center pt-[8vh] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-hairline)]">
          <Search className="w-4 h-4 text-[var(--accent-blue)] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari Kartu Kasus (trip/kru C071), fitur D1–D16, grade E50, atau metode model..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[11px] font-sub text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1.5"
            >
              Hapus
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Tutup pencarian"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-2.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-sub text-[var(--text-muted)] mr-1">Cepat:</span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-sub border transition-colors',
                query === chip
                  ? 'border-[var(--accent-blue)] bg-sky-600/10 text-[var(--accent-blue)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto divide-y divide-[var(--border-hairline)]">
          {results.cases.length > 0 && (
            <div className="p-3 space-y-1.5">
              <p className="px-2 text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                Kartu Kasus Prioritas Tier 1
              </p>
              {results.cases.map((c) => (
                <button
                  key={c.trip_id}
                  onClick={() => {
                    onNavigate('cases', c.trip_id);
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-md hover:bg-[var(--bg-subtle)] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldAlert className="w-4 h-4 text-[var(--accent-red)] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-sub font-semibold text-[var(--text-primary)] truncate">
                        Trip #{c.trip_id} · Kru {c.crew_id} · {c.spbu_id} ({c.ethanol_grade})
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {c.dugaan_sebab}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-num text-xs font-semibold text-[var(--accent-red)] ml-3 shrink-0">
                    {formatNumberId(c.skor_prob * 100, 1)}%
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.dictionary.length > 0 && (
            <div className="p-3 space-y-1.5">
              <p className="px-2 text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                Kamus Data & Indikator Rekayasa Fitur
              </p>
              {results.dictionary.map((d) => (
                <button
                  key={d.kode}
                  onClick={() => {
                    onNavigate('physics-graph');
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-md hover:bg-[var(--bg-subtle)] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className="w-4 h-4 text-[var(--accent-teal)] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-sub font-semibold text-[var(--text-primary)] truncate">
                        {d.kode}: {d.fitur}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {d.sumber_di_lapangan}
                      </p>
                    </div>
                  </div>
                  <span className="font-sub text-[10px] px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] ml-3 shrink-0">
                    {d.tier}
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.models.length > 0 && (
            <div className="p-3 space-y-1.5">
              <p className="px-2 text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
                Model Evaluasi & Benchmark
              </p>
              {results.models.map((m) => (
                <button
                  key={m.metode}
                  onClick={() => {
                    onNavigate('benchmarks');
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-md hover:bg-[var(--bg-subtle)] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Cpu className="w-4 h-4 text-[var(--accent-blue)] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-sub font-semibold text-[var(--text-primary)] truncate">
                        {m.metode} — {m.peran_arsitektur}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {m.mekanisme_kerja}
                      </p>
                    </div>
                  </div>
                  <FileSearch className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {results.cases.length === 0 &&
            results.dictionary.length === 0 &&
            results.models.length === 0 && (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                Tidak ada entitas NADI yang cocok dengan pencarian "{query}".
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

