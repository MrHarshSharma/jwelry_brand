"use client";

import { useFormStatus } from "react-dom";

/** Submit button for server-action forms: disables itself and shows a spinner while the action runs. */
export default function SubmitButton({
  children,
  pendingText,
  className = "adm-btn",
  onClick,
}: {
  children: React.ReactNode;
  /** Label while pending; defaults to the normal label. */
  pendingText?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} aria-busy={pending} onClick={onClick}>
      {pending ? (
        <>
          <i className="fas fa-spinner fa-spin" /> {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
