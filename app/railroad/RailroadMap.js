import Link from "next/link";
import { Accessibility } from "lucide-react";
import { railroadMap } from "../lib/railroadMap";

function StationLink({ root, station }) {
  return (
    <Link className="rr-map-stop" href={`${root}/stop/${station.id}`}>
      <span className="rr-map-dot" />
      <span>
        {station.name}
        {station.accessible && (
          <Accessibility size={20} aria-label="Accessible station" />
        )}
      </span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}

function Branch({ branch, root }) {
  const className = [
    "rr-map-branch",
    branch.from && "rr-map-branch--split",
    branch.to && "rr-map-branch--merge",
  ].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <div className="rr-map-branch-stops">
        {branch.stops.map((station) => (
          <StationLink key={station.id} root={root} station={station} />
        ))}
      </div>
    </div>
  );
}

function uniqueStations(patterns) {
  return [
    ...new Map(
      patterns.flatMap((pattern) => pattern.stops)
        .map((station) => [station.id, station])
    ).values(),
  ];
}

export default function RailroadMap({ patterns, root, color, query }) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (normalizedQuery) {
    const matches = uniqueStations(patterns).filter((station) => (
      station.name.toLocaleLowerCase().includes(normalizedQuery)
    ));

    return (
      <div className="rr-map rr-map--search" style={{ "--rail-color": color }}>
        {matches.length > 0
          ? matches.map((station) => (
              <StationLink key={station.id} root={root} station={station} />
            ))
          : <p>No matching stations.</p>}
      </div>
    );
  }

  const { main, branches } = railroadMap(patterns);

  return (
    <div className="rr-map" style={{ "--rail-color": color }}>
      {main.map((station) => (
        <div key={station.id}>
          {branches
            .filter((branch) => branch.to === station.id)
            .map((branch) => <Branch branch={branch} key={branch.id} root={root} />)}
          <StationLink root={root} station={station} />
          {branches
            .filter((branch) => !branch.to && branch.from === station.id)
            .map((branch) => <Branch branch={branch} key={branch.id} root={root} />)}
        </div>
      ))}

      {branches
        .filter((branch) => !branch.from && !branch.to)
        .map((branch) => (
          <div className="rr-map-separate" key={branch.id}>
            {branch.stops.map((station) => (
              <StationLink key={station.id} root={root} station={station} />
            ))}
          </div>
        ))}
    </div>
  );
}
