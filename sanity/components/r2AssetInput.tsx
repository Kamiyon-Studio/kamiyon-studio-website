import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useClient, type ObjectInputProps, PatchEvent, set, unset } from "sanity";

import { getMediaUploadUrl } from "../studio-url";

type R2AssetValue = {
  _type?: "r2Asset";
  key?: string;
  url?: string;
  alt?: string;
  caption?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};

type UploadEnvelope = {
  success: boolean;
  data: {
    key: string;
    url: string;
    mimeType: string;
    width?: number;
    height?: number;
  } | null;
  error: string | null;
};

const panelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "0.75rem",
  border: "1px solid var(--card-border-color, #ddd)",
  borderRadius: "0.375rem",
};

const rowStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "center",
  flexWrap: "wrap",
};

const mutedStyle: CSSProperties = {
  fontSize: "0.875rem",
  opacity: 0.75,
};

const errorStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--card-badge-critical-fg-color, #b00020)",
};

/**
 * Minimal R2 upload control for `r2Asset` fields.
 * Posts multipart `file` to `/api/media/upload` with Bearer auth, then patches key/url/meta.
 */
export function R2AssetInput(props: ObjectInputProps<R2AssetValue>) {
  const { value, onChange, readOnly, renderDefault } = props;
  const client = useClient({ apiVersion: "2026-07-21" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUpload = useCallback(
    async (file: File) => {
      const token = client.config().token;
      if (!token) {
        setError(
          "Sign in again to upload using your editor account.",
        );
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const body = new FormData();
        body.append("file", file);

        const response = await fetch(getMediaUploadUrl(), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        });

        const json = (await response.json()) as UploadEnvelope;
        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.error || `Upload failed (${response.status})`);
        }

        const { key, url, mimeType, width, height } = json.data;
        onChange(
          PatchEvent.from([
            set(key, ["key"]),
            set(url, ["url"]),
            set(mimeType, ["mimeType"]),
            width != null ? set(width, ["width"]) : unset(["width"]),
            height != null ? set(height, ["height"]) : unset(["height"]),
          ]),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [client, onChange],
  );

  let defaultFields: ReactNode = null;
  try {
    defaultFields = renderDefault(props);
  } catch {
    defaultFields = null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={panelStyle}>
        <p style={{ ...mutedStyle, margin: 0 }}>
          Upload PNG, JPEG, WebP, GIF, or AVIF images up to 10 MiB to Cloudflare R2.
        </p>
        <div style={rowStyle}>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            disabled={readOnly || uploading}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) {
                void onUpload(file);
              }
              event.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            disabled={readOnly || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload to R2"}
          </button>
          {value?.url ? <span style={mutedStyle}>{value.url}</span> : null}
        </div>
        {error ? <p style={{ ...errorStyle, margin: 0 }}>{error}</p> : null}
      </div>
      {defaultFields}
    </div>
  );
}
