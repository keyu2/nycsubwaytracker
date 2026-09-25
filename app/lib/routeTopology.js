const A_ROUTE = "A";
const FIVE_ROUTE = "5";
const BROAD_CHANNEL_STOP = "H04";
const EAST_180_STOP = "213";

function branchById(branches, branchId) {
  return branches.find((branch) => branch.id === branchId);
}

function aRouteTopology(branches) {
  const lefferts = branchById(branches, "lefferts");
  const farRockaway = branchById(branches, "far-rockaway");
  if (!lefferts || !farRockaway) return null;

  const rockawayPark = branchById(branches, "rockaway-park");
  const broadChannelIndex = farRockaway.stops.findIndex(
    (stop) => stop.id === BROAD_CHANNEL_STOP
  );
  const farRockawayTrunk = broadChannelIndex >= 0
    ? farRockaway.stops.slice(0, broadChannelIndex + 1)
    : farRockaway.stops;
  const farRockawayTail = broadChannelIndex >= 0
    ? farRockaway.stops.slice(broadChannelIndex + 1)
    : [];

  return {
    kind: "a",
    lefferts,
    rockawayPark,
    farRockawayTrunk,
    farRockawayTail,
    hasRockawayParkSplit: Boolean(rockawayPark && farRockawayTail.length),
  };
}

function fiveRouteTopology(stops, branches) {
  const nereid = branchById(branches, "nereid");
  const junctionIndex = stops.findIndex((stop) => stop.id === EAST_180_STOP);
  if (!nereid || junctionIndex <= 0) return null;

  return {
    kind: "five",
    trunkBefore: stops.slice(0, junctionIndex),
    branch: nereid,
    trunkAfter: stops.slice(junctionIndex),
  };
}

function temporaryRouteTopology(stops, branches) {
  const temporaryBranches = branches.filter(
    (branch) => branch.temporary && branch.junctionId
  );
  if (!temporaryBranches.length) return null;

  const junctionIndex = stops.findIndex(
    (stop) => stop.id === temporaryBranches[0].junctionId
  );
  if (junctionIndex < 0) return null;

  const branchesBefore = temporaryBranches.filter(
    (branch) => branch.placement === "before"
  );
  const branchesAfter = temporaryBranches.filter(
    (branch) => branch.placement !== "before"
  );
  const splitIndex = junctionIndex + (branchesBefore.length ? 0 : 1);

  return {
    kind: "temporary",
    trunkBefore: stops.slice(0, splitIndex),
    branchesBefore,
    branchesAfter,
    trunkAfter: stops.slice(splitIndex),
  };
}

export function buildRouteTopology(stops, branches, routeId) {
  if (routeId === A_ROUTE) {
    const topology = aRouteTopology(branches);
    if (topology) return topology;
  }

  if (routeId === FIVE_ROUTE) {
    const topology = fiveRouteTopology(stops, branches);
    if (topology) return topology;
  }

  const temporaryTopology = temporaryRouteTopology(stops, branches);
  if (temporaryTopology) return temporaryTopology;

  return {
    kind: "standard",
    branches: branches.filter((branch) => !branch.temporary),
  };
}
