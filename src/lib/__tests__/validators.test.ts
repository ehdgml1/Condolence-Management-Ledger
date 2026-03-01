import { describe, it, expect } from 'vitest';
import {
  validateGuestForm,
  validateWeddingForm,
  validateQuickEntry,
} from '../validators';
import type { GuestFormData, WeddingFormData, QuickEntryData } from '../types';

// ─── helpers ───────────────────────────────────────────────────────────────

function makeGuest(overrides: Partial<GuestFormData> = {}): GuestFormData {
  return {
    name: '홍길동',
    side: '신랑',
    group_name: '친구',
    relationship: '친구',
    phone: '',
    gift_amount: 50000,
    meal_tickets: 1,
    attended: true,
    memo: '',
    payment_method: 'cash',
    envelope_number: null,
    gift_received: false,
    gift_returned: false,
    ...overrides,
  };
}

function makeWedding(overrides: Partial<WeddingFormData> = {}): WeddingFormData {
  return {
    bride_name: '김신부',
    groom_name: '이신랑',
    wedding_date: '2026-06-01',
    venue: '서울웨딩홀',
    ...overrides,
  };
}

function makeQuick(overrides: Partial<QuickEntryData> = {}): QuickEntryData {
  return {
    name: '홍길동',
    side: '신랑',
    group_name: '친구',
    gift_amount: 50000,
    attended: true,
    payment_method: 'cash',
    ...overrides,
  };
}

// ─── validateGuestForm ─────────────────────────────────────────────────────

describe('validateGuestForm', () => {
  it('returns empty errors for valid data', () => {
    expect(validateGuestForm(makeGuest())).toEqual({});
  });

  it('errors when name is empty string', () => {
    const result = validateGuestForm(makeGuest({ name: '' }));
    expect(result.name).toBe('이름을 입력해주세요');
  });

  it('errors when name is only whitespace', () => {
    const result = validateGuestForm(makeGuest({ name: '   ' }));
    expect(result.name).toBe('이름을 입력해주세요');
  });

  it('errors when gift_amount is negative', () => {
    const result = validateGuestForm(makeGuest({ gift_amount: -1 }));
    expect(result.gift_amount).toBe('금액은 0원 이상이어야 합니다');
  });

  it('accepts gift_amount of 0', () => {
    const result = validateGuestForm(makeGuest({ gift_amount: 0 }));
    expect(result.gift_amount).toBeUndefined();
  });

  it('errors when meal_tickets is negative', () => {
    const result = validateGuestForm(makeGuest({ meal_tickets: -1 }));
    expect(result.meal_tickets).toBe('식권 수는 0장 이상이어야 합니다');
  });

  it('accepts meal_tickets of 0', () => {
    const result = validateGuestForm(makeGuest({ meal_tickets: 0 }));
    expect(result.meal_tickets).toBeUndefined();
  });

  it('errors for phone shorter than 10 digits', () => {
    const result = validateGuestForm(makeGuest({ phone: '01012345' }));
    expect(result.phone).toBe('올바른 전화번호를 입력해주세요');
  });

  it('errors for phone with letters', () => {
    const result = validateGuestForm(makeGuest({ phone: '010-1234-567a' }));
    expect(result.phone).toBe('올바른 전화번호를 입력해주세요');
  });

  it('accepts a valid 11-digit phone with hyphens (13 chars)', () => {
    // 010-1234-5678 → 13 chars, matches /^[0-9-]{10,13}$/
    const result = validateGuestForm(makeGuest({ phone: '010-1234-5678' }));
    expect(result.phone).toBeUndefined();
  });

  it('accepts a valid 11-digit raw phone', () => {
    const result = validateGuestForm(makeGuest({ phone: '01012345678' }));
    expect(result.phone).toBeUndefined();
  });

  it('skips phone validation when phone is empty', () => {
    const result = validateGuestForm(makeGuest({ phone: '' }));
    expect(result.phone).toBeUndefined();
  });

  it('returns multiple errors simultaneously', () => {
    const result = validateGuestForm(
      makeGuest({ name: '', gift_amount: -100, meal_tickets: -2 })
    );
    expect(Object.keys(result)).toHaveLength(3);
    expect(result.name).toBeDefined();
    expect(result.gift_amount).toBeDefined();
    expect(result.meal_tickets).toBeDefined();
  });
});

// ─── validateWeddingForm ───────────────────────────────────────────────────

describe('validateWeddingForm', () => {
  it('returns empty errors for valid data', () => {
    expect(validateWeddingForm(makeWedding())).toEqual({});
  });

  it('errors when bride_name is empty', () => {
    const result = validateWeddingForm(makeWedding({ bride_name: '' }));
    expect(result.bride_name).toBe('신부 이름을 입력해주세요');
  });

  it('errors when bride_name is only whitespace', () => {
    const result = validateWeddingForm(makeWedding({ bride_name: '  ' }));
    expect(result.bride_name).toBe('신부 이름을 입력해주세요');
  });

  it('errors when groom_name is empty', () => {
    const result = validateWeddingForm(makeWedding({ groom_name: '' }));
    expect(result.groom_name).toBe('신랑 이름을 입력해주세요');
  });

  it('errors when groom_name is only whitespace', () => {
    const result = validateWeddingForm(makeWedding({ groom_name: '  ' }));
    expect(result.groom_name).toBe('신랑 이름을 입력해주세요');
  });

  it('returns both name errors simultaneously', () => {
    const result = validateWeddingForm(makeWedding({ bride_name: '', groom_name: '' }));
    expect(result.bride_name).toBeDefined();
    expect(result.groom_name).toBeDefined();
  });

  it('does not validate optional fields like wedding_date or venue', () => {
    const result = validateWeddingForm(makeWedding({ wedding_date: '', venue: '' }));
    expect(result.wedding_date).toBeUndefined();
    expect(result.venue).toBeUndefined();
  });
});

// ─── validateQuickEntry ────────────────────────────────────────────────────

describe('validateQuickEntry', () => {
  it('returns empty errors for valid data', () => {
    expect(validateQuickEntry(makeQuick())).toEqual({});
  });

  it('errors when name is empty', () => {
    const result = validateQuickEntry(makeQuick({ name: '' }));
    expect(result.name).toBe('이름을 입력해주세요');
  });

  it('errors when name is only whitespace', () => {
    const result = validateQuickEntry(makeQuick({ name: '   ' }));
    expect(result.name).toBe('이름을 입력해주세요');
  });

  it('errors when gift_amount is negative', () => {
    const result = validateQuickEntry(makeQuick({ gift_amount: -500 }));
    expect(result.gift_amount).toBe('금액은 0원 이상이어야 합니다');
  });

  it('accepts gift_amount of 0', () => {
    const result = validateQuickEntry(makeQuick({ gift_amount: 0 }));
    expect(result.gift_amount).toBeUndefined();
  });

  it('returns both errors simultaneously', () => {
    const result = validateQuickEntry(makeQuick({ name: '', gift_amount: -1 }));
    expect(result.name).toBeDefined();
    expect(result.gift_amount).toBeDefined();
  });
});
