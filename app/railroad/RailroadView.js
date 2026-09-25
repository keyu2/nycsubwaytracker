"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Accessibility } from "lucide-react";
import BackButton from "../components/BackButton";
import HomeButton from "../components/HomeButton";
import { RouteServiceAlerts } from "../components/ServiceAlerts";
import { formatNewYorkTime } from "../lib/time";
import RailroadHome from "./RailroadHome";
import RailroadRoute from "./RailroadRoute";
import RailroadStop from "./RailroadStop";
import RailroadTrip from "./RailroadTrip";

const REFRESH_INTERVAL = 20_000;

function pageTitle({ agency, kind, route, station, trip }) {
  if (kind === "home") return agency === "lirr" ? "LIRR" : "Metro-North";
  if (kind === "route") return route.name;
  if (kind === "stop") return station.name;
  return `Train ${trip?.number || ""}`;
}

export default function RailroadView({
  agency,
  kind,
  id,
  routes,
  stops,
  patterns,
  live,
  alerts,
  alertsUnavailable,
}) {
  const router = useRouter();
  const root = `/railroad/${agency}`;
  const route = routes.find((item) => item.id === id);
  const station = stops.find((item) => item.id === id);
  const trip = live?.trips.find((item) => item.id === id);
  const title = pageTitle({ agency, kind, route, station, trip });
  const routeAlerts = kind === "route"
    ? alerts.filter((alert) => !alert.routes.length || alert.routes.includes(id))
    : [];

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), REFRESH_INTERVAL);
    return () => window.clearInterval(timer);
  }, [router]);

  return (
    <main className={`page-shell rail-page${kind === "home" ? " rail-page--home" : ""}`}>
      <BackButton />
      <HomeButton />
      <h1>
        {title}
        {kind === "stop" && station.accessible && (
          <Accessibility size={28} aria-label="Accessible station" />
        )}
      </h1>

      {!live && (
        <p role="status">Live arrivals are temporarily unavailable. Please try again shortly.</p>
      )}
      {live && <p className="rail-updated">Updated {formatNewYorkTime(live.updatedAt)}</p>}

      {kind === "route" && alertsUnavailable && (
        <p className="rail-updated">Service alerts are temporarily unavailable.</p>
      )}
      {kind === "route" && <RouteServiceAlerts alerts={routeAlerts} />}

      {kind === "home" && (
        <RailroadHome agency={agency} root={root} routes={routes} stops={stops} />
      )}
      {kind === "route" && (
        <RailroadRoute patterns={patterns} root={root} route={route} />
      )}
      {kind === "stop" && (
        <RailroadStop id={id} live={live} root={root} routes={routes} stops={stops} />
      )}
      {kind === "trip" && (
        <RailroadTrip root={root} routes={routes} stops={stops} trip={trip} />
      )}
    </main>
  );
}
