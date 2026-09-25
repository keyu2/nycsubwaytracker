export function realtimePathDiffersFromStatic(realtimeStopTimes, staticStopTimes) {
  if (!realtimeStopTimes.length || !staticStopTimes.length) return false;

  const staticBySequence = new Map(
    staticStopTimes.map((stopTime) => [Number(stopTime.stop_sequence), stopTime.stop_id])
  );
  for (const stopTime of realtimeStopTimes) {
    if (stopTime.stopSequence == null) continue;
    const staticStopId = staticBySequence.get(Number(stopTime.stopSequence));
    if (staticStopId && staticStopId !== stopTime.stopId) return true;
  }

  let staticIndex = -1;
  for (const realtimeStopTime of realtimeStopTimes) {
    const nextIndex = staticStopTimes.findIndex(
      (staticStopTime, index) =>
        index > staticIndex && staticStopTime.stop_id === realtimeStopTime.stopId
    );
    if (nextIndex === -1) return true;
    staticIndex = nextIndex;
  }
  return false;
}

export function trimStaticPathToRealtimeTerminal(realtimeStopTimes, staticStopTimes) {
  const terminalStopId = [...realtimeStopTimes]
    .reverse()
    .find((stopTime) => stopTime.stopId)?.stopId;
  if (!terminalStopId) return staticStopTimes;

  const terminalIndex = staticStopTimes.findLastIndex(
    (stopTime) => stopTime.stop_id === terminalStopId
  );
  if (terminalIndex < 0 || terminalIndex === staticStopTimes.length - 1) return staticStopTimes;

  return staticStopTimes.slice(0, terminalIndex + 1);
}

export function tripOriginStopId(staticStopTimes, realtimeStopTimes) {
  return staticStopTimes[0]?.stop_id || realtimeStopTimes[0]?.stopId || "";
}
