"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AppTabs from "../AppTabs";
import FavoritePicker from "./FavoritePicker";
import FocusedLineBrowser from "./FocusedLineBrowser";
import { LineList } from "./HomeLists";
import { FavoritesView, NearbyView, SearchResults } from "./HomeSections";
import {
  StatusAlertDetail,
  StatusAlertList,
} from "./StatusAlerts";
import { ROUTE_GROUPS } from "./config";
import { useFavoriteLines } from "./useFavoriteLines";
import { useFavoriteStations } from "../../lib/favoriteStations";
import { useSubwayPreferences } from "../../lib/preferences";
import { nearestStations, searchDiscovery } from "../../lib/stationDiscovery";

export default function StatusHome({
  stations,
  routeIds,
  routeStatuses,
  routeAlerts = {},
  focusedRouteId,
  focusedRoute,
  focusedRouteAvailable,
  view,
  section,
}) {
  const { lineView } = useSubwayPreferences();
  const { stations: favoriteStations, removeStation } = useFavoriteStations();
  const { favorites, ready: favoritesReady, toggle: toggleFavorite } = useFavoriteLines(routeIds);
  const [alertGroup, setAlertGroup] = useState(null);
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");

  const available = useMemo(() => new Set(routeIds), [routeIds]);
  const results = useMemo(
    () => searchDiscovery(stations, routeIds, query),
    [stations, routeIds, query]
  );
  const nearby = useMemo(
    () => nearestStations(stations, location, 8),
    [stations, location]
  );
  const favoriteGroups = useMemo(
    () => ROUTE_GROUPS
      .map((group) => group.filter((routeId) => favorites.includes(routeId)))
      .filter((group) => group.length),
    [favorites]
  );

  function findNearby() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not available in this browser.");
      return;
    }

    setLocationMessage("Finding nearby stations…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationMessage("");
      },
      () => setLocationMessage(
        "Allow location access in your browser settings, then try again."
      ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  function pageContent() {
    if (view === "status") {
      const groups = section === "favorites" ? favoriteGroups : ROUTE_GROUPS;
      return (
        <>
          {section === "favorites" && (
            <button
              className="new-manage-favorites"
              onClick={() => setPickerOpen(true)}
            >
              Manage favorite lines
            </button>
          )}
          <StatusAlertList
            available={available}
            groups={groups}
            routeAlerts={routeAlerts}
            onSelect={setAlertGroup}
            showEmptyFavorites={section === "favorites" && favoritesReady}
          />
        </>
      );
    }

    if (section === "nearby") {
      return (
        <NearbyView
          nearby={nearby}
          location={location}
          locationMessage={locationMessage}
          onLocate={findNearby}
        />
      );
    }

    if (section === "subway" && lineView === "focus") {
      return (
        <FocusedLineBrowser
          routeIds={routeIds}
          routeStatuses={routeStatuses}
          routeAlerts={routeAlerts}
          routeId={focusedRouteId}
          route={focusedRoute}
          serviceAvailable={focusedRouteAvailable}
        />
      );
    }

    return (
      <>
        <div className="new-search">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search"
          />
        </div>
        {query.trim() && <SearchResults results={results} />}
        {section === "subway" ? (
          <LineList
            groups={ROUTE_GROUPS}
            available={available}
            routeStatuses={routeStatuses}
          />
        ) : favoritesReady && (
          <FavoritesView
            available={available}
            favoriteGroups={favoriteGroups}
            favoriteStations={favoriteStations}
            onManage={() => setPickerOpen(true)}
            onRemoveStation={removeStation}
            routeStatuses={routeStatuses}
            stations={stations}
          />
        )}
      </>
    );
  }

  return (
    <main className="new-app-shell">
      <div className="new-status-page">
        {alertGroup ? (
          <StatusAlertDetail group={alertGroup} onBack={() => setAlertGroup(null)} />
        ) : (
          <>
            <AppTabs
              active={view === "status" ? "status" : section}
              onNavigate={() => setQuery("")}
            />
            {pageContent()}
          </>
        )}
      </div>
      {pickerOpen && (
        <FavoritePicker
          available={available}
          favorites={favorites}
          onToggle={toggleFavorite}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </main>
  );
}
