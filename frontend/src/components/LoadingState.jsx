export default function LoadingState({ label = 'Loading data…' }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-gov-muted">
      {label}
    </div>
  );
}
