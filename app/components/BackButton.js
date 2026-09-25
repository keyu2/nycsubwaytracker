"use client";

export default function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="nav-button nav-button--back"
    >
      Back
    </button>
  );
}
