export function isPlannedServiceAlert(alert = {}) {
  const alertType = String(alert.alertType || alert.mercury?.alert_type || "").trim();

  return (
    alert.cause === 9 ||
    alert.cause === 10 ||
    /^planned\b/i.test(alertType) ||
    /^no scheduled service$/i.test(alertType) ||
    /\bstation notice\b/i.test(alertType) ||
    /\b(?:saturday|sunday|weekend|holiday|special) schedule\b/i.test(alertType)
  );
}

const DELAY_PATTERN = /\b(delay|delays|delayed)\b/i;
const SUSPENSION_PATTERN = /\b(part(?:ially)? suspended|suspended|no (?:\[[^\]]+\]|\S+) service|service suspended)\b/i;

export function serviceAlertStatus(alert = {}) {
  if (alert.category === "planned" || isPlannedServiceAlert(alert)) {
    return "planned";
  }

  const alertType = String(alert.alertType || alert.mercury?.alert_type || "");
  if (DELAY_PATTERN.test(alertType)) return "delay";
  if (SUSPENSION_PATTERN.test(alertType)) return "suspended";

  const details = `${alert.header || ""} ${alert.description || ""}`;
  if (SUSPENSION_PATTERN.test(details)) return "suspended";

  return "delay";
}

export function serviceAlertTone(alert = {}) {
  const status = serviceAlertStatus(alert);
  if (status === "suspended") return "critical";
  if (status === "delay") return "warning";
  return "planned";
}

export function serviceAlertLabel(alert = {}, fallback = "Service alert") {
  return String(alert.alertType || fallback).replace(/\s*[–—-]\s*/g, " - ");
}
