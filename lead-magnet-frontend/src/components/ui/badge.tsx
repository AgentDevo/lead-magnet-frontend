import React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'secondary' | 'destructive' | 'success' | 'outline';

const variants: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  success: 'bg-green-100 text-green-800',
  outline: 'border border-border text-foreground',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  );
}
