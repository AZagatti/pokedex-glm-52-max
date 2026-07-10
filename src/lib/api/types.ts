/**
 * Pokémon type → color mapping.
 * Colors are tuned for both light and dark mode, used for type badges,
 * card gradients, and detail page theming.
 */

export interface TypeInfo {
  /** Primary color for badges and gradients. */
  color: string;
  /** Soft background tint (for badges on light surfaces). */
  tint: string;
  /** Emoji glyph as a lightweight icon. */
  icon: string;
}

export const TYPE_COLORS: Record<string, TypeInfo> = {
  bug: { color: "#90c12c", icon: "🐛", tint: "#afd560" },
  dark: { color: "#5a5366", icon: "🌙", tint: "#7d7589" },
  dragon: { color: "#0b6dc3", icon: "🐉", tint: "#4a90d4" },
  electric: { color: "#f4d23c", icon: "⚡", tint: "#fbe07d" },
  fairy: { color: "#ec8fe6", icon: "✨", tint: "#f2adf0" },
  fighting: { color: "#ce4069", icon: "🥊", tint: "#dd6d8c" },
  fire: { color: "#ff9d55", icon: "🔥", tint: "#ffb787" },
  flying: { color: "#8fa8dd", icon: "🪽", tint: "#aec4ed" },
  ghost: { color: "#5269ac", icon: "👻", tint: "#7d92c4" },
  grass: { color: "#63bc5a", icon: "🌿", tint: "#8fd889" },
  ground: { color: "#d97746", icon: "⛰️", tint: "#e29a73" },
  ice: { color: "#73cec0", icon: "❄️", tint: "#a3ddd3" },
  normal: { color: "#9099a1", icon: "⚪", tint: "#a8acb1" },
  poison: { color: "#ab6ac8", icon: "☠️", tint: "#c394d8" },
  psychic: { color: "#f97176", icon: "🔮", tint: "#fb9a9e" },
  rock: { color: "#c5b78c", icon: "🪨", tint: "#d6cbab" },
  steel: { color: "#5a8ea1", icon: "⚙️", tint: "#82aab8" },
  water: { color: "#5090d6", icon: "💧", tint: "#83b8e8" },
};

/** Get type info, falling back to normal for unknown types. */
export function getTypeInfo(type: string): TypeInfo {
  return TYPE_COLORS[type.toLowerCase()] ?? TYPE_COLORS.normal;
}

/** All 18 type names, sorted alphabetically for the filter UI. */
export const ALL_TYPES = Object.keys(TYPE_COLORS).toSorted();

/**
 * Generate a type-colored gradient for a card background.
 * For dual-type Pokémon, blends the two type colors.
 */
export function typeGradient(types: string[]): string {
  const colors = types.length > 0 ? types : ["normal"];
  const [a, b] = [
    getTypeInfo(colors[0]).color,
    getTypeInfo(colors[1] ?? colors[0]).color,
  ];
  return `linear-gradient(135deg, ${a}0d 0%, ${b}14 100%)`;
}
