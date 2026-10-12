"use client";

import { useEffect, useRef, useState } from "react";
import { discardUpload } from "@/app/admin/actions";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

/**
 * Single-image picker: uploads to Supabase Storage and puts the image's public URL in a hidden
 * input called `name`. With `autoSubmit`, the surrounding form is submitted after every upload or
 * removal (the server then deletes the image it replaced); without it, the form's own button saves.
 */
export default function ImageUploadField({
  name,
  defaultUrl,
  folder,
  label = "Image",
  autoSubmit = false,
}: {
  name: string;
  defaultUrl?: string | null;
  /** Folder inside the bucket, e.g. "categories". */
  folder: string;
  label?: string;
  autoSubmit?: boolean;
}) {
  const initial = defaultUrl ?? "";
  const [url, setUrl] = useState(initial);
  const [synced, setSynced] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const hidden = useRef<HTMLInputElement>(null);
  const submitAfterChange = useRef(false);

  // Follow the saved value after the server re-renders the row.
  if (synced !== initial) {
    setSynced(initial);
    setUrl(initial);
  }

  // React resets a form after a successful action; clear the picker with it (e.g. "Add category").
  useEffect(() => {
    const form = hidden.current?.form;
    if (!form) return;
    const onReset = () => setUrl(initial);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [initial]);

  // Submit once the hidden input holds the new URL.
  useEffect(() => {
    if (!submitAfterChange.current) return;
    submitAfterChange.current = false;
    hidden.current?.form?.requestSubmit();
  }, [url]);

  /** Set a new value; in auto-save mode, save it straight away. */
  const change = (next: string) => {
    submitAfterChange.current = autoSubmit;
    setUrl(next);
  };

  /**
   * Uploads made here but never saved would be orphaned; delete them when replaced or removed.
   * (In auto-save mode every upload is saved at once, and the server cleans up what it replaces.)
   */
  const discardIfUnsaved = (old: string) => {
    if (!autoSubmit && old && old !== initial) void discardUpload(old);
  };

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setUploading(true);
    setError(undefined);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) {
      setError(`Upload failed: ${error.message}`);
      return;
    }
    discardIfUnsaved(url);
    change(supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl);
  }

  return (
    <div className="adm-image-field">
      <input ref={hidden} type="hidden" name={name} value={url} />
      <span className="adm-image-field-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? <img src={url} alt="" /> : <i className="far fa-image" />}
        {url && !uploading && (
          <button
            type="button"
            className="adm-image-field-remove"
            aria-label={`Remove ${label.toLowerCase()}`}
            onClick={() => {
              discardIfUnsaved(url);
              change("");
            }}
          >
            <i className="fas fa-times" />
          </button>
        )}
      </span>
      <label className={`adm-btn${uploading ? " busy" : ""}`} aria-busy={uploading}>
        {uploading ? (
          <>
            <i className="fas fa-spinner fa-spin" /> Uploading…
          </>
        ) : (
          <>
            <i className="fas fa-upload" /> {url ? "Change" : "Upload"}
          </>
        )}
        <input
          type="file"
          accept="image/*"
          hidden
          disabled={uploading}
          aria-label={`Upload ${label.toLowerCase()}`}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {error && <span className="adm-danger adm-image-field-error">{error}</span>}
    </div>
  );
}
