// ==========================================
// Position-based Sorting Utilities
// ==========================================
// Uses float-based position indexing for efficient ordering.
// When inserting between two items, takes the midpoint.
// Re-normalizes when precision gets too low.

const POSITION_GAP = 1000;
const MIN_GAP = 0.001;

interface Positionable {
  position: number;
}

/**
 * Calculate a new position at the end of the list
 */
export function getEndPosition(items: Positionable[]): number {
  if (items.length === 0) return POSITION_GAP;
  const maxPosition = Math.max(...items.map((item) => item.position));
  return maxPosition + POSITION_GAP;
}

/**
 * Calculate a position between two items
 */
export function getPositionBetween(
  before: number | null,
  after: number | null
): number {
  if (before === null && after === null) return POSITION_GAP;
  if (before === null) return (after as number) / 2;
  if (after === null) return before + POSITION_GAP;
  return (before + after) / 2;
}

/**
 * Calculate new position when inserting at a specific index
 */
export function getPositionAtIndex(
  sortedItems: Positionable[],
  targetIndex: number
): number {
  if (sortedItems.length === 0) return POSITION_GAP;

  // Inserting at the beginning
  if (targetIndex === 0) {
    return sortedItems[0].position / 2;
  }

  // Inserting at the end
  if (targetIndex >= sortedItems.length) {
    return sortedItems[sortedItems.length - 1].position + POSITION_GAP;
  }

  // Inserting between two items
  const before = sortedItems[targetIndex - 1].position;
  const after = sortedItems[targetIndex].position;
  return getPositionBetween(before, after);
}

/**
 * Check if positions need normalization (gap too small)
 */
export function needsNormalization(items: Positionable[]): boolean {
  if (items.length < 2) return false;
  const sorted = [...items].sort((a, b) => a.position - b.position);

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].position - sorted[i - 1].position < MIN_GAP) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize all positions with even spacing
 */
export function normalizePositions<T extends Positionable>(
  items: T[]
): T[] {
  const sorted = [...items].sort((a, b) => a.position - b.position);
  return sorted.map((item, index) => ({
    ...item,
    position: (index + 1) * POSITION_GAP,
  }));
}

/**
 * Sort items by position
 */
export function sortByPosition<T extends Positionable>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position);
}
