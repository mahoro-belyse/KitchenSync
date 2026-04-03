// ─── EmptyState.tsx ───────────────────────────────────────────────────────────
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <Icon className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p className="text-sm mt-1 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="text-white mt-2"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
