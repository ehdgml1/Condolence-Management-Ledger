'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { thankTemplates } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { requireWeddingAccess } from '@/lib/db/auth-helper';
import type { ThankTemplate } from '@/lib/types';

export async function getTemplates(weddingId: string): Promise<ThankTemplate[]> {
  try { await requireWeddingAccess(weddingId); } catch { return []; }

  return await db.select().from(thankTemplates)
    .where(eq(thankTemplates.wedding_id, weddingId))
    .orderBy(asc(thankTemplates.created_at))
    .all() as ThankTemplate[];
}

export async function createTemplate(weddingId: string, title: string, body: string) {
  try { await requireWeddingAccess(weddingId); } catch { return { error: '접근 권한이 없습니다' }; }

  if (!title?.trim()) return { error: '제목을 입력해주세요' };
  if (!body?.trim()) return { error: '내용을 입력해주세요' };

  const template = await db.insert(thankTemplates).values({
    wedding_id: weddingId,
    title: title.trim(),
    body: body.trim(),
    is_default: false,
  }).returning().get();

  revalidatePath('/thanks');
  return { data: template as ThankTemplate };
}

export async function updateTemplate(templateId: string, title: string, body: string) {
  try {
    const template = await db.select({ wedding_id: thankTemplates.wedding_id }).from(thankTemplates).where(eq(thankTemplates.id, templateId)).get();
    if (!template) return { error: '템플릿을 찾을 수 없습니다' };
    await requireWeddingAccess(template.wedding_id);
  } catch { return { error: '접근 권한이 없습니다' }; }

  if (!title?.trim()) return { error: '제목을 입력해주세요' };
  if (!body?.trim()) return { error: '내용을 입력해주세요' };

  await db.update(thankTemplates)
    .set({ title: title.trim(), body: body.trim() })
    .where(eq(thankTemplates.id, templateId))
    .run();

  revalidatePath('/thanks');
  return { success: true };
}

export async function deleteTemplate(templateId: string) {
  try {
    const template = await db.select({ wedding_id: thankTemplates.wedding_id }).from(thankTemplates).where(eq(thankTemplates.id, templateId)).get();
    if (!template) return { error: '템플릿을 찾을 수 없습니다' };
    await requireWeddingAccess(template.wedding_id);
  } catch { return { error: '접근 권한이 없습니다' }; }

  await db.delete(thankTemplates).where(eq(thankTemplates.id, templateId)).run();

  revalidatePath('/thanks');
  return { success: true };
}
