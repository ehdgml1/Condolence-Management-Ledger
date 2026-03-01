import { formatKRW } from '@/lib/utils';

interface KoreanWonProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function KoreanWon({ amount, className = '', size = 'md' }: KoreanWonProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-bold',
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {formatKRW(amount)}
    </span>
  );
}
