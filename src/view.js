// The foundation remains at the same screen point, even while zooming.
export function cameraFor(view, bounds, top) {
  const anchorY = view.h - 70;
  const halfWidth = Math.max(220, Math.abs(bounds.minX), Math.abs(bounds.maxX)) + 80;
  const scale = Math.min(1.25, view.w / (2 * halfWidth), (anchorY - 55) / Math.max(1, -top));
  return { x: 0, y: (view.h / 2 - anchorY) / scale, scale };
}
export function clampAim(x, width, scale, preview) {
  const half = width / (2 * scale), margin = 12 / scale;
  const low = -half - preview.bounds.min.x + margin;
  const high = half - preview.bounds.max.x - margin;
  return low > high ? 0 : Math.max(low, Math.min(high, x));
}
