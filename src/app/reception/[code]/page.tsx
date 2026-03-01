import { getWeddingByCode, getEventMembersByWeddingId } from '@/actions/reception';
import { ReceptionContent } from './reception-content';

export default async function ReceptionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const wedding = await getWeddingByCode(code);

  if (!wedding) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <p className="text-2xl mb-2">🔍</p>
          <h1 className="font-heading text-lg font-semibold mb-2">링크를 찾을 수 없어요</h1>
          <p className="text-sm text-muted-foreground">
            유효하지 않은 접수 링크입니다.<br />주소를 다시 확인해 주세요.
          </p>
        </div>
      </div>
    );
  }

  const members = await getEventMembersByWeddingId(wedding.id);

  return <ReceptionContent wedding={wedding} code={code} members={members.length > 0 ? members : undefined} />;
}
