export default function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-current dark:border-tide dark:border-t-current" />
    </div>
  );
}
