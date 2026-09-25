import { notFound } from "next/navigation";
import TransitPage from "../../components/TransitPage";

const SECTION_CONFIG = {
  subway: {
    defaultTab: "subway",
    tabs: ["subway", "favorites", "nearby"],
  },
  status: {
    defaultTab: "subway",
    tabs: ["subway", "favorites"],
  },
};

export default async function Page({ params, searchParams }) {
  const { section, tab: tabSegments = [] } = await params;
  const { line } = await searchParams;

  if (!Object.hasOwn(SECTION_CONFIG, section) || tabSegments.length > 1) {
    notFound();
  }

  const config = SECTION_CONFIG[section];
  const activeTab = tabSegments[0] ?? config.defaultTab;

  if (!config.tabs.includes(activeTab)) {
    notFound();
  }

  const requestedRouteId = typeof line === "string" ? line : undefined;

  return (
    <TransitPage
      view={section}
      section={activeTab}
      requestedRouteId={requestedRouteId}
    />
  );
}
