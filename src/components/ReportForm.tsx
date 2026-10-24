"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const REASONS = [
  "Movie Not Working",
  "Players are Deleted",
  "Video Not in Hindi",
  "Request Movie",
  "Other",
];

export default function ReportForm({ movieId, title }: { movieId: number; title: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !details.trim()) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    // Demo: simulate request. In production, POST to /api/report
    await new Promise((r) => setTimeout(r, 700));
    setStatus("done");
  };

  return (
    <div className="card p-4 mt-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
          <AlertTriangle size={16} className="text-[var(--color-accent)]" />
          Click Here To Report If Video Not Working OR Bad Video Quality OR Any Other Issue
        </span>
        <span className="text-xs text-[var(--color-text-faint)]">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-4">
          {status === "done" ? (
            <div className="flex items-center gap-2 text-sm text-green-400 py-4">
              <CheckCircle2 size={18} />
              Thanks — your report for “{title}” has been submitted.
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-dim)] mb-1.5">
                    Issue: <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="field"
                  >
                    {REASONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-dim)] mb-1.5">
                    Your Name: <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-dim)] mb-1.5">
                  Details: <span className="text-[var(--color-accent)]">*</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="field min-h-[90px] resize-y"
                  placeholder="Describe the issue..."
                />
              </div>
              {status === "error" && (
                <p className="text-xs text-[var(--color-accent)]">
                  Please fill in all required fields.
                </p>
              )}
              <input type="hidden" value={movieId} readOnly />
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn btn-primary"
              >
                {status === "sending" ? "Submitting…" : "Submit Report"}
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
