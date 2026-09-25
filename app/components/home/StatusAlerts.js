import RouteBullet from "../RouteBullet";
import { RichAlertText } from "../ServiceAlerts";

function alertsForRoutes(routes, routeAlerts) {
  const unique = new Map();
  for (const routeId of routes) {
    for (const alert of routeAlerts[routeId] || []) {
      const key = alert.id || `${alert.header}:${alert.description}`;
      if (!unique.has(key)) unique.set(key, { ...alert, id: key, routes: [] });
      unique.get(key).routes.push(routeId);
    }
  }
  return [...unique.values()];
}

export function StatusAlertList({
  available,
  groups,
  onSelect,
  routeAlerts,
  showEmptyFavorites = false,
}) {
  return (
    <section className="status-alert-list" aria-label="Service alerts">
      {groups.map((group) => {
        const routes = group.filter((routeId) => available.has(routeId));
        if (!routes.length) return null;
        const alerts = alertsForRoutes(routes, routeAlerts);
        const label = alerts.length > 1
          ? `${alerts.length} alerts`
          : alerts[0]?.alertType || (alerts.length ? "1 alert" : "No alerts");
        return (
          <button
            className="status-alert-row"
            disabled={!alerts.length}
            onClick={() => onSelect({ routes, alerts })}
            key={routes.join("-")}
          >
            <span className="status-alert-bullets">
              {routes.map((routeId) => (
                <RouteBullet key={routeId} routeId={routeId} size={40} />
              ))}
            </span>
            <span className="status-alert-label">{label}</span>
          </button>
        );
      })}
      {showEmptyFavorites && !groups.length && <p>No favorite lines yet.</p>}
    </section>
  );
}

export function StatusAlertDetail({ group, onBack }) {
  return (
    <section className="status-alert-detail">
      <button className="new-manage-favorites" onClick={onBack}>Back</button>
      <h2>
        Alerts for {group.routes.map((routeId) => (
          <RouteBullet key={routeId} routeId={routeId} size={32} />
        ))}
      </h2>
      {group.alerts.map((alert) => (
        <article key={alert.id}>
          <h3>
            {alert.routes.map((routeId) => (
              <RouteBullet key={routeId} routeId={routeId} size={28} />
            ))}
            {alert.alertType || "Service alert"}
          </h3>
          <p className="status-alert-summary">
            <RichAlertText text={alert.header || alert.description} />
          </p>
          {(alert.timeLabel || (alert.description && alert.description !== alert.header)) && (
            <details>
              <summary>Show more details</summary>
              {alert.timeLabel && <p className="status-alert-time">{alert.timeLabel}</p>}
              {alert.description !== alert.header && (
                <p className="status-alert-description">
                  <RichAlertText text={alert.description} />
                </p>
              )}
            </details>
          )}
        </article>
      ))}
    </section>
  );
}
