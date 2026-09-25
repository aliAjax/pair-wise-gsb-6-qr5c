import {Check, Pencil, Plus, Trash2} from 'lucide-react';
import {Pair, TypeStyle} from '../types';

interface StyleLibraryPanelProps {
  styles: TypeStyle[];
  pairs: Pair[];
  currentPair: Pair;
  editingStyleId: number | null;
  onSaveCurrent: () => void;
  onApply: (styleId: number) => void;
  onEdit: (styleId: number) => void;
  onDelete: (style: TypeStyle) => void;
}

/** The reusable style library: save the current params as a named style,
 *  apply a style to the selected pairing, edit or remove styles. */
export function StyleLibraryPanel({
  styles,
  pairs,
  currentPair,
  editingStyleId,
  onSaveCurrent,
  onApply,
  onEdit,
  onDelete,
}: StyleLibraryPanelProps) {
  const usedBy = (id: number) => pairs.filter(p => p.styleId === id).length;

  return (
    <div className="style-lib">
      <div className="style-lib-head">
        <div>
          <span>STYLE LIBRARY</span>
          <h3>Reusable type styles</h3>
        </div>
        <button className="save-style" onClick={onSaveCurrent}>
          <Plus size={14} /> Save current as style
        </button>
      </div>

      <div className="style-list">
        {styles.map(s => {
          const count = usedBy(s.id);
          const applied = currentPair.styleId === s.id;
          const editing = editingStyleId === s.id;
          return (
            <div key={s.id} className={`style-row${applied ? ' applied' : ''}${editing ? ' editing' : ''}`}>
              <div className="style-info">
                <b style={{fontFamily: s.headingFont}}>{s.name}</b>
                <small>
                  {s.headingFont} / {s.bodyFont} · {s.size}px · w{s.weight} · {s.leading.toFixed(2)}
                </small>
                <small className="usage">
                  {count === 0 ? 'Not in use' : `Used by ${count} pairing${count === 1 ? '' : 's'}`}
                </small>
              </div>
              <div className="style-actions">
                {applied ? (
                  <span className="applied-tag">
                    <Check size={12} /> Applied
                  </span>
                ) : (
                  <button onClick={() => onApply(s.id)}>Apply</button>
                )}
                <button onClick={() => onEdit(s.id)} title="Edit style (syncs to all pairings using it)">
                  <Pencil size={13} /> {editing ? 'Editing…' : 'Edit'}
                </button>
                <button className="danger" onClick={() => onDelete(s)} title="Remove style">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
        {styles.length === 0 && (
          <p className="style-empty">No named styles yet — tune a pairing and save it here.</p>
        )}
      </div>
    </div>
  );
}
