"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  notifyStorageChange,
  readJsonStorage,
  subscribeToStorage,
  writeJsonStorage,
} from "./clientStorage";

const EMPTY_FAVORITES = Object.freeze([]);
const cache = new Map();

function storageKey(agency) {
  return `railroad-${agency}-favorites`;
}

function changeEvent(agency) {
  return `railroad-${agency}-favorites-change`;
}

function normalize(value) {
  if (!Array.isArray(value)) return EMPTY_FAVORITES;
  return [...new Set(value.filter((routeId) => typeof routeId === "string"))];
}

function readFavorites(agency) {
  try {
    const key = storageKey(agency);
    const serialized = localStorage.getItem(key) || "";
    const previous = cache.get(agency);
    if (previous?.serialized === serialized) return previous.favorites;

    const favorites = normalize(readJsonStorage(key, EMPTY_FAVORITES));
    cache.set(agency, { serialized, favorites });
    return favorites;
  } catch {
    return EMPTY_FAVORITES;
  }
}

function saveFavorites(agency, favorites) {
  writeJsonStorage(storageKey(agency), favorites);
  cache.delete(agency);
  notifyStorageChange(changeEvent(agency));
}

export function useRailroadFavorites(agency) {
  const subscribe = useCallback(
    (callback) => subscribeToStorage(changeEvent(agency), callback),
    [agency]
  );
  const getSnapshot = useCallback(() => readFavorites(agency), [agency]);
  const favorites = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_FAVORITES);

  return {
    favorites,
    toggleFavorite(routeId) {
      saveFavorites(
        agency,
        favorites.includes(routeId)
          ? favorites.filter((favoriteId) => favoriteId !== routeId)
          : [...favorites, routeId]
      );
    },
  };
}
