import { describe, it, expect } from 'vitest';
import {
  GROUP_NAMES,
  COMMON_GIFT_AMOUNTS,
  PAYMENT_METHODS,
  COST_CATEGORIES,
  SIDE_COLORS,
  GROUP_COLORS,
  EVENT_TYPE_LABELS,
} from '../constants';

describe('GROUP_NAMES', () => {
  it('is an array', () => {
    expect(Array.isArray(GROUP_NAMES)).toBe(true);
  });

  it('has exactly 5 entries', () => {
    expect(GROUP_NAMES).toHaveLength(5);
  });

  it('contains all expected group names', () => {
    expect(GROUP_NAMES).toContain('가족');
    expect(GROUP_NAMES).toContain('친척');
    expect(GROUP_NAMES).toContain('친구');
    expect(GROUP_NAMES).toContain('직장');
    expect(GROUP_NAMES).toContain('기타');
  });
});

describe('COMMON_GIFT_AMOUNTS', () => {
  it('is an array', () => {
    expect(Array.isArray(COMMON_GIFT_AMOUNTS)).toBe(true);
  });

  it('has exactly 8 preset amounts', () => {
    expect(COMMON_GIFT_AMOUNTS).toHaveLength(8);
  });

  it('contains all expected preset amounts', () => {
    expect(COMMON_GIFT_AMOUNTS).toContain(30000);
    expect(COMMON_GIFT_AMOUNTS).toContain(50000);
    expect(COMMON_GIFT_AMOUNTS).toContain(100000);
    expect(COMMON_GIFT_AMOUNTS).toContain(500000);
  });

  it('is sorted in ascending order', () => {
    const sorted = [...COMMON_GIFT_AMOUNTS].sort((a, b) => a - b);
    expect(COMMON_GIFT_AMOUNTS).toEqual(sorted);
  });

  it('contains only positive numbers', () => {
    COMMON_GIFT_AMOUNTS.forEach(amount => {
      expect(amount).toBeGreaterThan(0);
    });
  });
});

describe('PAYMENT_METHODS', () => {
  it('is an array', () => {
    expect(Array.isArray(PAYMENT_METHODS)).toBe(true);
  });

  it('has exactly 2 payment methods', () => {
    expect(PAYMENT_METHODS).toHaveLength(2);
  });

  it('each entry has value and label fields', () => {
    PAYMENT_METHODS.forEach(method => {
      expect(method).toHaveProperty('value');
      expect(method).toHaveProperty('label');
    });
  });

  it('contains cash and transfer values', () => {
    const values = PAYMENT_METHODS.map(m => m.value);
    expect(values).toContain('cash');
    expect(values).toContain('transfer');
  });
});

describe('COST_CATEGORIES', () => {
  it('is a non-empty array', () => {
    expect(COST_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('contains 예식장 and 식대', () => {
    expect(COST_CATEGORIES).toContain('예식장');
    expect(COST_CATEGORIES).toContain('식대');
  });
});

describe('SIDE_COLORS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(SIDE_COLORS)).toBe(true);
    expect(SIDE_COLORS.length).toBeGreaterThan(0);
  });

  it('all values are non-empty strings', () => {
    SIDE_COLORS.forEach(color => {
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });
  });
});

describe('GROUP_COLORS', () => {
  it('has color entries for all group names', () => {
    expect(GROUP_COLORS).toHaveProperty('가족');
    expect(GROUP_COLORS).toHaveProperty('친척');
    expect(GROUP_COLORS).toHaveProperty('친구');
    expect(GROUP_COLORS).toHaveProperty('직장');
    expect(GROUP_COLORS).toHaveProperty('기타');
  });

  it('all color values are non-empty strings', () => {
    Object.values(GROUP_COLORS).forEach(color => {
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });
  });
});

describe('EVENT_TYPE_LABELS', () => {
  it('has wedding and condolence keys', () => {
    expect(EVENT_TYPE_LABELS).toHaveProperty('wedding');
    expect(EVENT_TYPE_LABELS).toHaveProperty('condolence');
  });

  it('wedding labels use 축의금 terminology', () => {
    expect(EVENT_TYPE_LABELS.wedding.gift).toBe('축의금');
    expect(EVENT_TYPE_LABELS.wedding.guest).toBe('하객');
  });

  it('condolence labels use 부조금 terminology', () => {
    expect(EVENT_TYPE_LABELS.condolence.gift).toBe('부조금');
    expect(EVENT_TYPE_LABELS.condolence.guest).toBe('조문객');
  });
});
