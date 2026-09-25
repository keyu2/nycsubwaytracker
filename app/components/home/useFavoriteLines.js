"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  notifyStorageChange,
  readJsonStorage,
  subscribeToStorage,
  writeJsonStorage,
} from "../../lib/clientStorage";

const STORAGE_KEY = "subway-favorite-lines";
const CHANGE_EVENT = "subway-favorite-lines-change";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const EMPTY_FAVORITES = Object.freeze([]);

let cachedValue = null;
let cachedFavorites = EMPTY_FAVORITES;

function normalizeFavoriteLines(value) {
  if (!Array.isArray(value)) return null;
  return [...new Set(value.filter((routeId) => typeof routeId === "string"))];
}

function favoritesFromCookie() {
  const prefix = `${STORAGE_KEY}=`;
  const cookie = document.cookie.split("; ").find((item) => item.startsWith(prefix));
  if (!cookie) return null;

  try {
    return normalizeFavoriteLines(
      JSON.parse(decodeURIComponent(cookie.slice(prefix.length)))
    );
  } catch {
    return null;
  }
}

function getSnapshot() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY) || "";
    if (serialized === cachedValue) return cachedFavorites;

    cachedValue = serialized;
    cachedFavorites = favoritesFromCookie()
      || normalizeFavoriteLines(readJsonStorage(STORAGE_KEY, EMPTY_FAVORITES))
      || EMPTY_FAVORITES;
    return cachedFavorites;
  } catch {
    return EMPTY_FAVORITES;
  }
}

function subscribe(callback) {
  return subscribeToStorage(CHANGE_EVENT, callback);
}

function saveFavorites(favorites) {
  writeJsonStorage(STORAGE_KEY, favorites);
  document.cookie = [
    `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(favorites))}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ");
  cachedValue = null;
  notifyStorageChange(CHANGE_EVENT);
}

function subscribeToHydration() {
  return () => {};
}

export function useFavoriteLines(routeIds) {
  const storedFavorites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_FAVORITES
  );
  const ready = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const favorites = useMemo(
    () => storedFavorites.filter((routeId) => routeIds.includes(routeId)),
    [routeIds, storedFavorites]
  );
  const toggle = useCallback((routeId) => {
    const current = getSnapshot();
    saveFavorites(
      current.includes(routeId)
        ? current.filter((favoriteId) => favoriteId !== routeId)
        : [...current, routeId]
    );
  }, []);

  return { favorites, ready, toggle };
}
