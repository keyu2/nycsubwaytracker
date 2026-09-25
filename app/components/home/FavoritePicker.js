import RouteBullet from "../RouteBullet";
import { ROUTE_GROUPS } from "./config";

export default function FavoritePicker({ available, favorites, onToggle, onClose }) {
  return (
    <div
      className="new-picker-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="new-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorite-picker-title"
      >
        <header>
          <div>
            <h2 id="favorite-picker-title">Favorite lines</h2>
            <p>Select the lines you want to see first.</p>
          </div>
          <button type="button" aria-label="Close favorite line picker" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="new-picker-grid">
          {ROUTE_GROUPS.map((group) => {
            const routes = group.filter((id) => available.has(id));
            if (!routes.length) return null;
            return (
              <div className="new-picker-group" key={group.join("-")}>
                {routes.map((routeId) => {
                  const selected = favorites.includes(routeId);
                  return (
                    <button
                      type="button"
                      className={selected ? "selected" : ""}
                      aria-label={`${selected ? "Remove" : "Add"} ${routeId} train from favorites`}
                      aria-pressed={selected}
                      onClick={() => onToggle(routeId)}
                      key={routeId}
                    >
                      <RouteBullet routeId={routeId} size={42} />
                      <span className={selected ? "remove" : "add"} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
