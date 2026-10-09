"use client";

import { useFormStatus } from "react-dom";

/** Toggle switch that submits its form; flips immediately and spins until the server responds. */
export default function SwitchButton({ on, label }: { on: boolean; label: string }) {
  const { pending } = useFormStatus();
  const shown = pending ? !on : on;
  return (
    <button
      className={`adm-switch${shown ? " on" : ""}${pending ? " loading" : ""}`}
      aria-label={label}
      aria-pressed={shown}
      aria-busy={pending}
      disabled={pending}
    />
  );
}
