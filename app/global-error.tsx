"use client";

import PageError from "./(frontend)/error";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: "42rem", margin: "4rem auto", padding: "1.5rem", fontFamily: "sans-serif", lineHeight: 1.6 }}><PageError reset={reset} /></main>
      </body>
    </html>
  );
}
