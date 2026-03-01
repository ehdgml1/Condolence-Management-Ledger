import { type GroupName, type PaymentMethod, type EventType } from './types';

export const GROUP_NAMES: GroupName[] = ['가족', '친척', '친구', '직장', '기타'];

export const COMMON_GIFT_AMOUNTS = [
  30000, 50000, 70000, 100000, 150000, 200000, 300000, 500000,
];


export const DEFAULT_THANK_TEMPLATE = `{{name}}님, 저희 결혼식에 와주시고 축하해 주셔서 진심으로 감사드립니다.

보내주신 따뜻한 마음과 축의금 {{amount}}원, 소중히 간직하겠습니다.

항상 건강하시고 행복하세요. 감사합니다. 💕`;

export const DEFAULT_CONDOLENCE_THANK_TEMPLATE = `{{name}}님, 바쁘신 중에도 찾아주시고 마음 써주셔서 진심으로 감사드립니다.

보내주신 따뜻한 마음과 부조금 {{amount}}원, 잊지 않겠습니다.

항상 건강하시고 좋은 일만 가득하시길 바랍니다. 감사합니다.`;

export function getDefaultTemplate(eventType: 'wedding' | 'condolence'): string {
  return eventType === 'condolence' ? DEFAULT_CONDOLENCE_THANK_TEMPLATE : DEFAULT_THANK_TEMPLATE;
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: '현금' },
  { value: 'transfer', label: '계좌이체' },
];

export const COST_CATEGORIES = [
  '예식장', '식대', '스튜디오', '드레스', '메이크업', '꽃장식', '영상', '답례품', '기타'
] as const;

export const CONDOLENCE_COST_CATEGORIES = [
  '장례식장', '식대', '접객', '답례품', '기타'
] as const;

export function getCostCategories(eventType: EventType): readonly string[] {
  return eventType === 'condolence' ? CONDOLENCE_COST_CATEGORIES : COST_CATEGORIES;
}

export const SIDE_COLORS: string[] = [
  'hsl(340, 65%, 70%)',  // first member
  'hsl(145, 40%, 60%)',  // second member
  'hsl(200, 55%, 60%)',  // third member
  'hsl(270, 40%, 65%)',  // fourth member
  'hsl(25, 65%, 65%)',   // fifth member
  'hsl(170, 45%, 55%)',  // sixth member
];

export const CONDOLENCE_SIDE_COLORS: string[] = [
  'hsl(220, 50%, 60%)',   // indigo-blue
  'hsl(200, 45%, 55%)',   // steel-blue
  'hsl(250, 35%, 62%)',   // soft purple
  'hsl(180, 35%, 55%)',   // teal
  'hsl(210, 40%, 58%)',   // slate blue
  'hsl(240, 30%, 60%)',   // muted violet
];

export function getSideColors(eventType: EventType): string[] {
  return eventType === 'condolence' ? CONDOLENCE_SIDE_COLORS : SIDE_COLORS;
}

export const GROUP_COLORS: Record<string, string> = {
  가족: 'hsl(340, 65%, 70%)',
  친척: 'hsl(145, 40%, 60%)',
  친구: 'hsl(45, 70%, 65%)',
  직장: 'hsl(270, 40%, 65%)',
  기타: 'hsl(25, 65%, 65%)',
};

export const EVENT_TYPE_LABELS = {
  wedding: { gift: '축의금', guest: '하객', event: '결혼식' },
  condolence: { gift: '부조금', guest: '조문객', event: '경조사' },
} as const;

