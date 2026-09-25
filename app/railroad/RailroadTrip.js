import Link from "next/link";
import { formatNewYorkTime } from "../lib/time";

export default function RailroadTrip({ root, routes, stops, trip }) {
  if (!trip) return <p>This train is no longer present in the live feed.</p>;

  const branch = routes.find((route) => route.id === trip.routeId);
  const stopsById = new Map(stops.map((stop) => [stop.id, stop]));
  const stationName = (stopId) => stopsById.get(stopId)?.name || stopId;

  return (
    <>
      <Link
        className="rail-route-link"
        href={`${root}/route/${trip.routeId}`}
        style={{ color: branch?.color }}
      >
        {branch?.name}
      </Link>
      <h2>{stationName(trip.stops[0]?.id)} → {stationName(trip.stops.at(-1)?.id)}</h2>
      {trip.canceled && <p role="status">Canceled</p>}
      <div className="rail-strip" style={{ "--rail-color": branch?.color || "#1677d2" }}>
        {trip.stops.map((stop, index) => (
          <Link
            className="rail-stop"
            key={`${stop.id}-${index}`}
            href={`${root}/stop/${stop.id}`}
          >
            <span className="rail-dot" />
            <span>
              {stationName(stop.id)}
              {stop.skipped ? " · Stop skipped" : ""}
              {trip.currentStop === stop.id ? " · Train location" : ""}
            </span>
            <time>{formatNewYorkTime(stop.time)}</time>
          </Link>
        ))}
      </div>
    </>
  );
}
