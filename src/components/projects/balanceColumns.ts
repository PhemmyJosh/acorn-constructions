/**
 * Distributes tiles of known height into N columns of near-equal total height.
 *
 * This is the balanced-partition problem. Plain "add each tile to the shortest
 * column so far" is the obvious approach and is what most masonry code does,
 * but it commits early and overshoots on the last few tiles — on this gallery
 * it left a 471px gap between the tallest and shortest column.
 *
 * So: longest-processing-time-first (place the tallest tiles while there is
 * still room to compensate), then a short local-search pass that moves or swaps
 * single tiles while that narrows the gap. Both steps are deterministic, with
 * ties broken by index, so the server and the client always agree.
 */

/** Local search is bounded so a pathological input cannot spin. */
const MAX_REFINEMENT_PASSES = 200;

function totals(columns: number[][], heights: number[]): number[] {
  return columns.map((column) =>
    column.reduce((sum, index) => sum + heights[index], 0)
  );
}

function spread(sums: number[]): number {
  return Math.max(...sums) - Math.min(...sums);
}

export function balanceColumns(
  heights: number[],
  columnCount: number
): number[][] {
  const columns: number[][] = Array.from({ length: columnCount }, () => []);
  if (columnCount <= 1) {
    return [heights.map((_, index) => index)];
  }

  // --- longest first, into whichever column is currently shortest
  const order = heights
    .map((height, index) => ({ height, index }))
    .sort((a, b) => b.height - a.height || a.index - b.index);

  const sums = new Array<number>(columnCount).fill(0);
  for (const { height, index } of order) {
    let target = 0;
    for (let c = 1; c < columnCount; c++) {
      if (sums[c] < sums[target]) target = c;
    }
    columns[target].push(index);
    sums[target] += height;
  }

  // --- local search: move or swap one tile at a time while it helps
  for (let pass = 0; pass < MAX_REFINEMENT_PASSES; pass++) {
    const current = totals(columns, heights);
    const before = spread(current);
    if (before === 0) break;

    let tallest = 0;
    let shortest = 0;
    for (let c = 1; c < columnCount; c++) {
      if (current[c] > current[tallest]) tallest = c;
      if (current[c] < current[shortest]) shortest = c;
    }

    let improved = false;

    // Move a single tile down from the tallest column.
    for (const index of columns[tallest]) {
      const candidate = current.slice();
      candidate[tallest] -= heights[index];
      candidate[shortest] += heights[index];
      if (spread(candidate) < before) {
        columns[tallest] = columns[tallest].filter((i) => i !== index);
        columns[shortest].push(index);
        improved = true;
        break;
      }
    }

    // Otherwise trade a tall tile for a shorter one.
    if (!improved) {
      outer: for (const tallIndex of columns[tallest]) {
        for (const shortIndex of columns[shortest]) {
          const delta = heights[tallIndex] - heights[shortIndex];
          if (delta <= 0) continue;
          const candidate = current.slice();
          candidate[tallest] -= delta;
          candidate[shortest] += delta;
          if (spread(candidate) < before) {
            columns[tallest] = columns[tallest].map((i) =>
              i === tallIndex ? shortIndex : i
            );
            columns[shortest] = columns[shortest].map((i) =>
              i === shortIndex ? tallIndex : i
            );
            improved = true;
            break outer;
          }
        }
      }
    }

    if (!improved) break;
  }

  // Read top-to-bottom in the original order within each column, so the
  // client's chosen ordering is still broadly visible.
  return columns.map((column) => column.sort((a, b) => a - b));
}
