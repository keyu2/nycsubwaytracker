import Link from "next/link";

export default function HomeButton() {
  return (
    <Link
      href="/subway"
      className="nav-button nav-button--home"
    >
      Home
    </Link>
  );
}
