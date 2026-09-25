import { notFound } from "next/navigation";
import { RAILROAD_ENABLED } from "../../../lib/features";
import {
  RAILROADS,
  railroadAlerts,
  railroadLive,
  railroadPatterns,
  railroadSchedule,
} from "../../../lib/railroad";
import RailroadView from "../../RailroadView";

const PAGE_KINDS = new Set(["home", "route", "stop", "trip"]);

async function optionalData(load) {
  try {
    return { data: await load(), unavailable: false };
  } catch {
    return { data: null, unavailable: true };
  }
}

export default async function RailroadPage({ params }) {
  if (!RAILROAD_ENABLED) notFound();

  const { agency, path = [] } = await params;
  const [kind = "home", id = ""] = path;

  if (!RAILROADS[agency] || !PAGE_KINDS.has(kind) || path.length > 2) {
    notFound();
  }

  const alertsPromise = kind === "route"
    ? optionalData(() => railroadAlerts(agency))
    : Promise.resolve({ data: [], unavailable: false });
  const [schedule, liveResult, alertsResult] = await Promise.all([
    railroadSchedule(agency),
    optionalData(() => railroadLive(agency)),
    alertsPromise,
  ]);

  const route = schedule.routes.find((item) => item.id === id);
  const stop = schedule.stops.find((item) => item.id === id);
  if ((kind === "route" && !route) || (kind === "stop" && !stop)) {
    notFound();
  }

  return (
    <RailroadView
      key={`${agency}:${kind}:${id}`}
      agency={agency}
      kind={kind}
      id={id}
      routes={schedule.routes}
      stops={schedule.stops}
      patterns={kind === "route" ? railroadPatterns(schedule, id) : []}
      live={liveResult.data}
      alerts={alertsResult.data || []}
      alertsUnavailable={alertsResult.unavailable}
    />
  );
}
