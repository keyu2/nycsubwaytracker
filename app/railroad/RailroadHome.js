"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useRailroadFavorites } from "../lib/railroadFavorites";

function groupBranches(routes) {
  const greenport = routes.find((route) => /greenport/i.test(route.name));
  const ronkonkoma = routes.find((route) => /ronkonkoma/i.test(route.name));

  return routes
    .filter((route) => route.id !== greenport?.id)
    .map((route) => (
      route.id === ronkonkoma?.id && greenport ? [route, greenport] : [route]
    ));
}

function BranchRow({ branch, favorite, nested, onToggleFavorite, root }) {
  return (
    <div className={`rail-row${nested ? " rail-row--subbranch" : ""}`}>
      <Link href={`${root}/route/${branch.id}`}>
        <span className="rail-dot" style={{ background: branch.color }} />
        <strong>{branch.name}</strong>
      </Link>
      <button
        type="button"
        aria-label={`Favorite ${branch.name}`}
        aria-pressed={favorite}
        onClick={() => onToggleFavorite(branch.id)}
      >
        <Star size={20} fill={favorite ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

export default function RailroadHome({ agency, root, routes, stops }) {
  const [query, setQuery] = useState("");
  const { favorites, toggleFavorite } = useRailroadFavorites(agency);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const routeGroups = useMemo(() => {
    return groupBranches(routes)
      .map((group) => (
        normalizedQuery
          ? group.filter((route) => route.name.toLocaleLowerCase().includes(normalizedQuery))
          : group
      ))
      .filter((group) => group.length > 0)
      .sort((left, right) => {
        const leftFavorite = left.some((route) => favorites.includes(route.id));
        const rightFavorite = right.some((route) => favorites.includes(route.id));
        return Number(rightFavorite) - Number(leftFavorite);
      });
  }, [favorites, normalizedQuery, routes]);

  const matchingStops = useMemo(() => {
    if (!normalizedQuery) return [];
    return stops.filter((stop) => stop.name.toLocaleLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, stops]);

  return (
    <>
      <nav className="rail-tabs rail-agency-tabs" aria-label="Railroad">
        <Link aria-current={agency === "lirr" ? "page" : undefined} href="/railroad/lirr">
          LIRR
        </Link>
        <Link aria-current={agency === "mnr" ? "page" : undefined} href="/railroad/mnr">
          Metro-North
        </Link>
      </nav>

      <input
        className="rail-search"
        aria-label="Search railroad stations and branches"
        placeholder="Search stations or branches"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="rail-list rail-branch-list">
        {[0, 1].map((column) => (
          <div className="rail-branch-column" key={column}>
            {routeGroups.map((group, index) => {
              if (index % 2 !== column) return null;
              return (
                <div
                  className={`rail-branch-group${group.length > 1 ? " rail-branch-group--nested" : ""}`}
                  key={group[0].id}
                  style={{ order: index, "--rail-color": group[0].color }}
                >
                  {group.map((branch, branchIndex) => (
                    <BranchRow
                      branch={branch}
                      favorite={favorites.includes(branch.id)}
                      key={branch.id}
                      nested={branchIndex > 0}
                      onToggleFavorite={toggleFavorite}
                      root={root}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {normalizedQuery && (
        <div className="rail-list">
          {matchingStops.map((stop) => (
            <Link className="rail-row" key={stop.id} href={`${root}/stop/${stop.id}`}>
              {stop.name}<span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
