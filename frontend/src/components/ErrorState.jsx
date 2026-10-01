export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-gov-danger">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded bg-gov-navy px-3 py-1.5 text-sm text-white"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
