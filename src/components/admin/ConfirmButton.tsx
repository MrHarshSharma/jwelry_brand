"use client";

import SubmitButton from "./SubmitButton";

/** Submit button that asks for confirmation first, then shows a spinner while the action runs. */
export default function ConfirmButton({
  message,
  className = "adm-btn adm-btn-danger",
  pendingText = "Deleting…",
  children,
}: {
  message: string;
  className?: string;
  pendingText?: string;
  children: React.ReactNode;
}) {
  return (
    <SubmitButton
      className={className}
      pendingText={pendingText}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </SubmitButton>
  );
}
