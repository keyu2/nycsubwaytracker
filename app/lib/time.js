const NEW_YORK_TIME_ZONE = "America/New_York";
const NEW_YORK_SHORT_TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: NEW_YORK_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});
const NEW_YORK_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: NEW_YORK_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const NEW_YORK_OFFSET = new Intl.DateTimeFormat("en-US", {
  timeZone: NEW_YORK_TIME_ZONE,
  timeZoneName: "longOffset",
});

function newYorkClockParts() {
  const parts = NEW_YORK_CLOCK.formatToParts(new Date());
  return Object.fromEntries(parts.map((part) => [part.type, Number(part.value) || 0]));
}

export function currentNewYorkMinute() {
  const { hour, minute } = newYorkClockParts();
  return hour * 60 + minute;
}

export function currentNewYorkSecond() {
  const { hour, minute, second } = newYorkClockParts();
  return hour * 3600 + minute * 60 + second;
}

export function gtfsMinute(value) {
  const [hours, minutes] = String(value || "").split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
}

export function gtfsSecond(value) {
  const [hours, minutes, seconds] = String(value || "").split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes)
    ? hours * 3600 + minutes * 60 + (Number.isFinite(seconds) ? seconds : 0)
    : null;
}

export function unixSeconds(value) {
  if (value == null) return undefined;
  return typeof value === "object" && "toNumber" in value ? value.toNumber() : Number(value);
}

export function tripIdStartSecond(tripId) {
  const encodedPart = String(tripId || "").split("_")[0];
  if (!/^\d+$/.test(encodedPart)) return null;
  return Math.round(Number(encodedPart) * 0.6);
}

// GTFS measures service time from local noon minus twelve hours, including DST days.
export function tripStartTimestamp(serviceDate, startSecond) {
  if (!/^\d{8}$/.test(serviceDate || "") || startSecond === null) return null;
  const year = Number(serviceDate.slice(0, 4));
  const month = Number(serviceDate.slice(4, 6));
  const day = Number(serviceDate.slice(6, 8));
  const noon = Date.UTC(year, month - 1, day, 12);
  const offset = NEW_YORK_OFFSET.formatToParts(new Date(noon))
    .find((part) => part.type === "timeZoneName")?.value;
  const match = offset?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return null;
  const offsetSeconds = (Number(match[2]) * 3600 + Number(match[3]) * 60)
    * (match[1] === "+" ? 1 : -1);
  return noon / 1000 - offsetSeconds - 12 * 3600 + startSecond;
}

export function formatArrivalCountdown(totalSeconds, showSeconds = false) {
  if (totalSeconds == null || !Number.isFinite(Number(totalSeconds))) return "-";
  const remaining = Math.max(0, Math.floor(Number(totalSeconds)));
  const hours = Math.floor(remaining / 3600);
  const wholeMinutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  if (hours > 0) {
    return `${hours}h ${wholeMinutes}m${showSeconds ? ` ${seconds}s` : ""}`;
  }
  if (showSeconds) return `${Math.floor(remaining / 60)}m ${seconds}s`;

  const roundedMinutes = Math.round(remaining / 60);
  return roundedMinutes === 0 ? "0m" : `${roundedMinutes} min`;
}

export function formatNewYorkTime(timestamp) {
  return timestamp ? NEW_YORK_SHORT_TIME.format(new Date(timestamp * 1000)) : "-";
}
