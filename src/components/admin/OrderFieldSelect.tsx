"use client";

import { useState, useTransition } from "react";
import { updateOrderField, type OrderField } from "@/app/admin/actions";

/** Badge-styled dropdown that saves one order field as soon as it changes. */
export default function OrderFieldSelect({
  orderId,
  field,
  value,
  options,
}: {
  orderId: string;
  field: OrderField;
  value: string;
  options: Record<string, string>;
}) {
  const [current, setCurrent] = useState(value);
  const [synced, setSynced] = useState(value);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  // Follow the server value when it changes elsewhere (e.g. on the order page).
  if (synced !== value) {
    setSynced(value);
    setCurrent(value);
  }

  function change(next: string) {
    const previous = current;
    setCurrent(next);
    setError(undefined);
    startTransition(async () => {
      const res = await updateOrderField(orderId, field, next);
      if (res?.error) {
        setCurrent(previous);
        setError(res.error);
      }
    });
  }

  return (
    <span className="adm-inline-select" title={error}>
      <select
        className={`adm-badge adm-badge-${current} adm-badge-select`}
        value={current}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        aria-label={field.replace("_", " ")}
      >
        {Object.entries(options).map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
      {pending && <i className="fas fa-spinner fa-spin adm-inline-spin" />}
      {error && <i className="fas fa-exclamation-circle adm-danger" />}
    </span>
  );
}
