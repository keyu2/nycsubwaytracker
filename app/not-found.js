import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <h1>Page not found</h1>
      <p>This subway route, station, or trip is unavailable.</p>
      <Link href="/">
        Return to the subway overview
      </Link>
    </main>
  );
}
