/**
 * Complementary color palettes for charts.
 * Each palette is a harmonious set; one palette is chosen per chart so bars complement each other.
 */
const COMPLEMENTARY_PALETTES: readonly string[][] = [
  // Cool blues & teals
  ["#0ea5e9", "#06b6d4", "#14b8a6", "#0d9488", "#2dd4bf", "#5eead4"],
  // Warm amber & coral
  ["#f59e0b", "#ea580c", "#ef4444", "#f97316", "#fbbf24", "#fcd34d"],
  // Greens (emerald to lime)
  ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#5eead4"],
  // Violet & indigo
  ["#6366f1", "#8b5cf6", "#a78bfa", "#7c3aed", "#6d28d9", "#5b21b6"],
  // Slate & blue-gray
  ["#475569", "#64748b", "#3b82f6", "#0ea5e9", "#38bdf8", "#7dd3fc"],
  // Earth (warm neutrals + accent)
  ["#78716c", "#a8a29e", "#d97706", "#b45309", "#92400e", "#78350f"],
  // Rose & pink
  ["#e11d48", "#f43f5e", "#fb7185", "#be123c", "#9f1239", "#881337"],
  // Cyan & blue
  ["#0891b2", "#0e7490", "#2563eb", "#1d4ed8", "#3b82f6", "#60a5fa"],
];

/** Fallback when no seed: single harmonious palette */
export const CHART_COLORS = COMPLEMENTARY_PALETTES[0];

/** Simple string hash for seeding */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Get palette for a chart. One complementary palette per chart (by seed) so colors work together.
 */
function getPaletteForChart(seed: string): string[] {
  const i = hashString(seed) % COMPLEMENTARY_PALETTES.length;
  return [...COMPLEMENTARY_PALETTES[i]];
}

/**
 * Get color for a series. Uses one complementary palette per chart (seed = title)
 * so bars in the same graph have colors that complement each other.
 */
export function getChartColor(index: number, explicitColor?: string, seed?: string): string {
  if (explicitColor) return explicitColor;
  const palette = seed ? getPaletteForChart(seed) : [...CHART_COLORS];
  return palette[index % palette.length];
}
