"use client";

import { useEffect, useState } from "react";

const ONE_SECOND = 1000;

function currentTimestamp() {
  return Math.floor(Date.now() / ONE_SECOND);
}

export function useLiveTimestamp(initialTimestamp) {
  const [timestamp, setTimestamp] = useState(() => (
    Number.isFinite(initialTimestamp) ? initialTimestamp : currentTimestamp()
  ));

  useEffect(() => {
    const timer = window.setInterval(() => setTimestamp(currentTimestamp()), ONE_SECOND);

    return () => window.clearInterval(timer);
  }, []);

  return timestamp;
}
