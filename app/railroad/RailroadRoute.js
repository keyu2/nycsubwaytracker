"use client";

import { useState } from "react";
import RailroadMap from "./RailroadMap";

export default function RailroadRoute({ patterns, root, route }) {
  const [query, setQuery] = useState("");

  return (
    <>
      <input
        className="rail-search"
        placeholder="Search stations"
        aria-label="Search stations"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <RailroadMap patterns={patterns} root={root} color={route.color} query={query} />
    </>
  );
}
