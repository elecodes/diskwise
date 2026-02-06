import { Shield, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import type { SafetyStatus } from '@/types';

interface SafetyBadgeProps {
  status: SafetyStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const config = {
  safe: {
    icon: Shield,
    label: 'Safe to Delete',
    className: 'bg-green-500/20 text-green-500 border-green-500/30',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Review',
    className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  },
  danger: {
    icon: XCircle,
    label: 'Keep',
    className: 'bg-red-500/20 text-red-500 border-red-500/30',
  },
  unknown: {
    icon: HelpCircle,
    label: 'Unknown',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

const iconSizes = {
  sm: 12,
  md: 16,
  lg: 20,
};

export function SafetyBadge({ status, showLabel = true, size = 'md' }: SafetyBadgeProps) {
  const { icon: Icon, label, className } = config[status];
  
  return (
    <span className={`inline-flex items-center rounded-full border ${className} ${sizeClasses[size]}`}>
      <Icon size={iconSizes[size]} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
