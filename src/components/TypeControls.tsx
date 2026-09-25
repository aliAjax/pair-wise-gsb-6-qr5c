import {SlidersHorizontal, Undo2, X} from 'lucide-react';
import {FONTS, TypeStyleParams, overriddenKeys, Pair} from '../types';

type EditorMode =
  | {kind: 'pairing'; pair: Pair; boundStyleName: string | null}
  | {kind: 'style'; styleName: string; usedByCount: number};

interface TypeControlsProps {
  /** What the controls are currently writing to. */
  mode: EditorMode;
  values: TypeStyleParams;
  onChange: <K extends keyof TypeStyleParams>(key: K, value: TypeStyleParams[K]) => void;
  onResetOverrides: () => void;
  onExitStyleMode: () => void;
}

/** The six type controls. In pairing mode they write local overrides; in
 *  style mode they edit the named style and sync to every pairing using it. */
export function TypeControls({mode, values, onChange, onResetOverrides, onExitStyleMode}: TypeControlsProps) {
  const overridden = mode.kind === 'pairing' ? new Set(overriddenKeys(mode.pair)) : new Set<string>();

  const mark = (key: keyof TypeStyleParams) =>
    overridden.has(key) ? <i className="ovr-dot" title="Customized for this pairing" /> : null;

  return (
    <div className="controls">
      <div className="control-head">
        <div>
          <span>{mode.kind === 'style' ? 'STYLE EDITOR' : 'TYPE CONTROLS'}</span>
          <h3>{mode.kind === 'style' ? `Editing “${mode.styleName}”` : 'Fine tune your pairing'}</h3>
          {mode.kind === 'style' ? (
            <p className="control-note">
              Changes sync live to {mode.usedByCount} pairing{mode.usedByCount === 1 ? '' : 's'} using this style.
            </p>
          ) : (
            <p className="control-note">
              Based on <b>{mode.boundStyleName ?? 'Workspace default'}</b>
              {overridden.size > 0
                ? ` · ${overridden.size} local tweak${overridden.size === 1 ? '' : 's'} (style untouched)`
                : ' · no local tweaks'}
            </p>
          )}
        </div>
        {mode.kind === 'style' ? (
          <button className="done-editing" onClick={onExitStyleMode}>
            <X size={14} /> Done
          </button>
        ) : (
          <div className="control-head-actions">
            {overridden.size > 0 && (
              <button className="reset-ovr" onClick={onResetOverrides} title="Back to the bound style">
                <Undo2 size={13} /> Reset tweaks
              </button>
            )}
            <SlidersHorizontal size={17} />
          </div>
        )}
      </div>

      <div className="font-row">
        <label>
          Heading font {mark('headingFont')}
          <select value={values.headingFont} onChange={e => onChange('headingFont', e.target.value)}>
            {FONTS.map(f => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label>
          Body font {mark('bodyFont')}
          <select value={values.bodyFont} onChange={e => onChange('bodyFont', e.target.value)}>
            {FONTS.map(f => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="range-row">
        <label>
          Size {mark('size')} <b>{values.size}px</b>
          <input type="range" min="28" max="76" value={values.size}
            onChange={e => onChange('size', Number(e.target.value))} />
        </label>
        <label>
          Weight {mark('weight')} <b>{values.weight}</b>
          <input type="range" min="300" max="800" step="100" value={values.weight}
            onChange={e => onChange('weight', Number(e.target.value))} />
        </label>
      </div>

      <div className="range-row">
        <label>
          Line height {mark('leading')} <b>{values.leading.toFixed(2)}</b>
          <input type="range" min="1" max="1.8" step=".05" value={values.leading}
            onChange={e => onChange('leading', Number(e.target.value))} />
        </label>
        <label>
          Letter spacing {mark('tracking')} <b>{values.tracking}px</b>
          <input type="range" min="-1" max="3" step=".5" value={values.tracking}
            onChange={e => onChange('tracking', Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
}
