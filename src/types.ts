/** The six tunable parameters that make up a reusable type style. */
export interface TypeStyleParams {
  headingFont: string;
  bodyFont: string;
  size: number;
  weight: number;
  leading: number;
  tracking: number;
}

/** A named, reusable style in the library. */
export interface TypeStyle extends TypeStyleParams {
  id: number;
  name: string;
}

/** A saved pairing. It binds to a style (or the workspace default when
 *  styleId is null) and may carry field-level overrides on top of it. */
export interface Pair {
  id: number;
  title: string;
  heading: string;
  body: string;
  category: string;
  favorite: boolean;
  styleId: number | null;
  overrides: Partial<TypeStyleParams>;
}

export const FONTS = [
  'Fraunces',
  'DM Sans',
  'Space Grotesk',
  'Newsreader',
  'IBM Plex Sans',
  'Playfair Display',
];

/** Fallback used when a pairing is not bound to any named style. */
export const DEFAULT_PARAMS: TypeStyleParams = {
  headingFont: 'Fraunces',
  bodyFont: 'DM Sans',
  size: 46,
  weight: 600,
  leading: 1.25,
  tracking: 0,
};

export const PARAM_KEYS = [
  'headingFont',
  'bodyFont',
  'size',
  'weight',
  'leading',
  'tracking',
] as const satisfies readonly (keyof TypeStyleParams)[];

/** Strip a style down to just its tunable params (drops id/name). */
export function paramsOf(style: TypeStyle): TypeStyleParams {
  const {headingFont, bodyFont, size, weight, leading, tracking} = style;
  return {headingFont, bodyFont, size, weight, leading, tracking};
}

/** Resolve what a pairing actually renders with: default ← bound style ←
 *  local overrides. Always returns a complete param set, so a pairing is
 *  never left without values. */
export function effectiveParams(
  pair: Pair,
  styles: TypeStyle[],
): TypeStyleParams {
  const bound = styles.find(s => s.id === pair.styleId);
  return {
    ...DEFAULT_PARAMS,
    ...(bound ? paramsOf(bound) : {}),
    ...pair.overrides,
  };
}

export function overriddenKeys(pair: Pair): (keyof TypeStyleParams)[] {
  return PARAM_KEYS.filter(k => pair.overrides[k] !== undefined);
}
