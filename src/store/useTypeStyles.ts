import {useEffect, useState} from 'react';
import {TypeStyle, TypeStyleParams} from '../types';

const STORAGE_KEY = 'type-styles';

const seedStyles: TypeStyle[] = [
  {
    id: 1,
    name: 'Editorial serif',
    headingFont: 'Fraunces',
    bodyFont: 'DM Sans',
    size: 46,
    weight: 600,
    leading: 1.25,
    tracking: 0,
  },
  {
    id: 2,
    name: 'Grotesk punch',
    headingFont: 'Space Grotesk',
    bodyFont: 'IBM Plex Sans',
    size: 52,
    weight: 700,
    leading: 1.15,
    tracking: -0.5,
  },
  {
    id: 3,
    name: 'Quiet reader',
    headingFont: 'Newsreader',
    bodyFont: 'Newsreader',
    size: 38,
    weight: 500,
    leading: 1.5,
    tracking: 0.5,
  },
];

function load(): TypeStyle[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
    if (Array.isArray(raw) && raw.length) return raw;
  } catch {
    /* fall through to seed */
  }
  return seedStyles;
}

/** The style library: named, reusable type styles, persisted to the archive. */
export function useTypeStyles() {
  const [styles, setStyles] = useState<TypeStyle[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
  }, [styles]);

  const createStyle = (name: string, params: TypeStyleParams): TypeStyle => {
    const style: TypeStyle = {id: Date.now(), name, ...params};
    setStyles(ss => [...ss, style]);
    return style;
  };

  /** Editing a style here is what propagates to every pairing bound to it. */
  const updateStyle = (id: number, patch: Partial<TypeStyleParams>) =>
    setStyles(ss => ss.map(s => (s.id === id ? {...s, ...patch} : s)));

  const removeStyle = (id: number) =>
    setStyles(ss => ss.filter(s => s.id !== id));

  return {styles, createStyle, updateStyle, removeStyle};
}
