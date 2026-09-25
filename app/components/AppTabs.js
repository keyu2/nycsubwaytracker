"use client";

import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { id: "subway", label: "Home", href: "/subway" },
  { id: "favorites", label: "Favorite", href: "/subway/favorites" },
  { id: "nearby", label: "Nearby", href: "/subway/nearby" },
  { id: "status", label: "Status", href: "/status" },
  { id: "settings", label: "Settings", href: "/settings" },
];

export default function AppTabs({ active, onNavigate }) {
  const router = useRouter();

  function navigateTo(href) {
    onNavigate?.();
    router.push(href);
  }

  return (
    <nav className="new-tabs new-tabs--five" aria-label="Main sections">
      {NAV_ITEMS.map(({ id, label, href }) => {
        const isActive = active === id;

        return (
          <button
            key={id}
            type="button"
            className={isActive ? "active" : ""}
            aria-current={isActive ? "page" : undefined}
            aria-pressed={isActive}
            onClick={() => navigateTo(href)}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
