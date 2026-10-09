"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="adm-card adm-error-card">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button className="adm-btn" onClick={reset}>Try again</button>
    </div>
  );
}
