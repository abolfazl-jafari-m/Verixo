"use client";

import { useEffect, useRef, type RefObject } from "react";
import { getEventCoordinates } from "@dnd-kit/utilities";
import { horizontalScrollPosition, horizontalScrollSpeed } from "./horizontal-scroll";

export function useBoardAutoScroll(boardRef: RefObject<HTMLDivElement | null>) {
  const cleanup = useRef<(() => void) | null>(null);

  function stop() {
    cleanup.current?.();
    cleanup.current = null;
  }

  useEffect(() => () => cleanup.current?.(), []);

  function start(event: Event) {
    stop();
    const board = boardRef.current;
    let point = getEventCoordinates(event);
    // KeyboardSensor owns its own scroll-into-view behavior.
    if (!board || !point) return;
    const rtl = getComputedStyle(board).direction === "rtl";
    let viewport = board.getBoundingClientRect();
    let position = board.scrollLeft;
    let frame: number | null = null;
    let previousTime: number | null = null;

    function tick(time: number) {
      frame = null;
      if (!board || !point) return;
      const speed = horizontalScrollSpeed(point, viewport);
      const elapsed = previousTime === null ? 16 : Math.min(32, time - previousTime);
      const next = horizontalScrollPosition(
        position,
        (speed * elapsed) / 1000,
        board.scrollWidth - board.clientWidth,
        rtl,
      );
      if (!speed || next === position) {
        previousTime = null;
        return;
      }
      // Retain fractional progress even when the browser rounds scrollLeft.
      position = next;
      board.scrollLeft = next;
      previousTime = time;
      frame = requestAnimationFrame(tick);
    }

    function schedule() {
      if (frame === null) frame = requestAnimationFrame(tick);
    }

    function move(event: Event) {
      point = getEventCoordinates(event);
      schedule();
    }

    function refreshViewport(event: Event) {
      // Board/column scrolling changes target rects, not the viewport itself.
      // dnd-kit subscribes to these scroll offsets for collision detection.
      if (event.target instanceof Node && board?.contains(event.target)) return;
      if (board) viewport = board.getBoundingClientRect();
      schedule();
    }

    const moveEvent = event.type.startsWith("touch") ? "touchmove" : "mousemove";
    document.addEventListener(moveEvent, move, { passive: true });
    window.addEventListener("scroll", refreshViewport, true);
    window.addEventListener("resize", refreshViewport);
    cleanup.current = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      document.removeEventListener(moveEvent, move);
      window.removeEventListener("scroll", refreshViewport, true);
      window.removeEventListener("resize", refreshViewport);
    };
    schedule();
  }

  return { start, stop };
}
