const BOROUGH_LABELS = {
  Bronx: "The Bronx",
  Brooklyn: "Brooklyn",
  Manhattan: "Manhattan",
  Queens: "Queens",
  "Staten Island": "Staten Island",
};

export function directionGroupLabel(originBorough, destinationBorough, direction) {
  const northbound = direction === "northbound";

  if (originBorough === "Manhattan") {
    if (northbound) {
      return destinationBorough === "Bronx" ? "Uptown / The Bronx" : "Uptown";
    }
    return destinationBorough === "Brooklyn" ? "Downtown / Brooklyn" : "Downtown";
  }

  if (originBorough === "Bronx") {
    if (destinationBorough === "Bronx") return "The Bronx";
    if (destinationBorough === "Brooklyn") return "Manhattan / Brooklyn";
    return BOROUGH_LABELS[destinationBorough] || (northbound ? "The Bronx" : "Manhattan");
  }

  if (originBorough === "Brooklyn") {
    if (destinationBorough === "Brooklyn") return "Brooklyn";
    if (destinationBorough === "Bronx") return "Manhattan / The Bronx";
    return BOROUGH_LABELS[destinationBorough] || (northbound ? "Manhattan" : "Brooklyn");
  }

  if (originBorough === "Queens") {
    return BOROUGH_LABELS[destinationBorough] || (northbound ? "Queens" : "Manhattan");
  }

  if (originBorough === "Staten Island") {
    return BOROUGH_LABELS[destinationBorough] || "Staten Island";
  }

  return BOROUGH_LABELS[destinationBorough] || (northbound ? "Uptown" : "Downtown");
}

export function disambiguateDirectionGroupLabels(groups) {
  const labelCounts = new Map();
  for (const group of groups) {
    labelCounts.set(group.label, (labelCounts.get(group.label) || 0) + 1);
  }

  return groups.map((group) => {
    if ((labelCounts.get(group.label) || 0) < 2) return group;
    const terminalNames = [...new Set(
      (group.options || []).map((option) => option.label).filter(Boolean)
    )];
    return {
      ...group,
      label: terminalNames.join(" / ") || group.label,
    };
  });
}
