export const PRACTICE_MOSAIC_ROWS = 5;
export const PRACTICE_MOSAIC_TARGET_CELL_REM = 14.4;

export function getPracticeMosaicColumnCount(
  width,
  gap = 1,
  rootFontSize = 16
) {
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const safeGap = Number.isFinite(gap) ? Math.max(0, gap) : 0;
  const safeRootFontSize = Number.isFinite(rootFontSize)
    ? Math.max(1, rootFontSize)
    : 16;
  const targetCellSize = PRACTICE_MOSAIC_TARGET_CELL_REM * safeRootFontSize;

  return Math.max(
    2,
    Math.round((safeWidth + safeGap) / (targetCellSize + safeGap))
  );
}

export function getPracticeMosaicSlotCount(columnCount) {
  return Math.max(2, Math.round(columnCount)) * PRACTICE_MOSAIC_ROWS;
}
