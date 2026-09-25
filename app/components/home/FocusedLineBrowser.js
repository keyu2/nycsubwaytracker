import RouteBullet from "../RouteBullet";
import RouteStrip from "../RouteStrip";
import { RouteServiceAlerts } from "../ServiceAlerts";
import RouteStops from "../../route/[id]/RouteStops";

export default function FocusedLineBrowser({
  routeIds,
  routeStatuses,
  routeAlerts,
  routeId,
  route,
  serviceAvailable,
}) {
  const serviceMap = (
    route?.serviceMaps?.find((map) => map.configId === "alltimes") ||
    route?.serviceMaps?.[0]
  );

  return (
    <section
      className="focused-line-browser focused-line-browser--route"
      aria-label={`${routeId} line stations`}
    >
      <RouteStrip
        routeIds={routeIds}
        routeStatuses={routeStatuses}
        activeRoute={routeId}
        hrefForRoute={(id) => `/subway?line=${encodeURIComponent(id)}`}
      />
      <div className="focused-line-browser__identity">
        <RouteBullet routeId={routeId} size={64} loading="eager" />
        {serviceAvailable === false && <span>No service right now</span>}
      </div>
      <RouteServiceAlerts alerts={routeAlerts[routeId] || []} />
      <RouteStops
        stops={serviceMap?.stops || []}
        branches={route?.branches || []}
        routeId={routeId}
        noService={serviceAvailable === false}
      />
    </section>
  );
}
