import { routeFamily } from "./routes.js";

function uniqueRouteIds(routeIds) {
  return [...new Set(routeIds.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export function createBoardRouteGroups(routeIds, stationServices = []) {
  const groups = [];
  const groupedFamilies = new Set();

  for (const service of stationServices) {
    const members = uniqueRouteIds(service.routes || []);
    const families = uniqueRouteIds(members.map(routeFamily));
    if (!families.length || families.every((family) => groupedFamilies.has(family))) continue;

    groups.push({ id: families.join("-"), members });
    for (const family of families) groupedFamilies.add(family);
  }

  for (const family of uniqueRouteIds(routeIds.map(routeFamily))) {
    if (groupedFamilies.has(family)) continue;
    const members = uniqueRouteIds(routeIds.filter((routeId) => routeFamily(routeId) === family));
    groups.push({ id: family, members });
    groupedFamilies.add(family);
  }

  return groups;
}
