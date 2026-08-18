import React from 'react';
import {
  Wallet,
  Home,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Layers,
  Film,
  Activity,
  Package,
  ArrowLeftRight,
  MoreHorizontal,
  ShieldCheck,
  Plane,
  Laptop,
  CreditCard,
  Building2,
  TrendingUp,
  Tag,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils/cn';

const ICON_MAP: Record<string, LucideIcon> = {
  Wallet,
  Home,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Layers,
  Film,
  Activity,
  Package,
  ArrowLeftRight,
  MoreHorizontal,
  ShieldCheck,
  Plane,
  Laptop,
  CreditCard,
  Building2,
  TrendingUp,
  Tag,
};

interface CategoryIconProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  color = '#10B981',
  size = 'md',
  className,
}) => {
  const IconComponent = ICON_MAP[name] || Tag;

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5 rounded-lg text-xs',
    md: 'w-9 h-9 p-2 rounded-xl text-sm',
    lg: 'w-12 h-12 p-2.5 rounded-2xl text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 border transition-transform duration-200',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}35`,
        color: color,
      }}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  );
};
