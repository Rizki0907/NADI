import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface EditorialHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  accent?: 'blue' | 'red' | 'green';
}

export function EditorialHeader({
  eyebrow,
  title,
  description,
  className,
  accent = 'blue',
}: EditorialHeaderProps) {
  const barColor =
    accent === 'red'
      ? 'bg-[var(--accent-red)]'
      : accent === 'green'
        ? 'bg-[var(--accent-green)]'
        : 'bg-[var(--accent-blue)]';

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center gap-2.5">
        <span className={cn('h-3.5 w-1 rounded-full shrink-0', barColor)} />
        <p className="text-[11px] font-sub font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {eyebrow}
        </p>
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
}

