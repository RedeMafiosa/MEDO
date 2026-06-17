import type { ReactNode } from 'react';
import { Crown, Shield, Star, Zap, Radio, Flame, Swords, Award } from 'lucide-react';

export type TagVariant =
  | 'fundador'    // RGB rainbow — máximo prestígio
  | 'dono'        // Red neon — dono/owner
  | 'admin'       // Gold shimmer
  | 'moderador'   // Cyan neon pulse
  | 'vip'         // Purple glow
  | 'booster'     // Pink glow
  | 'og'          // Orange fire
  | 'streamer'    // Green neon
  | 'rank'        // Rank color (custom)
  | 'default';    // Plain muted

export interface MemberTagProps {
  variant: TagVariant;
  label: string;
  icon?: ReactNode;
  /** Custom color for 'rank' variant */
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
}

// Base wrapper styles shared by all tags
const BASE =
  'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider select-none transition-all px-2.5 py-1';

const SIZE = {
  sm: 'text-[10px]',
  md: 'text-xs',
};

// Per-variant configs
const CONFIGS: Record<
  TagVariant,
  { wrapperClass: string; textClass?: string; icon?: ReactNode; bg?: string }
> = {
  fundador: {
    wrapperClass: 'tag-rgb-border bg-black/60 backdrop-blur-sm',
    textClass: 'tag-rgb-text',
    icon: <Crown className="h-3 w-3 flex-shrink-0" />,
  },
  dono: {
    wrapperClass: 'tag-dono bg-black/60 backdrop-blur-sm',
    icon: <Flame className="h-3 w-3 flex-shrink-0" />,
  },
  admin: {
    wrapperClass: 'tag-gold-border bg-black/60 backdrop-blur-sm',
    textClass: 'tag-gold',
    icon: <Shield className="h-3 w-3 flex-shrink-0" />,
  },
  moderador: {
    wrapperClass: 'tag-cyan bg-black/60 backdrop-blur-sm',
    icon: <Swords className="h-3 w-3 flex-shrink-0" />,
  },
  vip: {
    wrapperClass: 'tag-vip bg-black/60 backdrop-blur-sm',
    icon: <Star className="h-3 w-3 flex-shrink-0" />,
  },
  booster: {
    wrapperClass: 'tag-booster bg-black/60 backdrop-blur-sm',
    icon: <Zap className="h-3 w-3 flex-shrink-0" />,
  },
  og: {
    wrapperClass: 'tag-og bg-black/60 backdrop-blur-sm',
    icon: <Award className="h-3 w-3 flex-shrink-0" />,
  },
  streamer: {
    wrapperClass: 'tag-streamer bg-black/60 backdrop-blur-sm',
    icon: <Radio className="h-3 w-3 flex-shrink-0" />,
  },
  rank: {
    wrapperClass: 'bg-black/40',
  },
  default: {
    wrapperClass: 'border border-border text-muted-foreground',
  },
};

export function MemberTag({
  variant,
  label,
  icon,
  color,
  size = 'md',
  className = '',
}: MemberTagProps) {
  const cfg = CONFIGS[variant];
  const defaultIcon = cfg.icon;
  const usedIcon = icon ?? defaultIcon;

  // Rank variant uses dynamic inline styles
  const inlineStyle =
    variant === 'rank' && color
      ? { color, borderColor: color + '80', boxShadow: `0 0 6px ${color}44` }
      : undefined;

  return (
    <span
      className={`${BASE} ${SIZE[size]} ${cfg.wrapperClass} ${className}`}
      style={inlineStyle}
    >
      {/* Icon wrapper — for gold/rgb variants the icon inherits animated color */}
      {usedIcon && (
        <span className={cfg.textClass}>{usedIcon}</span>
      )}
      <span className={cfg.textClass}>{label}</span>
    </span>
  );
}

// ─── Convenience presets ────────────────────────────────────────────────────────
export function AdminRoleTags({ role, rankName, rankColor, rankIcon }: {
  role: 'admin' | 'user';
  rankName?: string;
  rankColor?: string;
  rankIcon?: string;
}) {
  return (
    <span className="inline-flex flex-wrap gap-1.5 items-center">
      {role === 'admin' && (
        <MemberTag variant="admin" label="Admin" />
      )}
      {rankName && (
        <MemberTag variant="rank" label={`${rankIcon ?? ''} ${rankName}`.trim()} color={rankColor} />
      )}
    </span>
  );
}
