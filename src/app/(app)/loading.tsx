export default function AppLoading() {
  return (
    <div className="py-6 space-y-4">
      <div className="h-8 w-48 rounded-lg skeleton-shimmer" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl skeleton-shimmer" />
        ))}
      </div>
      <div className="h-48 rounded-xl skeleton-shimmer" />
      <div className="h-48 rounded-xl skeleton-shimmer" />
    </div>
  );
}
