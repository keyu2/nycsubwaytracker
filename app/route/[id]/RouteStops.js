"use client";

import { useMemo, useState } from "react";
import { buildRouteTopology } from "../../lib/routeTopology";
import { BranchOffshoot, RouteStopList } from "./RouteStopList";

const EMPTY_BRANCHES = Object.freeze([]);

export default function RouteStops({
  stops,
  branches = EMPTY_BRANCHES,
  routeId,
  noService = false,
}) {
  const [query, setQuery] = useState("");
  const topology = useMemo(
    () => buildRouteTopology(stops, branches, routeId),
    [branches, routeId, stops]
  );
  const showStandardTrunk = topology.kind === "standard" || topology.kind === "a";

  return (
    <div>
      <label className="route-station-search">
        <span className="route-station-search__label">
          Search
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter a station name"
        />
      </label>

      {showStandardTrunk && (
        <RouteStopList
          stops={stops}
          routeId={routeId}
          query={query}
          noService={noService}
          continuesBelow={topology.kind === "a" || topology.branches?.length > 0}
        />
      )}

      {topology.kind === "five" && (
        <section aria-label="5 train branches">
          <RouteStopList
            stops={topology.trunkBefore}
            routeId={routeId}
            query={query}
            noService={noService}
            continuesBelow
          />
          <BranchOffshoot
            branch={topology.branch}
            routeId={routeId}
            query={query}
            noService={noService}
            connectsAtStart={false}
            mergesBack
          />
          <RouteStopList
            stops={topology.trunkAfter}
            routeId={routeId}
            query={query}
            noService={noService}
            continuesAbove
            showEndpoint={false}
          />
        </section>
      )}

      {topology.kind === "temporary" && (
        <section aria-label={`${routeId} train temporary service pattern`}>
          <RouteStopList
            stops={topology.trunkBefore}
            routeId={routeId}
            query={query}
            noService={noService}
            continuesBelow
          />
          {topology.branchesBefore.map((branch) => (
            <BranchOffshoot
              branch={branch}
              routeId={routeId}
              query={query}
              noService={noService}
              connectsAtStart={false}
              mergesBack
              key={branch.id}
            />
          ))}
          {topology.branchesAfter.map((branch) => (
            <BranchOffshoot
              branch={branch}
              routeId={routeId}
              query={query}
              noService={noService}
              key={branch.id}
            />
          ))}
          <RouteStopList
            stops={topology.trunkAfter}
            routeId={routeId}
            query={query}
            noService={noService}
            continuesAbove
            showEndpoint={false}
          />
        </section>
      )}

      {topology.kind === "a" && (
        <section aria-label="A train branches">
          <BranchOffshoot branch={topology.lefferts} routeId={routeId} query={query} noService={noService} />
          <RouteStopList
            stops={topology.hasRockawayParkSplit
              ? topology.farRockawayTrunk
              : [...topology.farRockawayTrunk, ...topology.farRockawayTail]}
            routeId={routeId}
            query={query}
            noService={noService}
            continuesAbove
            continuesBelow={topology.hasRockawayParkSplit}
            showEndpoint={false}
          />
          {topology.hasRockawayParkSplit && (
            <>
              <BranchOffshoot branch={topology.rockawayPark} routeId={routeId} query={query} noService={noService} />
              <RouteStopList
                stops={topology.farRockawayTail}
                routeId={routeId}
                query={query}
                noService={noService}
                continuesAbove
                showEndpoint={false}
              />
            </>
          )}
        </section>
      )}

      {topology.kind === "standard" && topology.branches.length > 0 && (
        <section aria-label={`${routeId} train branches`}>
          {topology.branches.map((branch) => (
            <BranchOffshoot branch={branch} routeId={routeId} query={query} noService={noService} key={branch.id} />
          ))}
        </section>
      )}
    </div>
  );
}
