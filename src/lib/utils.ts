import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Guest, type GroupName, type WeddingStats } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function numberWithCommas(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatKRW(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) return `${man}만원`;
    return `${man}만 ${numberWithCommas(remainder)}원`;
  }
  return `${numberWithCommas(amount)}원`;
}

export function formatNumber(num: number): string {
  return numberWithCommas(num);
}

/**
 * Deterministic Korean date formatter — safe for SSR hydration.
 * Avoids toLocaleDateString() which can differ between Node.js and browser.
 */
export function formatKoreanDate(
  dateStr: string,
  options?: { year?: boolean; month?: 'long' | 'short' | '2-digit'; day?: boolean }
): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();

  const opts = { year: true, month: 'long' as const, day: true, ...options };

  const parts: string[] = [];
  if (opts.year) parts.push(`${y}년`);

  if (opts.month === '2-digit') {
    parts.push(`${m.toString().padStart(2, '0')}.`);
  } else if (opts.month === 'short') {
    parts.push(`${m}월`);
  } else {
    parts.push(`${m}월`);
  }

  if (opts.day) {
    if (opts.month === '2-digit') {
      parts.push(`${day.toString().padStart(2, '0')}`);
    } else {
      parts.push(`${day}일`);
    }
  }

  return parts.join(' ');
}

/**
 * Deterministic short date: "1월 3일" style.
 */
export function formatKoreanDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/**
 * Deterministic compact date: "2026.03.02" style.
 */
export function formatKoreanDateCompact(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function calculateStats(guests: Guest[], memberNames: string[] = []): WeddingStats {
  const totalGifts = guests.reduce((sum, g) => sum + g.gift_amount, 0);
  const attendedGuests = guests.filter(g => g.attended).length;

  const byGroup = (['가족', '친척', '친구', '직장', '기타'] as GroupName[]).reduce(
    (acc, group) => {
      const groupGuests = guests.filter(g => g.group_name === group);
      const total = groupGuests.reduce((sum, g) => sum + g.gift_amount, 0);
      acc[group] = {
        count: groupGuests.length,
        total,
        average: groupGuests.length > 0 ? Math.round(total / groupGuests.length) : 0,
      };
      return acc;
    },
    {} as WeddingStats['byGroup']
  );

  const bySide = memberNames.reduce(
    (acc, sideName) => {
      const sideGuests = guests.filter(g => g.side === sideName);
      const total = sideGuests.reduce((sum, g) => sum + g.gift_amount, 0);
      acc[sideName] = {
        count: sideGuests.length,
        total,
        average: sideGuests.length > 0 ? Math.round(total / sideGuests.length) : 0,
      };
      return acc;
    },
    {} as WeddingStats['bySide']
  );

  return {
    totalGifts,
    totalGuests: guests.length,
    attendedGuests,
    averageGift: guests.length > 0 ? Math.round(totalGifts / guests.length) : 0,
    bySide,
    byGroup,
  };
}

export function generateShareCode(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('').slice(0, 8);
}
