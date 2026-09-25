"use client";

import { useSyncExternalStore } from "react";
import {
  notifyStorageChange,
  readJsonStorage,
  subscribeToStorage,
  writeJsonStorage,
} from "./clientStorage";

const STORAGE_KEY = "subway-favorite-stations";
const CHANGE_EVENT = "subway-favorite-stations-change";
const EMPTY = Object.freeze([]);

let cachedValue = null;
let cachedStations = EMPTY;

function normalize(value) {
  if (!Array.isArray(value)) return EMPTY;
  return value
    .filter((station) => station && typeof station.id === "string" && typeof station.name === "string")
    .map((station) => ({
      id: station.id,
      ids: Array.isArray(station.ids)
        ? [...new Set(station.ids.filter((id) => typeof id === "string"))]
        : [station.id],
      name: station.name,
      route: typeof station.route === "string" ? station.route : "",
      routes: Array.isArray(station.routes) ? station.routes.filter((id) => typeof id === "string") : [],
    }));
}

function getSnapshot() {
  try {
    const value = localStorage.getItem(STORAGE_KEY) || "";
    if (value === cachedValue) return cachedStations;
    cachedValue = value;
    cachedStations = normalize(readJsonStorage(STORAGE_KEY));
    return cachedStations;
  } catch {
    return EMPTY;
  }
}

function subscribe(callback) {
  return subscribeToStorage(CHANGE_EVENT, callback);
}

function save(stations) {
  writeJsonStorage(STORAGE_KEY, stations);
  cachedValue = null;
  notifyStorageChange(CHANGE_EVENT);
}

export function useFavoriteStations() {
  const stations = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const idsFor = (station) => station.ids?.length ? station.ids : [station.id];

  return {
    stations,
    isFavorite: (ids) => {
      const targets = new Set(Array.isArray(ids) ? ids : [ids]);
      return stations.some((station) => idsFor(station).some((id) => targets.has(id)));
    },
    toggleStation: (station) => {
      const targets = new Set(idsFor(station));
      const exists = stations.some((item) => idsFor(item).some((id) => targets.has(id)));
      save(exists
        ? stations.filter((item) => !idsFor(item).some((id) => targets.has(id)))
        : [...stations, ...normalize([station])]);
    },
    removeStation: (id) => save(stations.filter((station) => station.id !== id)),
  };
}
