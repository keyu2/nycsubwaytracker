"use client";

import { Star } from "lucide-react";
import { useFavoriteStations } from "../lib/favoriteStations";

export default function FavoriteStationButton({ station }) {
  const { isFavorite, toggleStation } = useFavoriteStations();
  const selected = isFavorite(station.ids || station.id);

  return (
    <button
      type="button"
      className={`favorite-station-button${selected ? " selected" : ""}`}
      aria-label={`${selected ? "Remove" : "Add"} ${station.name} ${selected ? "from" : "to"} favorites`}
      aria-pressed={selected}
      onClick={() => toggleStation(station)}
    >
      <Star aria-hidden="true" fill={selected ? "currentColor" : "none"} />
    </button>
  );
}
