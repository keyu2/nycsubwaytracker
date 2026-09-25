import Link from "next/link";
import { Star } from "lucide-react";
import RouteBullet from "../RouteBullet";
import { FavoriteStationList, LineList, StationItem } from "./HomeLists";

export function SearchResults({ results }) {
  const empty = results.routes.length === 0 && results.stations.length === 0;

  return (
    <section className="new-search-results">
      {results.routes.map((routeId) => (
        <Link key={routeId} href={`/route/${routeId}`}>
          <strong>{routeId} train</strong>
          <RouteBullet routeId={routeId} size={28} />
        </Link>
      ))}
      {results.stations.map((station) => (
        <StationItem key={station.id} station={station} />
      ))}
      {empty && <p>No stations found.</p>}
    </section>
  );
}

export function FavoritesView({
  available,
  favoriteGroups,
  favoriteStations,
  onManage,
  onRemoveStation,
  routeStatuses,
  stations,
}) {
  if (!favoriteGroups.length && !favoriteStations.length) {
    return (
      <section className="new-empty">
        <Star aria-hidden="true" />
        <h2>No favorites yet</h2>
        <p>Choose favorite lines, or tap the star on any station page.</p>
        <button type="button" onClick={onManage}>Choose favorite lines</button>
      </section>
    );
  }

  return (
    <div className="favorites-page">
      {favoriteGroups.length > 0 ? (
        <section className="favorite-lines" aria-labelledby="favorite-lines-title">
          <div className="favorites-section-heading">
            <h2 id="favorite-lines-title">Lines</h2>
            <button className="new-manage-favorites" type="button" onClick={onManage}>
              Manage
            </button>
          </div>
          <LineList
            groups={favoriteGroups}
            available={available}
            routeStatuses={routeStatuses}
          />
        </section>
      ) : (
        <button className="new-manage-favorites" type="button" onClick={onManage}>
          Add favorite lines
        </button>
      )}

      {favoriteStations.length > 0 && (
        <FavoriteStationList
          favorites={favoriteStations}
          stations={stations}
          onRemove={onRemoveStation}
        />
      )}
    </div>
  );
}

export function NearbyView({ nearby, location, locationMessage, onLocate }) {
  return (
    <section className="new-nearby">
      <div className="new-nearby-intro">
        <h2>Stations around you</h2>
        <p>Use your current location to find the closest subway entrances.</p>
      </div>
      <button className="new-location-button" type="button" onClick={onLocate}>
        {location ? "Refresh nearby stations" : "Find stations near me"}
      </button>
      {locationMessage && <p role="status">{locationMessage}</p>}
      {nearby.length > 0 && (
        <div className="new-nearby-results">
          {nearby.map((station) => (
            <StationItem key={station.id} station={station} distance={station.distance} />
          ))}
        </div>
      )}
    </section>
  );
}
