import {useEffect, useState} from 'react';
import {Pair, TypeStyleParams} from '../types';

const STORAGE_KEY = 'type-pairs';

const seedPairs: Pair[] = [
  {
    id: 1,
    title: 'Editorial calm',
    heading: 'A slower way to see',
    body: 'Good typography creates space for ideas to breathe. Pair a confident display face with a quiet, generous text face.',
    category: 'Editorial',
    favorite: true,
    styleId: 1,
    overrides: {},
  },
  {
    id: 2,
    title: 'Studio notes',
    heading: 'Make room for the unexpected',
    body: 'A thoughtful pairing can add rhythm to even the simplest interface. Try contrast in shape, not just size.',
    category: 'Portfolio',
    favorite: false,
    styleId: null,
    overrides: {},
  },
  {
    id: 3,
    title: 'Field guide',
    heading: 'Small details, lasting impressions',
    body: 'Typography is the voice of a page. Find a combination that feels clear, warm and distinctly yours.',
    category: 'Brand',
    favorite: false,
    styleId: null,
    overrides: {},
  },
];

/** Older archives stored pairs before styles existed — give them the
 *  default binding and an empty override set. */
function normalize(p: Pair): Pair {
  return {...p, styleId: p.styleId ?? null, overrides: p.overrides ?? {}};
}

function load(): Pair[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
    if (Array.isArray(raw) && raw.length) return raw.map(normalize);
  } catch {
    /* fall through to seed */
  }
  return seedPairs;
}

/** The pairings and their references into the style library. */
export function usePairings() {
  const [pairs, setPairs] = useState<Pair[]>(load);
  const [selectedId, setSelectedId] = useState<number>(pairs[0]?.id ?? 0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
  }, [pairs]);

  const addPair = (title: string): number => {
    const id = Date.now();
    setPairs(ps => [
      ...ps,
      {
        id,
        title,
        heading: 'Your new headline',
        body: 'Start with a sentence that lets your type pairing show its character.',
        category: 'Untitled',
        favorite: false,
        styleId: null,
        overrides: {},
      },
    ]);
    setSelectedId(id);
    return id;
  };

  const removePair = (id: number) => {
    setPairs(ps => {
      const next = ps.filter(p => p.id !== id);
      setSelectedId(sel => (sel === id ? (next[0]?.id ?? 0) : sel));
      return next;
    });
  };

  const toggleFavorite = (id: number) =>
    setPairs(ps => ps.map(p => (p.id === id ? {...p, favorite: !p.favorite} : p)));

  /** Bind a pairing to a style (null = workspace default) and drop any
   *  local tweaks, so "apply" means the pairing fully adopts the style. */
  const applyStyle = (pairId: number, styleId: number | null) =>
    setPairs(ps =>
      ps.map(p => (p.id === pairId ? {...p, styleId, overrides: {}} : p)),
    );

  /** Pairing-mode edit: touches only this pairing's overrides, never the
   *  style itself. */
  const setOverride = <K extends keyof TypeStyleParams>(
    pairId: number,
    key: K,
    value: TypeStyleParams[K],
  ) =>
    setPairs(ps =>
      ps.map(p =>
        p.id === pairId ? {...p, overrides: {...p.overrides, [key]: value}} : p,
      ),
    );

  const resetOverrides = (pairId: number) =>
    setPairs(ps => ps.map(p => (p.id === pairId ? {...p, overrides: {}} : p)));

  /** Re-point every pairing bound to `fromId` at another style, or at the
   *  workspace default when `toId` is null. Overrides travel with the
   *  pairing, so it always resolves to a complete param set. */
  const rebindStyle = (fromId: number, toId: number | null) =>
    setPairs(ps => ps.map(p => (p.styleId === fromId ? {...p, styleId: toId} : p)));

  return {
    pairs,
    selectedId,
    setSelectedId,
    addPair,
    removePair,
    toggleFavorite,
    applyStyle,
    setOverride,
    resetOverrides,
    rebindStyle,
  };
}
