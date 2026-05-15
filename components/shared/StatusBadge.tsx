import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const color = STATUS_COLORS[status] ?? '#64748B';
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-display font-medium',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5',
      ].join(' ')}
      style={{
        background: `${color}1A`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{
          background: color,
          width: size === 'sm' ? 4 : 6,
          height: size === 'sm' ? 4 : 6,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      {label.toUpperCase()}
    </span>
  );
}
