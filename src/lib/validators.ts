import { type GuestFormData, type WeddingFormData, type QuickEntryData, type EventType } from './types';

export function validateGuestForm(data: GuestFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = '이름을 입력해주세요';
  }

  if (data.gift_amount < 0) {
    errors.gift_amount = '금액은 0원 이상이어야 합니다';
  }

  if (data.meal_tickets < 0) {
    errors.meal_tickets = '식권 수는 0장 이상이어야 합니다';
  }

  if (data.phone && !/^[0-9-]{10,13}$/.test(data.phone)) {
    errors.phone = '올바른 전화번호를 입력해주세요';
  }

  return errors;
}

export function validateWeddingForm(data: WeddingFormData, eventType: EventType = 'wedding'): Record<string, string> {
  const errors: Record<string, string> = {};

  if (eventType === 'wedding' && data.bride_name !== undefined && !data.bride_name.trim()) {
    errors.bride_name = '신부 이름을 입력해주세요';
  }

  if (!data.groom_name.trim()) {
    errors.groom_name = eventType === 'wedding' ? '신랑 이름을 입력해주세요' : '대표 이름을 입력해주세요';
  }

  return errors;
}

export function validateQuickEntry(data: QuickEntryData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = '이름을 입력해주세요';
  }

  if (data.gift_amount < 0) {
    errors.gift_amount = '금액은 0원 이상이어야 합니다';
  }

  return errors;
}
