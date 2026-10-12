"use client";

import { useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import type { Category } from "@/lib/types";
import AutoSaveStatus from "./AutoSaveStatus";
import ConfirmButton from "./ConfirmButton";
import ImageUploadField from "./ImageUploadField";

/**
 * One editable category. Text fields save when you leave them (or press Enter); the image saves
 * as soon as it's uploaded or removed. Saving goes through onSubmit rather than a form action so
 * React doesn't reset the row while you're typing in another field.
 */
export default function CategoryRow({ category: c, productCount }: { category: Category; productCount: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function save(form: HTMLFormElement) {
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setError(undefined);
    startTransition(async () => {
      try {
        await saveCategory(data);
        // Later edits compare against what's now saved.
        form.querySelectorAll<HTMLInputElement>("input:not([type=hidden])").forEach((i) => (i.defaultValue = i.value));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  return (
    <tr>
      <td colSpan={4}>
        <form
          className="adm-inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            save(e.currentTarget);
          }}
          onBlur={(e) => {
            const field = e.target;
            // Only save text fields that actually changed.
            if (field instanceof HTMLInputElement && field.type !== "file" && field.value !== field.defaultValue) {
              save(e.currentTarget);
            }
          }}
        >
          <input type="hidden" name="id" value={c.id} />
          <input name="sort_order" type="number" defaultValue={c.sort_order} className="adm-input-xs" aria-label="Order" />
          <input name="name" defaultValue={c.name} required aria-label="Name" />
          <input name="slug" defaultValue={c.slug} aria-label="Slug" />
          <ImageUploadField name="image_url" defaultUrl={c.image_url} folder="categories" autoSubmit />
          <AutoSaveStatus pending={pending} error={error} />
        </form>
      </td>
      <td>{productCount}</td>
      <td className="adm-actions">
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={c.id} />
          <ConfirmButton message={`Delete ${c.name}? Its products will become uncategorised.`}>Delete</ConfirmButton>
        </form>
      </td>
    </tr>
  );
}
