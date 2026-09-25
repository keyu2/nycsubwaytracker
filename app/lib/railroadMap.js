export function railroadMap(patterns) {
  const sorted = patterns.filter((p) => p.stops.length).toSorted((a, b) => b.stops.length - a.stops.length);
  const main = sorted[0]?.stops || [];
  const positions = new Map(main.map((s, i) => [s.id, i]));
  const branches = new Map();
  for (const pattern of sorted.slice(1)) {
    let stops = pattern.stops;
    const shared = stops.filter((s) => positions.has(s.id));
    if (shared.length >= 2 && positions.get(shared[0].id) > positions.get(shared.at(-1).id)) {
      stops = [...stops].reverse();
    } else if (shared.length === 1 && (
      (positions.get(shared[0].id) === main.length - 1 && stops[0].id === shared[0].id) ||
      (positions.get(shared[0].id) === 0 && stops.at(-1).id === shared[0].id)
    )) {
      stops = [...stops].reverse();
    }
    for (let i = 0; i < stops.length;) {
      if (positions.has(stops[i].id)) { i++; continue; }
      const start = i;
      while (i < stops.length && !positions.has(stops[i].id)) i++;
      const segment = stops.slice(start, i);
      const from = start > 0 ? stops[start - 1].id : null;
      const to = i < stops.length ? stops[i].id : null;
      // Express trips skip junction-area stops; retain the nearest known anchors.
      const key = segment.map((s) => s.id).join(":");
      const existing = branches.get(key);
      if (!existing) {
        branches.set(key, { id: key, from, to, stops: segment });
      } else {
        if (from && (!existing.from || positions.get(from) > positions.get(existing.from))) existing.from = from;
        if (to && (!existing.to || positions.get(to) < positions.get(existing.to))) existing.to = to;
      }
    }
  }
  return { main, branches: [...branches.values()] };
}
