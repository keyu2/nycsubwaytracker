"use client";

import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { useMemo } from "react";
import RouteBullet from "../RouteBullet";
import { stationRouteIds } from "../../lib/stationDiscovery";
import { ROUTE_STATUS } from "./config";

export function StationItem({ station, distance, preferredStopId, preferredRoute }) {
  const routes = stationRouteIds(station);
  const primaryService = station.services.find((service) => service.id === preferredStopId)
    || station.services[0];
  if (!primaryService) return null;

  const routeId = (
    preferredRoute ||
    stationRouteIds({ services: [primaryService] })[0] ||
    primaryService.routes?.[0] ||
    ""
  );

  return (
    <Link
      className="new-station-result"
      href={`/stop/${primaryService.id}?route=${encodeURIComponent(routeId)}`}
    >
      <span>
        <strong>{station.name}</strong>
        {Number.isFinite(distance) && <small>{distance.toFixed(2)} mi away</small>}
      </span>
      <span>
        {routes.map((id) => (
          <RouteBullet key={id} routeId={id} size={25} />
        ))}
        <ChevronRight aria-hidden="true" />
      </span>
    </Link>
  );
}

export function LineList({ groups, available, routeStatuses }) {
  return (
    <section className="new-line-list" aria-label="Subway lines">
      {groups.map((group) => (
        <div className="new-line-row" key={group.join("-")}>
          {group.map((routeId) => {
            if (!available.has(routeId)) return null;
            const status = ROUTE_STATUS[routeStatuses[routeId]];
            const statusLabel = status ? `, ${status.label}` : "";
            return (
              <Link
                className="new-route-button"
                href={`/route/${routeId}`}
                aria-label={`${routeId} train${statusLabel}`}
                key={routeId}
              >
                <RouteBullet routeId={routeId} size={40} />
                {status && <span title={status.label} style={{ background: status.color }} />}
              </Link>
            );
          })}
        </div>
      ))}
    </section>
  );
}

export function FavoriteStationList({ favorites, stations, onRemove }) {
  const stationsByServiceId = useMemo(
    () => new Map(
      stations.flatMap((station) => (
        station.services.map((service) => [service.id, station])
      ))
    ),
    [stations]
  );

  return (
    <section className="favorite-stations" aria-labelledby="favorite-stations-title">
      <h2 id="favorite-stations-title">Stations</h2>
      <div className="favorite-stations__list">
        {favorites.map((favorite) => {
          const matchedId = (favorite.ids || [favorite.id]).find(
            (id) => stationsByServiceId.has(id)
          );
          const station = stationsByServiceId.get(matchedId) || {
            id: favorite.id,
            name: favorite.name,
            services: [{
              id: favorite.id,
              routes: favorite.routes?.length
                ? favorite.routes
                : [favorite.route].filter(Boolean),
            }],
          };
          return (
            <div className="favorite-station-row" key={favorite.id}>
              <StationItem
                station={station}
                preferredStopId={favorite.id}
                preferredRoute={favorite.route}
              />
              <button
                type="button"
                aria-label={`Remove ${favorite.name} from favorites`}
                onClick={() => onRemove(favorite.id)}
              >
                <Star aria-hidden="true" fill="currentColor" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
