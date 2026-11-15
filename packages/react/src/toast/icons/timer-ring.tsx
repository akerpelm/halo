export function TimerRing({ duration, restartKey }: { duration: number; restartKey: number }) {
  return (
    <svg className="halo-timer-ring" viewBox="0 0 26 26" aria-hidden focusable={false}>
      <circle className="halo-timer-track" cx="13" cy="13" r="11.5" pathLength={1} />
      <circle key={restartKey} className="halo-timer-progress" cx="13" cy="13" r="11.5" pathLength={1} style={{ animationDuration: `${duration}ms` }} />
    </svg>
  );
}
