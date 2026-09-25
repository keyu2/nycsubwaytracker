import Link from "next/link";
import RouteBullet from "./RouteBullet";

const ROUTE_ORDER = [
  "1", "2", "3", "4", "5", "6", "7",
  "A", "C", "E", "B", "D", "F", "M", "G", "J", "Z", "L",
  "N", "Q", "R", "W", "GS", "FS", "H", "SI",
];

const STATUS_COLORS = {
  planned: "#1677d2",
  delay: "#df7b12",
  suspended: "#d6232a",
};

export default function RouteStrip({ routeIds, activeRoute, routeStatuses = {}, hrefForRoute }) {
  const available = new Set(routeIds);
  const ordered = ROUTE_ORDER.filter((id) => available.has(id));

  return (
    <nav className="route-strip" aria-label="Choose a subway line">
      {ordered.map((id) => {
        const selected = id === activeRoute;
        const statusColor = STATUS_COLORS[routeStatuses[id]];
        return (
          <Link
            className={selected ? "active" : ""}
            href={hrefForRoute ? hrefForRoute(id) : `/route/${id}`}
            aria-current={selected ? "page" : undefined}
            aria-label={`${id} train${routeStatuses[id] ? `, ${routeStatuses[id]} service status` : ""}`}
            key={id}
          >
            <RouteBullet routeId={id} size={40} />
            {statusColor && <span className="route-strip__status" style={{ background: statusColor }} />}
          </Link>
        );
      })}
    </nav>
  );
}
