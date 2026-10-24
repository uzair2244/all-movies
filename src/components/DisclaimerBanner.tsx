"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem("am_disclaimer_dismissed") !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="relative z-[60] bg-[var(--color-bg-elev)] border-b border-[var(--color-border)] text-[var(--color-text-dim)]">
      <div className="container-x py-2 pr-8 text-[11px] sm:text-xs leading-snug flex items-start gap-2">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
        <p>
          <strong className="text-[var(--color-text)]">Important — Content Disclaimer:</strong>{" "}
          allmovies does <strong>not</strong> host, upload, store, or distribute any video files or
          copyrighted material. All media is provided and streamed from <strong>third-party
          servers that we do not own or control</strong>. If you are a copyright owner and believe
          your work is being shown, please contact the <strong>respective third-party content
          provider/server directly</strong> to have it removed. allmovies assumes no liability for
          any content served by external sources.
        </p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          try {
            localStorage.setItem("am_disclaimer_dismissed", "1");
          } catch {
            /* ignore */
          }
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)]"
        aria-label="Dismiss disclaimer"
      >
        <X size={14} />
      </button>
    </div>
  );
}
