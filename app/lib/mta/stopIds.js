export function stationStopId(value) {
  return String(value || "").replace(/[NS]$/, "");
}

export function isPublicStopId(value, stopsById) {
  return Boolean(
    value && (stopsById.has(value) || stopsById.has(stationStopId(value)))
  );
}

export function tripLookupId(value) {
  return String(value || "").replace(/\.{2,}/g, ".");
}
