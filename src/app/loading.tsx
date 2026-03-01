export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-romantic-gradient">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}
