import type { KeyboardCoordinateGetter } from "@dnd-kit/core";

// Move directly to the next physical column, including in RTL layouts.
export const columnKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { context, currentCoordinates },
) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.code)) return undefined;
  event.preventDefault();
  const { collisionRect, droppableRects } = context;
  if (!collisionRect) return undefined;
  const center = collisionRect.left + collisionRect.width / 2;
  // A column scrollbar can offset the card center slightly. Skip the current
  // column instead of treating that small offset as the next keyboard target.
  const threshold = collisionRect.width / 2;
  const candidates = [...droppableRects.values()].filter((rect) =>
    event.code === "ArrowRight"
      ? rect.left + rect.width / 2 > center + threshold
      : rect.left + rect.width / 2 < center - threshold,
  );
  candidates.sort(
    (a, b) => Math.abs(a.left + a.width / 2 - center) - Math.abs(b.left + b.width / 2 - center),
  );
  const next = candidates[0];
  return next
    ? { x: currentCoordinates.x + next.left + next.width / 2 - center, y: currentCoordinates.y }
    : undefined;
};
