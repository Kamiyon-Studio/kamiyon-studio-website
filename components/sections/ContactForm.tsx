"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";

type FormStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type ApiEnvelope = {
  success: boolean;
  data: { sent: true } | null;
  error: string | null;
};

const fieldClass =
  "mt-1.5 w-full rounded-[var(--radius-button)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });

      const body = (await response.json()) as ApiEnvelope;

      if (!response.ok || !body.success) {
        setStatus({
          kind: "error",
          message:
            body.error ??
            "Something went wrong. Please try again or email us directly.",
        });
        return;
      }

      setName("");
      setEmail("");
      setMessage("");
      setCompany("");
      setStatus({ kind: "success" });
    } catch {
      setStatus({
        kind: "error",
        message:
          "Something went wrong. Please try again or email us directly.",
      });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative max-w-[560px] space-y-5"
      noValidate
      aria-describedby="contact-form-status"
    >
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          Send a message
        </h2>
        <p className="mt-3 text-sm text-[var(--text-secondary)] md:text-base">
          Prefer email in-app? Tell us about your project and we will reply
          soon. You can still use the Google Form or channels below anytime.
        </p>
      </div>

      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
          disabled={status.kind === "submitting"}
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
          disabled={status.kind === "submitting"}
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={fieldClass}
          disabled={status.kind === "submitting"}
        />
      </div>

      {/* Honeypot — visually hidden from humans */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
      >
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary">
          {status.kind === "submitting" ? "Sending…" : "Send message"}
        </Button>
      </div>

      <p
        id="contact-form-status"
        role="status"
        aria-live="polite"
        className="text-sm text-[var(--text-secondary)]"
      >
        {status.kind === "success"
          ? "Thanks — your message is on its way. We will reply soon."
          : null}
        {status.kind === "error" ? status.message : null}
      </p>
    </form>
  );
}
