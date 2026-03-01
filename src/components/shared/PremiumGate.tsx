'use client';

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
}

export function PremiumGate({ children }: PremiumGateProps) {
  return <>{children}</>;
}

interface GuestLimitGateProps {
  currentCount: number;
  children: React.ReactNode;
}

export function GuestLimitGate({ children }: GuestLimitGateProps) {
  return <>{children}</>;
}
