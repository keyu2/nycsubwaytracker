import BackButton from "../../../components/BackButton";
import RouteBullet from "../../../components/RouteBullet";
import { GroupedServiceAlerts } from "../../../components/ServiceAlerts";
import { getRouteAlerts } from "../../../lib/mta";

export default async function RouteAlertsPage({ params }) {
  const { id } = await params;
  const alerts = await getRouteAlerts(id);

  return (
    <main className="page-shell alerts-page">
      <BackButton href={`/route/${id}`} />
      <div className="alerts-page-header">
        <RouteBullet routeId={id} size={52} />
        <h1 className="alerts-page-title">Service Alerts</h1>
      </div>

      {!alerts.length && <p className="alerts-page-empty">No current service alerts.</p>}
      <GroupedServiceAlerts alerts={alerts} />
    </main>
  );
}
