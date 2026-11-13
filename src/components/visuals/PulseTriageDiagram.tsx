import { motion } from 'framer-motion';
import type { ScenarioMode } from '../../utils/physics';

interface PulseTriageDiagramProps {
  scenario: ScenarioMode;
}

export function PulseTriageDiagram({ scenario }: PulseTriageDiagramProps) {
  const isHard = scenario === 'sulit';

  return (
    <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] overflow-hidden">
      {/* Calibration Header */}
      <div className="px-4 py-2.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/70 flex items-center justify-between gap-2 text-[11px] font-sub">
        <span className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <span
            className={`w-2 h-2 rounded-full ${isHard ? 'bg-[var(--accent-red)] animate-pulse' : 'bg-[var(--accent-green)]'}`}
          />
          Alur Rekonsiliasi &amp; Triase NADI v2.1
        </span>
        <span className="text-[var(--text-muted)]">
          {isHard ? 'Hash: 5eb161c3 · Sulit' : 'Hash: 83a4a949 · Dasar'}
        </span>
      </div>

      {/* Crisp Schematic Flow + Animated ECG/Balance Pulse */}
      <div className="p-4 sm:p-5 space-y-4">
        <svg
          viewBox="0 0 640 210"
          className="w-full h-auto"
          role="img"
          aria-label="Diagram alur rekonsiliasi fisika Terminal-Truk-SPBU dan triase B_plus"
        >
          {/* Subtle calibration grid */}
          <defs>
            <pattern id="nadiGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.06"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="640" height="210" fill="url(#nadiGrid)" className="text-[var(--text-muted)]" />

          {/* Connecting backbone conduit */}
          <path
            d="M 85 78 L 235 78 L 265 44 L 285 112 L 308 78 L 415 78 L 555 78"
            fill="none"
            stroke={isHard ? '#fb7185' : '#0057a3'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.28"
          />

          {/* Animated Calibration Signal Pulse */}
          <motion.path
            d="M 85 78 L 235 78 L 265 44 L 285 112 L 308 78 L 415 78 L 555 78"
            fill="none"
            stroke={isHard ? '#e11d48' : '#0ea5e9'}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="110 460"
            initial={{ strokeDashoffset: 570 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
          />

          {/* Feedback loop from Investigator back to Model */}
          <path
            d="M 555 116 L 555 170 L 285 170 L 285 122"
            fill="none"
            stroke="#0f8a4b"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <polygon points="285,118 280,127 290,127" fill="#0f8a4b" />

          {/* Node 1: Terminal & Tangki */}
          <g transform="translate(20, 42)">
            <rect
              width="125"
              height="72"
              rx="6"
              fill="var(--bg-canvas)"
              stroke="var(--border-strong)"
              strokeWidth="1.5"
            />
            <text x="12" y="23" fontSize="10" fontFamily="IBM Plex Mono" fill="var(--accent-blue)" fontWeight="700">
              01. TERMINAL (3)
            </text>
            <text x="12" y="42" fontSize="12" fontFamily="Bricolage Grotesque" fill="var(--text-primary)" fontWeight="700">
              V_load &amp; VCF 15°C
            </text>
            <text x="12" y="58" fontSize="9.5" fontFamily="IBM Plex Mono" fill="var(--text-muted)">
              E10 / E20 / E50
            </text>
          </g>

          {/* Node 2: Rekonsiliasi & Bias + Fitur */}
          <g transform="translate(195, 22)">
            <rect
              width="180"
              height="88"
              rx="6"
              fill="var(--bg-canvas)"
              stroke={isHard ? 'var(--accent-red)' : 'var(--accent-blue)'}
              strokeWidth="1.8"
            />
            <text x="12" y="20" fontSize="10" fontFamily="IBM Plex Mono" fill="var(--accent-red)" fontWeight="700">
              02. NERACA &amp; 29 FITUR
            </text>
            <text x="12" y="39" fontSize="12" fontFamily="Bricolage Grotesque" fill="var(--text-primary)" fontWeight="700">
              z_adj + CUSUM + DBSCAN
            </text>
            <text x="12" y="56" fontSize="9.5" fontFamily="IBM Plex Mono" fill="var(--text-secondary)">
              σ = {isHard ? '0,559%' : '0,280%'} · Trace: {isHard ? '55%' : '90%'}
            </text>
            <text x="12" y="73" fontSize="9.5" fontFamily="IBM Plex Mono" fill="var(--text-muted)">
              SPBU + Terminal + Truk Bias
            </text>
          </g>

          {/* Node 3: Scoring & Triage */}
          <g transform="translate(422, 40)">
            <rect
              width="198"
              height="76"
              rx="6"
              fill="var(--bg-canvas)"
              stroke="var(--accent-green)"
              strokeWidth="1.6"
            />
            <text x="12" y="22" fontSize="10" fontFamily="IBM Plex Mono" fill="var(--accent-green)" fontWeight="700">
              03. TRIASE KARTU KASUS
            </text>
            <text x="12" y="41" fontSize="12" fontFamily="Bricolage Grotesque" fill="var(--text-primary)" fontWeight="700">
              B_plus (75%) + IF_AAD (25%)
            </text>
            <text x="12" y="59" fontSize="9.5" fontFamily="IBM Plex Mono" fill="var(--text-secondary)">
              Top 5% Kuota · TreeSHAP (3 Faktor)
            </text>
          </g>

          {/* Bottom Feedback Label */}
          <rect
            x="315"
            y="156"
            width="228"
            height="26"
            rx="4"
            fill="var(--bg-surface)"
            stroke="#0f8a4b"
            strokeOpacity="0.45"
          />
          <text
            x="429"
            y="173"
            textAnchor="middle"
            fontSize="9.5"
            fontFamily="IBM Plex Mono"
            fill="var(--accent-green)"
            fontWeight="600"
          >
            Replay Audit (+3 hari delay · 20% miss)
          </text>
        </svg>

        {/* Bottom concise summary bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-hairline)] text-center">
          <div>
            <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
              Skala Simulasi
            </p>
            <p className="font-mono-num text-sm font-bold text-[var(--text-primary)]">49.508 Trip</p>
          </div>
          <div>
            <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
              Anomali Uji
            </p>
            <p className="font-mono-num text-sm font-bold text-[var(--accent-red)]">
              1.086 (2,2%)
            </p>
          </div>
          <div>
            <p className="text-[10px] font-sub uppercase tracking-wider text-[var(--text-muted)]">
              Replikasi Uji
            </p>
            <p className="font-mono-num text-sm font-bold text-[var(--accent-blue)]">
              20 Seed (42–61)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

