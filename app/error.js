"use client";

export default function ErrorPage({ reset }) {
  return (
    <main className="error-page">
      <h1>MTA data is temporarily unavailable</h1>
      <p>
        The live feed could not be loaded. Your connection may be offline, or the MTA feed may be updating.
      </p>
      <button
        type="button"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
