import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  sortValue?: (row: T) => number | string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  searchMatcher?: (row: T, query: string) => boolean;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
  maxHeightClass?: string;
  toolbarRight?: ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  searchPlaceholder = 'Cari data...',
  searchMatcher,
  onRowClick,
  selectedKey,
  maxHeightClass = 'max-h-[420px]',
  toolbarRight,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data;
    if (q && searchMatcher) {
      rows = rows.filter((r) => searchMatcher(r, q));
    }
    if (sortCol) {
      const col = columns.find((c) => c.key === sortCol);
      if (col?.sortValue) {
        const getter = col.sortValue;
        rows = [...rows].sort((a, b) => {
          const va = getter(a);
          const vb = getter(b);
          if (typeof va === 'number' && typeof vb === 'number') {
            return sortDir === 'asc' ? va - vb : vb - va;
          }
          return sortDir === 'asc'
            ? String(va).localeCompare(String(vb))
            : String(vb).localeCompare(String(va));
        });
      }
    }
    return rows;
  }, [data, query, searchMatcher, sortCol, sortDir, columns]);

  const handleSort = (colKey: string, hasSort: boolean) => {
    if (!hasSort) return;
    if (sortCol === colKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  return (
    <div className="border-t border-b border-[var(--border-hairline)] overflow-hidden">
      {(searchMatcher || toolbarRight) && (
        <div className="py-3 border-b border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
          {searchMatcher ? (
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]"
              />
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2 text-xs font-sub text-[var(--text-muted)]">
            <span>{filtered.length} baris</span>
            {toolbarRight}
          </div>
        </div>
      )}

      <div className={cn('overflow-auto', maxHeightClass)}>
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--bg-canvas)] border-b border-[var(--border-hairline)]">
            <tr>
              {columns.map((col) => {
                const sortable = Boolean(col.sortValue);
                const isSorted = sortCol === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, sortable)}
                    className={cn(
                      'px-3 py-2.5 text-[11px] font-sub font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap select-none',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      sortable && 'cursor-pointer hover:text-[var(--text-primary)]',
                      col.className
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {sortable &&
                        (isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-[var(--accent-blue)]" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-[var(--accent-blue)]" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        ))}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)] text-xs">
            {filtered.map((row) => {
              const key = rowKey(row);
              const isSelected = selectedKey === key;
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer',
                    isSelected
                      ? 'bg-sky-600/10 dark:bg-sky-500/15'
                      : 'hover:bg-[var(--bg-subtle)]/70'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-3 py-2.5 align-middle text-[var(--text-secondary)]',
                        col.align === 'right' && 'text-right font-mono-num',
                        col.align === 'center' && 'text-center',
                        col.className
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-xs text-[var(--text-muted)]"
                >
                  Tidak ada baris data yang cocok dengan kata kunci pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

