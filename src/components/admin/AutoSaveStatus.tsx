"use client";

import { useEffect, useState } from "react";

/** "Saving…" while `pending`, then "Saved ✓" for a moment, or the error if the save failed. */
export default function AutoSaveStatus({ pending, error }: { pending: boolean; error?: string }) {
  const [wasPending, setWasPending] = useState(pending);
  const [showSaved, setShowSaved] = useState(false);

  if (pending !== wasPending) {
    setWasPending(pending);
    if (!pending && !error) setShowSaved(true);
  }

  useEffect(() => {
    if (!showSaved) return;
    const t = setTimeout(() => setShowSaved(false), 1600);
    return () => clearTimeout(t);
  }, [showSaved]);

  return (
    <span className="adm-autosave" aria-live="polite">
      {pending ? (
        <>
          <i className="fas fa-spinner fa-spin" /> Saving…
        </>
      ) : error ? (
        <span className="adm-danger">
          <i className="fas fa-exclamation-circle" /> {error}
        </span>
      ) : showSaved ? (
        <span className="adm-ok">
          <i className="fas fa-check" /> Saved
        </span>
      ) : null}
    </span>
  );
}
