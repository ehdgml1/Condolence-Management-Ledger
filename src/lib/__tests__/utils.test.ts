import { describe, it, expect } from 'vitest';
import {
  formatKRW,
  formatPhone,
  formatNumber,
  calculateStats,
  cn,
  generateShareCode,
} from '../utils';
import type { Guest } from '../types';

// ─── helpers ───────────────────────────────────────────────────────────────

function makeGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: 'g1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    wedding_id: 'w1',
    name: '홍길동',
    side: '신랑',
    group_name: '친구',
    relationship: null,
    phone: null,
    gift_amount: 50000,
    meal_tickets: 1,
    attended: true,
    thanked: false,
    memo: null,
    payment_method: 'cash',
    envelope_number: null,
    gift_received: false,
    gift_returned: false,
    ...overrides,
  };
}

// ─── formatKRW ────────────────────────────────────────────────────────────

describe('formatKRW', () => {
  it('formats 0 as "0원"', () => {
    expect(formatKRW(0)).toBe('0원');
  });

  it('formats amounts below 10000 as plain "원"', () => {
    expect(formatKRW(5000)).toBe('5,000원');
  });

  it('formats exactly 10000 as "1만원"', () => {
    expect(formatKRW(10000)).toBe('1만원');
  });

  it('formats exact multiples of 만 with no remainder', () => {
    expect(formatKRW(50000)).toBe('5만원');
    expect(formatKRW(100000)).toBe('10만원');
    expect(formatKRW(300000)).toBe('30만원');
  });

  it('formats amounts with a 만 portion and a remainder', () => {
    // 153000 = 15만 + 3000
    expect(formatKRW(153000)).toBe('15만 3,000원');
  });

  it('formats 70000 as "7만원"', () => {
    expect(formatKRW(70000)).toBe('7만원');
  });

  it('formats 200000 as "20만원"', () => {
    expect(formatKRW(200000)).toBe('20만원');
  });

  it('formats mixed amounts correctly', () => {
    // 123456 = 12만 + 3456
    expect(formatKRW(123456)).toBe('12만 3,456원');
  });
});

// ─── formatPhone ──────────────────────────────────────────────────────────

describe('formatPhone', () => {
  it('formats an 11-digit raw number as XXX-XXXX-XXXX', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678');
  });

  it('formats a 10-digit raw number as XXX-XXX-XXXX', () => {
    expect(formatPhone('0212345678')).toBe('021-234-5678');
  });

  it('strips hyphens before formatting 11-digit number', () => {
    expect(formatPhone('010-1234-5678')).toBe('010-1234-5678');
  });

  it('returns the original string unchanged when length is neither 10 nor 11', () => {
    expect(formatPhone('12345')).toBe('12345');
  });

  it('returns empty string unchanged', () => {
    expect(formatPhone('')).toBe('');
  });
});

// ─── formatNumber ─────────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats 0 as "0"', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formats numbers under 1000 without separator', () => {
    expect(formatNumber(999)).toBe('999');
  });

  it('formats 1000 with Korean locale thousands separator', () => {
    // ko-KR uses comma as thousands separator
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('formats large numbers correctly', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

// ─── calculateStats ───────────────────────────────────────────────────────

describe('calculateStats', () => {
  it('returns zero stats for an empty guest list', () => {
    const stats = calculateStats([], ['신랑', '신부']);
    expect(stats.totalGifts).toBe(0);
    expect(stats.totalGuests).toBe(0);
    expect(stats.attendedGuests).toBe(0);
    expect(stats.averageGift).toBe(0);
    expect(stats.bySide['신랑'].total).toBe(0);
    expect(stats.bySide['신부'].total).toBe(0);
    expect(stats.bySide['신랑'].count).toBe(0);
    expect(stats.bySide['신부'].count).toBe(0);
  });

  it('does not divide by zero for averageGift with empty list', () => {
    const stats = calculateStats([]);
    expect(stats.averageGift).toBe(0);
  });

  it('returns zero average for a group with no members', () => {
    const stats = calculateStats([makeGuest({ group_name: '가족' })]);
    expect(stats.byGroup['친구'].average).toBe(0);
    expect(stats.byGroup['친구'].count).toBe(0);
  });

  it('sums totalGifts across all guests', () => {
    const guests = [
      makeGuest({ gift_amount: 50000 }),
      makeGuest({ gift_amount: 100000 }),
      makeGuest({ gift_amount: 30000 }),
    ];
    expect(calculateStats(guests).totalGifts).toBe(180000);
  });

  it('counts totalGuests correctly', () => {
    const guests = [makeGuest(), makeGuest(), makeGuest()];
    expect(calculateStats(guests).totalGuests).toBe(3);
  });

  it('counts attendedGuests correctly', () => {
    const guests = [
      makeGuest({ attended: true }),
      makeGuest({ attended: false }),
      makeGuest({ attended: true }),
    ];
    expect(calculateStats(guests).attendedGuests).toBe(2);
  });

  it('rounds averageGift to nearest integer', () => {
    // 50000 + 30000 = 80000, 80000 / 3 ≈ 26666.67 → 26667
    const guests = [
      makeGuest({ gift_amount: 50000 }),
      makeGuest({ gift_amount: 30000 }),
      makeGuest({ gift_amount: 0 }),
    ];
    const stats = calculateStats(guests);
    expect(stats.averageGift).toBe(Math.round(80000 / 3));
  });

  it('splits totals by groom vs bride side', () => {
    const guests = [
      makeGuest({ side: '신랑', gift_amount: 100000 }),
      makeGuest({ side: '신부', gift_amount: 70000 }),
      makeGuest({ side: '신랑', gift_amount: 50000 }),
    ];
    const stats = calculateStats(guests, ['신랑', '신부']);
    expect(stats.bySide['신랑'].total).toBe(150000);
    expect(stats.bySide['신부'].total).toBe(70000);
    expect(stats.bySide['신랑'].count).toBe(2);
    expect(stats.bySide['신부'].count).toBe(1);
  });

  it('populates byGroup stats correctly', () => {
    const guests = [
      makeGuest({ group_name: '가족', gift_amount: 200000 }),
      makeGuest({ group_name: '가족', gift_amount: 100000 }),
      makeGuest({ group_name: '친구', gift_amount: 50000 }),
    ];
    const stats = calculateStats(guests);

    expect(stats.byGroup['가족'].count).toBe(2);
    expect(stats.byGroup['가족'].total).toBe(300000);
    expect(stats.byGroup['가족'].average).toBe(150000);

    expect(stats.byGroup['친구'].count).toBe(1);
    expect(stats.byGroup['친구'].total).toBe(50000);
    expect(stats.byGroup['친구'].average).toBe(50000);
  });

  it('includes all 5 group keys in byGroup', () => {
    const stats = calculateStats([]);
    expect(Object.keys(stats.byGroup)).toEqual(
      expect.arrayContaining(['가족', '친척', '친구', '직장', '기타'])
    );
  });
});

// ─── cn ───────────────────────────────────────────────────────────────────

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    // tailwind-merge should keep only the last padding class
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null, 'baz')).toBe('foo baz');
  });

  it('handles conditional objects from clsx', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo');
  });

  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('');
  });
});

// ─── generateShareCode ────────────────────────────────────────────────────

describe('generateShareCode', () => {
  it('generates a string of length 8', () => {
    expect(generateShareCode()).toHaveLength(8);
  });

  it('generates only lowercase hex characters', () => {
    const code = generateShareCode();
    expect(code).toMatch(/^[0-9a-f]{8}$/);
  });

  it('generates unique codes across multiple calls', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateShareCode()));
    // With 8 hex chars (16^8 possibilities), 20 calls should all be unique
    expect(codes.size).toBe(20);
  });
});
