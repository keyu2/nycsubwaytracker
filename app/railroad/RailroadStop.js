"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { useSubwayPreferences } from "../lib/preferences";
import { formatArrivalCountdown } from "../lib/time";
import { useLiveTimestamp } from "../lib/useLiveTimestamp";

export default function RailroadStop({ id, live, root, routes, stops }) {
  const { showSeconds } = useSubwayPreferences();
  const now = useLiveTimestamp(live?.updatedAt);
  const [selectedDestination, setSelectedDestination] = useState("");
  const routesById = useMemo(
    () => new Map(routes.map((route) => [route.id, route])),
    [routes]
  );
  const stopsById = useMemo(
    () => new Map(stops.map((stop) => [stop.id, stop])),
    [stops]
  );
  const stationName = (stopId) => stopsById.get(stopId)?.name || stopId;

  const arrivals = (live?.trips || [])
    .flatMap((trip) => {
      const arrival = trip.stops.find((stop) => stop.id === id);
      if (!arrival || arrival.time < now || arrival.skipped || trip.canceled) return [];
      return [{ ...trip, arrival }];
    })
    .sort((left, right) => left.arrival.time - right.arrival.time);
  const destinations = [...new Set(
    arrivals.map((trip) => stationName(trip.stops.at(-1)?.id))
  )];
  const activeDestination = destinations.includes(selectedDestination)
    ? selectedDestination
    : destinations[0];

  return (
    <>
      <div className="rail-tabs" aria-label="Destination">
        {destinations.map((destination) => (
          <button
            type="button"
            aria-pressed={activeDestination === destination}
            onClick={() => setSelectedDestination(destination)}
            key={destination}
          >
            {destination}
          </button>
        ))}
      </div>

      {live && arrivals.length === 0 && (
        <p>No upcoming trains are currently reported by MTA for this station.</p>
      )}

      <div className="rail-list">
        {arrivals
          .filter((trip) => stationName(trip.stops.at(-1)?.id) === activeDestination)
          .map((trip) => {
            const pending = trip.stops[0]?.time > now;
            const destination = stationName(trip.stops.at(-1)?.id);
            const branch = routesById.get(trip.routeId);
            const delay = trip.arrival.delay >= 180
              ? ` · Delayed ${Math.round(trip.arrival.delay / 60)} min`
              : "";

            return (
              <Link className="rail-row" key={trip.id} href={`${root}/trip/${encodeURIComponent(trip.id)}`}>
                <span>
                  <strong>{destination}</strong>
                  <small>{branch?.name} · Train {trip.number}{delay}</small>
                </span>
                <span className={pending ? "rail-pending" : ""}>
                  {formatArrivalCountdown(trip.arrival.time - now, showSeconds)}
                  {pending && <Clock size={18} aria-label="Not departed" />}
                </span>
              </Link>
            );
          })}
      </div>
    </>
  );
}
