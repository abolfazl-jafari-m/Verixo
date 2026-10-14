import type { Coordinates } from "@dnd-kit/utilities";

type Viewport = Pick<DOMRect, "left" | "right" | "top" | "bottom">;

export function isInsideViewport(point: Coordinates, viewport: Viewport) {
  return (
    point.x >= viewport.left &&
    point.x <= viewport.right &&
    point.y >= viewport.top &&
    point.y <= viewport.bottom
  );
}

// Physical direction: negative means toward the left edge, in either locale.
export function horizontalScrollSpeed(point: Coordinates, viewport: Viewport) {
  if (!isInsideViewport(point, viewport)) return 0;
  const zone = Math.min(72, (viewport.right - viewport.left) / 4);
  if (zone <= 0) return 0;
  const left = Math.max(0, 1 - (point.x - viewport.left) / zone);
  const right = Math.max(0, 1 - (viewport.right - point.x) / zone);
  return 600 * (right ** 2 - left ** 2);
}

export function horizontalScrollPosition(
  position: number,
  delta: number,
  extent: number,
  rtl: boolean,
) {
  // Modern browsers expose RTL scrollLeft in [-extent, 0], LTR in [0, extent].
  const limit = Math.max(0, extent);
  return Math.max(rtl ? -limit : 0, Math.min(rtl ? 0 : limit, position + delta));
}
