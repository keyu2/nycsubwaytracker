"use client";

import AppTabs from "../components/AppTabs";
import { useSubwayPreferences } from "../lib/preferences";
import { useThemePreference } from "../lib/themePreference";

const APPEARANCE_OPTIONS = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];
const COUNTDOWN_OPTIONS = [
  { value: "minutes", label: "Minutes" },
  { value: "seconds", label: "Minutes + seconds" },
];
const DISPLAY_MODE_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "board", label: "Display board" },
];
const ALERT_LAYOUT_OPTIONS = [
  { value: "stacked", label: "Stacked" },
  { value: "columns", label: "Side by side" },
];
const LINE_SELECTION_OPTIONS = [
  { value: "overview", label: "Traditional" },
  { value: "focus", label: "Slider" },
];

function SegmentedSetting({ label, value, options, onChange }) {
  const settingId = `${label.toLowerCase().replaceAll(" ", "-")}-setting`;
  return (
    <section className="settings-row" aria-labelledby={settingId}>
      <div className="settings-row__copy">
        <h2 id={settingId}>{label}</h2>
      </div>
      <div className="settings-segmented" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className={value === option.value ? "active" : ""}
            onClick={() => onChange(option.value)}
            key={option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function SettingsClient() {
  const {
    showSeconds,
    lineView,
    stationView,
    boardAlertLayout,
    setShowSeconds,
    setLineView,
    setStationView,
    setBoardAlertLayout,
  } = useSubwayPreferences();
  const { theme, setTheme } = useThemePreference();

  return (
    <main className="new-app-shell settings-page">
      <div className="new-status-page">
        <AppTabs active="settings" />
        <header className="settings-header">
          <h1>Settings</h1>
        </header>

        <div className="settings-list">
          <SegmentedSetting
            label="Appearance"
            value={theme}
            onChange={setTheme}
            options={APPEARANCE_OPTIONS}
          />
          <SegmentedSetting
            label="Show"
            value={showSeconds ? "seconds" : "minutes"}
            onChange={(value) => setShowSeconds(value === "seconds")}
            options={COUNTDOWN_OPTIONS}
          />
          <div className="settings-preview" aria-label="Arrival countdown preview">
            <span>Example arrival</span>
            <strong>{showSeconds ? "4m 32s" : "4 min"}</strong>
          </div>

          <SegmentedSetting
            label="Display mode"
            value={stationView}
            onChange={setStationView}
            options={DISPLAY_MODE_OPTIONS}
          />

          {stationView === "board" && (
            <SegmentedSetting
              label="Service alerts"
              value={boardAlertLayout}
              onChange={setBoardAlertLayout}
              options={ALERT_LAYOUT_OPTIONS}
            />
          )}

          <SegmentedSetting
            label="Line selection"
            value={lineView}
            onChange={setLineView}
            options={LINE_SELECTION_OPTIONS}
          />
        </div>
      </div>
    </main>
  );
}
