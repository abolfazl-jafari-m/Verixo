import { closestCorners, pointerWithin, type CollisionDetection } from "@dnd-kit/core";
import { isInsideViewport } from "./horizontal-scroll";

export function boardCollisions(
  args: Parameters<CollisionDetection>[0],
  viewport: DOMRect | undefined,
) {
  // Only keyboard drags use proximity. A pointer outside the board or between
  // columns must not commit a drop to a nearby, possibly off-screen column.
  if (!args.pointerCoordinates) return closestCorners(args);
  if (!viewport || !isInsideViewport(args.pointerCoordinates, viewport)) return [];
  return pointerWithin(args);
}
