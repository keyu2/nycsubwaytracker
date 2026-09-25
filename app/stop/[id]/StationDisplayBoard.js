"use client";

import Link from "next/link";
import { memo } from "react";
import { Maximize, Minimize } from "lucide-react";
import RouteBullet from "../../components/RouteBullet";
import { RichAlertText } from "../../components/ServiceAlerts";
import { serviceAlertLabel, serviceAlertTone } from "../../lib/alertClassification";
import { directionGroupLabel } from "../../lib/directionLabels";
import { formatArrivalCountdown } from "../../lib/time";
import { useLiveTimestamp } from "../../lib/useLiveTimestamp";
import { useBoardRouteFilter, useFullscreenFit } from "./displayBoardHooks";

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  month: "short",
  day: "numeric",
});
const DISPLAY_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function directionLabel(trains, stopBorough, direction) {
  const parts = new Set();
  for (const train of trains) {
    const label = directionGroupLabel(
      stopBorough,
      train.destination?.borough || null,
      direction
    );
    for (const part of label.split("/").map((value) => value.trim()).filter(Boolean)) {
      parts.add(part);
    }
  }
  return [...parts].join(" / ") || (direction === "northbound" ? "Northbound" : "Southbound");
}

const BoardAlerts = memo(function BoardAlerts({ alerts, layout }) {
  if (!alerts.length) return null;
  return (
    <section className="display-board-alerts" aria-labelledby="display-board-alerts-title">
      <h2 id="display-board-alerts-title">Service Alerts</h2>
      <div className={`display-board-alert-list display-board-alert-list--${layout}`}>
        {alerts.map((alert, index) => (
          <details
            className={`display-board-alert display-board-alert--${serviceAlertTone(alert)}`}
            open
            key={alert.id || `${alert.header}-${index}`}
          >
            <summary>
              <span>{serviceAlertLabel(alert)}</span>
              <strong><RichAlertText text={alert.header || "Service alert"} /></strong>
            </summary>
            {(alert.timeLabel || (alert.description && alert.description !== alert.header)) && (
              <div className="display-board-alert__details">
                {alert.timeLabel && <b>{alert.timeLabel}</b>}
                {alert.description && alert.description !== alert.header && (
                  <p><RichAlertText text={alert.description} /></p>
                )}
              </div>
            )}
          </details>
        ))}
      </div>
    </section>
  );
});

function BoardDirection({ direction, trains, stopBorough, stopId, now, showSeconds }) {
  const currentTrains = trains
    .filter((train) => Number(train.arrival?.time || train.departure?.time || 0) >= now - 30)
    .sort((a, b) =>
      Number(a.arrival?.time || a.departure?.time || Infinity) -
      Number(b.arrival?.time || b.departure?.time || Infinity)
    )
    .slice(0, 4);
  if (!currentTrains.length) return null;
  const label = directionLabel(currentTrains, stopBorough, direction);

  return (
    <section className="display-board-direction" aria-label={`${label} arrivals`}>
      <h2>{label}</h2>
      <div className="display-board-trains">
        {currentTrains.map((train, index) => {
          const routeId = train.trip?.route?.id || "?";
          const arrivalTime = Number(train.arrival?.time || train.departure?.time || 0);
          const destinationId = train.destination?.id || "";
          const destination = destinationId.startsWith(stopId)
            ? "Terminating"
            : train.destination?.name || train.headsign || "Unknown destination";
          return (
            <Link
              className="display-board-train"
              href={`/trip/${routeId}/${encodeURIComponent(train.trip?.id || "")}?from=${encodeURIComponent(stopId)}`}
              key={`${train.trip?.id || "train"}-${index}`}
            >
              <RouteBullet routeId={routeId} size={34} />
              <span className="display-board-destination">
                <strong>{destination}</strong>
                {train.delayMinutes && <small>Est. delayed {train.delayMinutes} min</small>}
              </span>
              <strong className="display-board-time">
                {formatArrivalCountdown(Math.max(0, arrivalTime - now), showSeconds)}
              </strong>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const RouteFilters = memo(function RouteFilters({
  routeGroups,
  selectedGroupSet,
  toggleGroup,
}) {
  return (
    <div className="display-board-route-filters" aria-label="Lines shown">
      {routeGroups.map((group) => {
        const selected = selectedGroupSet.has(group.id);
        return (
          <button
            type="button"
            className={selected ? "active" : ""}
            onClick={() => toggleGroup(group.id)}
            aria-label={`${group.members.join(" and ")} line filter`}
            aria-pressed={selected}
            key={group.id}
          >
            {group.members.map((routeId) => (
              <RouteBullet routeId={routeId} size={30} key={routeId} />
            ))}
          </button>
        );
      })}
    </div>
  );
});

export default function StationDisplayBoard({
  alertLayout,
  alertsByRoute,
  northbound,
  initialTimestamp,
  routeIds,
  routeGroups: providedRouteGroups,
  showSeconds,
  southbound,
  stopBorough,
  stopId,
  stopName,
}) {
  const now = useLiveTimestamp(initialTimestamp);
  const {
    alerts,
    filteredNorthbound,
    filteredSouthbound,
    routeGroups,
    selectedGroupIds,
    selectedGroupSet,
    toggleGroup,
  } = useBoardRouteFilter({
    alertsByRoute,
    northbound,
    providedRouteGroups,
    routeIds,
    southbound,
    stopId,
  });
  const { boardRef, fitRef, fullscreen, toggleFullscreen } = useFullscreenFit(
    `${selectedGroupIds.join("|")}:${alerts.length}`
  );

  const currentDate = new Date(now * 1000);
  const dateLabel = DISPLAY_DATE_FORMATTER.format(currentDate);
  const timeLabel = DISPLAY_TIME_FORMATTER.format(currentDate);

  return (
    <div className="station-trains station-trains--board">
      <section className="station-display-board" ref={boardRef}>
        <button
          className="display-board-fullscreen-exit"
          type="button"
          onClick={toggleFullscreen}
          aria-label="Exit full screen"
        />
        <div className="display-board-fit" ref={fitRef}>
          <header className="display-board-header">
            <div className="display-board-identity">
              {routeGroups.length > 1 ? (
                <RouteFilters
                  routeGroups={routeGroups}
                  selectedGroupSet={selectedGroupSet}
                  toggleGroup={toggleGroup}
                />
              ) : (
                <div className="display-board-routes">
                  {routeIds.map((routeId) => <RouteBullet routeId={routeId} size={34} key={routeId} />)}
                </div>
              )}
              <h1>{stopName}</h1>
              <time>{dateLabel} · {timeLabel}</time>
            </div>
            <div className="display-board-controls">
              <button type="button" onClick={() => window.history.back()}>Back</button>
              <Link href="/settings">Settings</Link>
              <button type="button" onClick={toggleFullscreen} aria-pressed={fullscreen}>
                {fullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
                {fullscreen ? "Exit full screen" : "Full screen"}
              </button>
            </div>
          </header>
          <div className="display-board-directions">
            <BoardDirection
              direction="northbound"
              trains={filteredNorthbound}
              stopBorough={stopBorough}
              stopId={stopId}
              now={now}
              showSeconds={showSeconds}
            />
            <BoardDirection
              direction="southbound"
              trains={filteredSouthbound}
              stopBorough={stopBorough}
              stopId={stopId}
              now={now}
              showSeconds={showSeconds}
            />
          </div>
          {!filteredNorthbound.length && !filteredSouthbound.length && (
            <p className="display-board-empty">No upcoming trains reported.</p>
          )}
          <BoardAlerts alerts={alerts} layout={alertLayout} />
        </div>
      </section>
    </div>
  );
}
