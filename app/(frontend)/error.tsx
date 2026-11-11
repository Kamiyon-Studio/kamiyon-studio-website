"use client";

import Link from "next/link";
import { PUBLIC_EMAIL } from "@/lib/contact/channels";

export default function PageError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-bold">
        This page is temporarily unavailable
      </h1>
      <p className="mt-4">
        Please try again. If the problem continues, you can email the studio.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded border px-5 py-2"
        >
          Try again
        </button>
        <Link
          href={`mailto:${PUBLIC_EMAIL}`}
          className="inline-flex min-h-11 items-center underline"
        >
          Email the studio
        </Link>
      </div>
    </section>
  );
}
