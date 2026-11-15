type FrameCallback = (now: number) => void;

const callbacks = new Set<FrameCallback>();
let frameId = 0;

function tick(now: number) {
  for (const callback of callbacks) callback(now);
  frameId = callbacks.size > 0 ? requestAnimationFrame(tick) : 0;
}

export function onFrame(callback: FrameCallback): () => void {
  callbacks.add(callback);
  if (frameId === 0 && typeof requestAnimationFrame !== 'undefined') frameId = requestAnimationFrame(tick);
  return () => {
    callbacks.delete(callback);
  };
}
