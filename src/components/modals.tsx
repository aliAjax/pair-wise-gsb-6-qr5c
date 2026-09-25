import {useState} from 'react';
import {TypeStyle} from '../types';

function Backdrop({onClose, children}: {onClose: () => void; children: React.ReactNode}) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function NewPairingModal({onCreate, onClose}: {onCreate: (title: string) => void; onClose: () => void}) {
  const [title, setTitle] = useState('');
  return (
    <Backdrop onClose={onClose}>
      <h2>New pairing</h2>
      <label>
        Pairing name
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Quiet confidence" />
      </label>
      <div className="modal-actions">
        <button className="outline" onClick={onClose}>Cancel</button>
        <button className="primary" disabled={!title.trim()} onClick={() => onCreate(title.trim())}>Create pairing</button>
      </div>
    </Backdrop>
  );
}

export function SaveStyleModal({onSave, onClose}: {onSave: (name: string) => void; onClose: () => void}) {
  const [name, setName] = useState('');
  return (
    <Backdrop onClose={onClose}>
      <h2>Save as style</h2>
      <p className="modal-note">
        Stores the current heading/body fonts, size, weight, line height and letter spacing as a
        reusable named style.
      </p>
      <label>
        Style name
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hero display" />
      </label>
      <div className="modal-actions">
        <button className="outline" onClick={onClose}>Cancel</button>
        <button className="primary" disabled={!name.trim()} onClick={() => onSave(name.trim())}>Save style</button>
      </div>
    </Backdrop>
  );
}

/** Removing a style that pairings still use: each affected pairing must be
 *  re-bound to another style or restored to the workspace default — it can
 *  never be left without a resolved param set. */
export function DeleteStyleModal({
  style,
  affectedCount,
  others,
  onConfirm,
  onClose,
}: {
  style: TypeStyle;
  affectedCount: number;
  others: TypeStyle[];
  onConfirm: (replacementId: number | null) => void;
  onClose: () => void;
}) {
  const [choice, setChoice] = useState<string>('default');
  return (
    <Backdrop onClose={onClose}>
      <h2>Remove “{style.name}”?</h2>
      <p className="modal-note">
        {affectedCount} pairing{affectedCount === 1 ? '' : 's'} still use{affectedCount === 1 ? 's' : ''} this
        style. Choose what they should follow instead — a pairing can’t be left without a style source.
      </p>
      <div className="rebind-options">
        <label className={choice === 'default' ? 'rebind on' : 'rebind'}>
          <input type="radio" name="rebind" checked={choice === 'default'} onChange={() => setChoice('default')} />
          <span>
            <b>Restore workspace default</b>
            <small>Fraunces / DM Sans · 46px · w600 · 1.25</small>
          </span>
        </label>
        {others.map(o => (
          <label key={o.id} className={choice === String(o.id) ? 'rebind on' : 'rebind'}>
            <input type="radio" name="rebind" checked={choice === String(o.id)} onChange={() => setChoice(String(o.id))} />
            <span>
              <b>Re-bind to “{o.name}”</b>
              <small>
                {o.headingFont} / {o.bodyFont} · {o.size}px · w{o.weight} · {o.leading.toFixed(2)}
              </small>
            </span>
          </label>
        ))}
      </div>
      <div className="modal-actions">
        <button className="outline" onClick={onClose}>Cancel</button>
        <button
          className="primary"
          onClick={() => onConfirm(choice === 'default' ? null : Number(choice))}
        >
          Re-bind &amp; remove
        </button>
      </div>
    </Backdrop>
  );
}
