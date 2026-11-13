import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'neutral' | 'blue' | 'teal' | 'green' | 'amber' | 'red';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral:
    'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
  blue:
    'bg-sky-600/10 text-sky-800 dark:text-sky-300 border-sky-600/25',
  teal:
    'bg-teal-600/10 text-teal-800 dark:text-teal-300 border-teal-600/25',
  green:
    'bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border-emerald-600/25',
  amber:
    'bg-amber-600/10 text-amber-800 dark:text-amber-300 border-amber-600/25',
  red:
    'bg-rose-600/10 text-rose-800 dark:text-rose-300 border-rose-600/25',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sub font-semibold tracking-wide border whitespace-nowrap',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

