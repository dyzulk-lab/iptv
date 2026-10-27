import { useState, useCallback } from "react";
import type { FocusPosition, FocusDirection, NavSection } from "@/types/tv-nav";

interface UseSpatialFocusOptions {
  initialSection?: NavSection;
  gridColumns?: number;
  totalItems?: number;
}

/** Hook to manage D-Pad spatial focus coordinates across TV UI sections */
export function useSpatialFocus(options: UseSpatialFocusOptions = {}) {
  const {
    initialSection = "channel-grid",
    gridColumns = 4,
    totalItems = 0,
  } = options;

  const [focus, setFocus] = useState<FocusPosition>({
    section: initialSection,
    row: 0,
    col: 0,
  });

  const moveFocus = useCallback(
    (direction: FocusDirection) => {
      setFocus((prev) => {
        const maxRow = Math.max(0, Math.ceil(totalItems / gridColumns) - 1);
        const maxCol = gridColumns - 1;

        switch (direction) {
          case "up":
            return { ...prev, row: Math.max(0, prev.row - 1) };
          case "down":
            return { ...prev, row: Math.min(maxRow, prev.row + 1) };
          case "left":
            return { ...prev, col: Math.max(0, prev.col - 1) };
          case "right":
            return { ...prev, col: Math.min(maxCol, prev.col + 1) };
          default:
            return prev;
        }
      });
    },
    [gridColumns, totalItems]
  );

  const setSection = useCallback((section: NavSection) => {
    setFocus((prev) => ({ ...prev, section, row: 0, col: 0 }));
  }, []);

  const focusIndex = focus.row * gridColumns + focus.col;

  return { focus, focusIndex, moveFocus, setSection };
}
