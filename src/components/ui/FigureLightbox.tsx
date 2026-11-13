import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { PaperFigureItem } from '../../types/nadi';

interface FigureLightboxProps {
  figure: PaperFigureItem | null;
  onClose: () => void;
}

export function FigureLightbox({ figure, onClose }: FigureLightboxProps) {
  useEffect(() => {
    if (!figure) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [figure, onClose]);

  if (!figure) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[var(--border-hairline)]">
          <div>
            <p className="font-sub text-[10px] uppercase tracking-wider text-[var(--accent-blue)]">
              {figure.category} · Arsip Figur Paper NADI v2.1
            </p>
            <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
              {figure.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup tampilan gambar"
            className="w-8 h-8 rounded border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white p-4 flex items-center justify-center max-h-[72vh] overflow-auto">
          <img
            src={`./figur/${figure.file}`}
            alt={figure.title}
            className="max-w-full max-h-[65vh] object-contain"
          />
        </div>

        <div className="px-5 py-3 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 text-xs text-[var(--text-secondary)]">
          {figure.caption}
        </div>
      </div>
    </div>
  );
}

