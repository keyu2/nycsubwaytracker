import { isPlannedServiceAlert, serviceAlertStatus } from "../alertClassification.js";
import { normalizeRouteId } from "../routes.js";
import { unixSeconds } from "../time.js";
import { getAlertsFeed } from "./feeds.js";

const STATUS_SEVERITY = { planned: 1, delay: 2, suspended: 3 };

function translatedText(value) {
  const translations = value?.translation || [];
  return (
    translations.find((item) => item.language === "en")?.text ||
    translations.find((item) => item.language?.startsWith("en"))?.text ||
    translations[0]?.text ||
    ""
  );
}

function isActiveAlert(alert, now) {
  if (!(alert.activePeriod || []).length) return true;
  return alert.activePeriod.some((period) => {
    const start = unixSeconds(period.start);
    const end = unixSeconds(period.end);
    return (!start || start <= now) && (!end || end >= now);
  });
}

export async function getRouteAlerts(routeId) {
  const entities = await getAlertsFeed();
  const now = Math.floor(Date.now() / 1000);

  return entities
    .filter(({ alert }) => (
      alert &&
      isActiveAlert(alert, now) &&
      (alert.informedEntity || []).some(
        (item) => normalizeRouteId(item.routeId) === routeId
      )
    ))
    .map((entity) => {
      const alert = entity.alert;
      const alertType = alert.mercury?.alert_type || "";
      const planned = isPlannedServiceAlert({ cause: alert.cause, alertType });

      return {
        id: entity.id,
        header: translatedText(alert.headerText),
        description: translatedText(alert.descriptionText),
        alertType,
        timeLabel: translatedText(alert.mercury?.human_readable_active_period),
        category: planned ? "planned" : "happening",
      };
    })
    .filter((alert) => alert.header || alert.description);
}

export async function getRouteStatuses(routeIds) {
  const statuses = {};

  await Promise.all(routeIds.map(async (routeId) => {
    const alerts = await getRouteAlerts(routeId);
    for (const alert of alerts) {
      const status = serviceAlertStatus(alert);
      if (!statuses[routeId] || STATUS_SEVERITY[status] > STATUS_SEVERITY[statuses[routeId]]) {
        statuses[routeId] = status;
      }
    }
  }));

  return statuses;
}
