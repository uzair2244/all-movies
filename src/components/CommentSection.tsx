"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

interface Comment {
  id: number;
  author: string;
  body: string;
  date: string;
}

export default function CommentSection({ movieId }: { movieId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !body.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now(), author, body, date: new Date().toLocaleDateString() },
    ]);
    setAuthor("");
    setEmail("");
    setBody("");
    setWebsite("");
  };

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-[var(--color-accent)]" />
        <h3 className="font-display font-bold text-lg">
          {comments.length === 0 ? "Leave a Comment" : `${comments.length} Comment${comments.length > 1 ? "s" : ""}`}
        </h3>
      </div>

      {comments.length > 0 && (
        <ul className="space-y-4 mb-6">
          {comments.map((c) => (
            <li key={c.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{c.author}</span>
                <span className="text-xs text-[var(--color-text-faint)]">{c.date}</span>
              </div>
              <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="card p-4 space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a Comment"
          className="field min-h-[100px] resize-y"
          required
        />
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name *"
            className="field"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email *"
            type="email"
            className="field"
            required
          />
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website"
            type="url"
            className="field"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
          <input type="checkbox" className="accent-[var(--color-accent)]" />
          Save my name, email, and website in this browser for the next time I comment.
        </label>
        <button type="submit" className="btn btn-primary">
          Post Comment
        </button>
      </form>
    </section>
  );
}
