"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { routeFamily } from "../../lib/routes";

const selectionListeners = new Set();

function subscribeToSelection(listener) {
  selectionListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    selectionListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function selectionKey(stopId) {
  return `subway-display-board-routes:${stopId}`;
}

function saveSelection(stopId, groupIds, selectedGroupIds) {
  const key = selectionKey(stopId);
  if (selectedGroupIds.length === groupIds.length) sessionStorage.removeItem(key);
  else sessionStorage.setItem(key, selectedGroupIds.join("|"));
  for (const listener of selectionListeners) listener();
}

export function useBoardRouteFilter({
  alertsByRoute,
  northbound,
  providedRouteGroups,
  routeIds,
  southbound,
  stopId,
}) {
  const routeKey = routeIds.join("|");
  const routeGroups = useMemo(() => {
    if (providedRouteGroups?.length) return providedRouteGroups;
    const groups = new Map();
    for (const routeId of routeKey.split("|").filter(Boolean)) {
      const familyId = routeFamily(routeId);
      const members = groups.get(familyId) || [];
      if (!members.includes(routeId)) members.push(routeId);
      groups.set(familyId, members);
    }
    return [...groups].map(([id, members]) => ({ id, members }));
  }, [providedRouteGroups, routeKey]);
  const groupIds = useMemo(() => routeGroups.map(({ id }) => id), [routeGroups]);
  const getSnapshot = useCallback(
    () => sessionStorage.getItem(selectionKey(stopId)) || "",
    [stopId]
  );
  const savedSelection = useSyncExternalStore(subscribeToSelection, getSnapshot, () => "");
  const selectedGroupIds = useMemo(() => {
    if (!savedSelection) return groupIds;
    const valid = savedSelection.split("|").filter((id) => groupIds.includes(id));
    return valid.length ? valid : groupIds;
  }, [groupIds, savedSelection]);
  const selectedGroupSet = useMemo(() => new Set(selectedGroupIds), [selectedGroupIds]);
  const selectedRouteFamilies = useMemo(() => new Set(
    routeGroups
      .filter((group) => selectedGroupSet.has(group.id))
      .flatMap((group) => group.members.map(routeFamily))
  ), [routeGroups, selectedGroupSet]);
  const filterTrains = useCallback(
    (trains) => trains.filter(
      (train) => selectedRouteFamilies.has(routeFamily(train.trip?.route?.id))
    ),
    [selectedRouteFamilies]
  );
  const alerts = useMemo(() => {
    const unique = new Map();
    for (const group of routeGroups) {
      if (!selectedGroupSet.has(group.id)) continue;
      for (const key of new Set([
        ...group.members,
        ...group.members.map(routeFamily),
      ])) {
        for (const alert of alertsByRoute[key] || []) {
          const id = alert.id || `${alert.alertType}:${alert.header}:${alert.description}`;
          if (!unique.has(id)) unique.set(id, alert);
        }
      }
    }
    return [...unique.values()];
  }, [alertsByRoute, routeGroups, selectedGroupSet]);

  const toggleGroup = useCallback((groupId) => {
    let next;
    if (selectedGroupIds.length === routeGroups.length) next = [groupId];
    else if (selectedGroupIds.includes(groupId)) {
      next = selectedGroupIds.length === 1
        ? selectedGroupIds
        : selectedGroupIds.filter((id) => id !== groupId);
    } else next = [...selectedGroupIds, groupId];
    saveSelection(stopId, groupIds, next);
  }, [groupIds, routeGroups.length, selectedGroupIds, stopId]);

  return {
    alerts,
    filteredNorthbound: filterTrains(northbound),
    filteredSouthbound: filterTrains(southbound),
    routeGroups,
    selectedGroupIds,
    selectedGroupSet,
    toggleGroup,
  };
}

export function useFullscreenFit(contentKey) {
  const boardRef = useRef(null);
  const fitRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === boardRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    const board = boardRef.current;
    const content = fitRef.current;
    if (!board || !content) return;

    const reset = () => {
      content.style.width = "";
      content.style.transform = "";
    };
    if (!fullscreen) {
      reset();
      return;
    }

    let frame;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        reset();
        let scale = Math.min(1, board.clientHeight / Math.max(content.scrollHeight, 1));
        content.style.width = `${100 / scale}%`;
        scale = Math.min(1, board.clientHeight / Math.max(content.scrollHeight, 1));
        content.style.width = `${100 / scale}%`;
        content.style.transform = `scale(${scale})`;
      });
    };

    const observer = new ResizeObserver(fit);
    observer.observe(content);
    window.addEventListener("resize", fit);
    fit();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", fit);
      reset();
    };
  }, [fullscreen, contentKey]);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await boardRef.current?.requestFullscreen?.();
    } catch {
      return false;
    }
    return true;
  }

  return { boardRef, fitRef, fullscreen, toggleFullscreen };
}
