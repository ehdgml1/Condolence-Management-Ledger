export type EventType = 'wedding' | 'condolence';
export type Side = string;
export type GroupName = '가족' | '친척' | '친구' | '직장' | '기타';
export type ProfileRole = 'bride' | 'groom' | 'planner';
export type PaymentMethod = 'cash' | 'transfer';

export interface Wedding {
  id: string;
  created_at: string;
  updated_at: string;
  bride_name: string | null;
  groom_name: string;
  wedding_date: string | null;
  venue: string | null;
  share_code: string;
  owner_id: string;
  event_type: EventType;
}

export interface EventMember {
  id: string;
  created_at: string;
  wedding_id: string;
  name: string;
  display_name: string;
  sort_order: number;
}

export interface Profile {
  id: string;
  created_at: string;
  user_id: string;
  wedding_id: string;
  name: string;
  role: ProfileRole;
}

export interface Guest {
  id: string;
  created_at: string;
  updated_at: string;
  wedding_id: string;
  name: string;
  side: string;
  group_name: GroupName;
  relationship: string | null;
  phone: string | null;
  gift_amount: number;
  meal_tickets: number;
  attended: boolean;
  thanked: boolean;
  memo: string | null;
  payment_method: PaymentMethod;
  envelope_number: number | null;
  gift_received: boolean;
  gift_returned: boolean;
}

export interface ThankTemplate {
  id: string;
  created_at: string;
  wedding_id: string;
  title: string;
  body: string;
  is_default: boolean;
}

// Form types
export interface GuestFormData {
  name: string;
  side: string;
  group_name: GroupName;
  relationship: string;
  phone: string;
  gift_amount: number;
  meal_tickets: number;
  attended: boolean;
  memo: string;
  payment_method: PaymentMethod;
  envelope_number: number | null;
  gift_received: boolean;
  gift_returned: boolean;
}

export interface WeddingFormData {
  bride_name?: string;
  groom_name: string;
  wedding_date: string;
  venue: string;
}

// Stats types
export interface WeddingStats {
  totalGifts: number;
  totalGuests: number;
  attendedGuests: number;
  averageGift: number;
  bySide: Record<string, { count: number; total: number; average: number }>;
  byGroup: Record<GroupName, { count: number; total: number; average: number }>;
}

export interface QuickEntryData {
  name: string;
  side: string;
  group_name: GroupName;
  gift_amount: number;
  attended: boolean;
  payment_method: PaymentMethod;
}

export interface WeddingCost {
  id: string;
  created_at: string;
  wedding_id: string;
  category: string;
  description: string;
  amount: number;
  paid_by: string;
}

export interface SettlementStats {
  totalCosts: number;
  totalGifts: number;
  balance: number;
  costsByMember: Record<string, number>;
  sharedCosts: number;
  mealCostPerPerson: number;
  totalMealCost: number;
}

