import {useState} from 'react';
import {
  BookOpen,
  ChevronDown,
  Download,
  Grid3X3,
  Heart,
  Plus,
  Settings2,
  Star,
  Trash2,
  Type,
} from 'lucide-react';
import {TypeStyle, TypeStyleParams, effectiveParams, paramsOf} from './types';
import {useTypeStyles} from './store/useTypeStyles';
import {usePairings} from './store/usePairings';
import {TypeControls} from './components/TypeControls';
import {StyleLibraryPanel} from './components/StyleLibraryPanel';
import {DeleteStyleModal, NewPairingModal, SaveStyleModal} from './components/modals';

export default function App() {
  // Style library, pairing references and the editor are maintained
  // separately; App only coordinates the flows that cross between them.
  const {styles, createStyle, updateStyle, removeStyle} = useTypeStyles();
  const {
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
  } = usePairings();

  const [editingStyleId, setEditingStyleId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showSaveStyle, setShowSaveStyle] = useState(false);
  const [deletingStyle, setDeletingStyle] = useState<TypeStyle | null>(null);

  const current = pairs.find(p => p.id === selectedId) ?? pairs[0];
  const editingStyle = styles.find(s => s.id === editingStyleId) ?? null;

  // The editor writes either to the style being edited (syncing to every
  // pairing bound to it) or to the selected pairing's local overrides.
  const editorValues = editingStyle
    ? paramsOf(editingStyle)
    : current
      ? effectiveParams(current, styles)
      : null;

  const onParamChange = <K extends keyof TypeStyleParams>(key: K, value: TypeStyleParams[K]) => {
    if (editingStyle) updateStyle(editingStyle.id, {[key]: value});
    else if (current) setOverride(current.id, key, value);
  };

  const saveCurrentAsStyle = (name: string) => {
    if (!current || !editorValues) return;
    const style = createStyle(name, editorValues);
    applyStyle(current.id, style.id);
    setShowSaveStyle(false);
  };

  const requestDeleteStyle = (style: TypeStyle) => {
    if (pairs.some(p => p.styleId === style.id)) setDeletingStyle(style);
    else {
      removeStyle(style.id);
      if (editingStyleId === style.id) setEditingStyleId(null);
    }
  };

  const confirmDeleteStyle = (replacementId: number | null) => {
    if (!deletingStyle) return;
    rebindStyle(deletingStyle.id, replacementId);
    removeStyle(deletingStyle.id);
    if (editingStyleId === deletingStyle.id) setEditingStyleId(null);
    setDeletingStyle(null);
  };

  const exportCss = () => {
    if (!current || !editorValues) return;
    const v = editorValues;
    const css = `/* ${current.title} */\n.heading { font-family: '${v.headingFont}'; font-size: ${v.size}px; font-weight: ${v.weight}; }\n.body { font-family: '${v.bodyFont}'; line-height: ${v.leading}; letter-spacing: ${v.tracking}px; }`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([css], {type: 'text/css'}));
    a.download = 'type-pair.css';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="brand-mark"><Type size={18} /></div>
          <div><b>Type Pairer</b><small>FIND YOUR VOICE</small></div>
        </div>
        <div className="nav-section">
          <span>LIBRARY</span>
          <button className="nav active"><Grid3X3 size={16} />All pairings <b>{pairs.length}</b></button>
          <button className="nav"><Heart size={16} />Favorites <b>{pairs.filter(p => p.favorite).length}</b></button>
        </div>
        <div className="saved">
          <div className="saved-head"><span>COLLECTIONS</span><button onClick={() => setShowAdd(true)}><Plus size={14} /></button></div>
          <button className="collection"><i style={{background: '#e8b7a0'}} />Editorial <b>4</b></button>
          <button className="collection"><i style={{background: '#9fc9be'}} />Portfolio <b>3</b></button>
          <button className="collection"><i style={{background: '#b4add8'}} />Brand voice <b>5</b></button>
        </div>
        <div className="aside-foot">
          <button className="nav"><Settings2 size={16} />Preferences</button>
          <div className="profile">
            <div className="avatar">YL</div>
            <div><b>Yuki Lin</b><small>Design workspace</small></div>
            <ChevronDown size={14} />
          </div>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <div className="crumb">TYPE LIBRARY / <b>PAIRING STUDIO</b></div>
            <h1>Find the right conversation.</h1>
            <p>Explore combinations, tune the details, and save what feels like you.</p>
          </div>
          <div className="actions">
            <button className="outline" onClick={exportCss}><Download size={15} />Copy CSS</button>
            <button className="primary" onClick={() => setShowAdd(true)}><Plus size={16} />New pairing</button>
          </div>
        </header>

        <div className="layout">
          <section className="gallery">
            <div className="gallery-head">
              <div><h2>Saved pairings</h2><span>{pairs.length} compositions</span></div>
              <div className="view-toggle">
                <button className="on"><Grid3X3 size={14} /></button>
                <button><BookOpen size={14} /></button>
              </div>
            </div>
            <div className="pair-list">
              {pairs.map(p => {
                const v = effectiveParams(p, styles);
                return (
                  <button key={p.id} className={selectedId === p.id ? 'pair selected' : 'pair'} onClick={() => setSelectedId(p.id)}>
                    <div className="pair-top">
                      <span>{p.category}</span>
                      <Heart size={15} fill={p.favorite ? '#e88769' : 'none'} color={p.favorite ? '#e88769' : '#aeb5b7'} />
                    </div>
                    <strong style={{fontFamily: v.headingFont, fontWeight: v.weight}}>{p.heading}</strong>
                    <p style={{fontFamily: v.bodyFont}}>{p.body}</p>
                    <div className="pair-foot">
                      <span>{p.title}</span>
                      <small>{p.styleId != null ? (styles.find(s => s.id === p.styleId)?.name ?? 'Default') : 'Default'}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="studio">
            {current && editorValues ? (
              <>
                <div className="studio-head">
                  <div><span>PAIRING CANVAS</span><h2>{current.title}</h2></div>
                  <button className="favorite" onClick={() => toggleFavorite(current.id)}>
                    <Star size={16} fill={current.favorite ? '#e5a35e' : 'none'} color={current.favorite ? '#e5a35e' : '#98a4a7'} />
                  </button>
                </div>

                <div className="canvas">
                  <div className="canvas-bar">
                    <span>PREVIEW</span>
                    <div><button>Desktop</button><button>Tablet</button><button>Mobile</button></div>
                  </div>
                  <div className="preview">
                    <span className="preview-kicker">A NOTE ON TYPE</span>
                    <h3 style={{
                      fontFamily: editorValues.headingFont,
                      fontSize: `${editorValues.size}px`,
                      fontWeight: editorValues.weight,
                      letterSpacing: `${editorValues.tracking}px`,
                      lineHeight: 1.05,
                    }}>{current.heading}</h3>
                    <p style={{
                      fontFamily: editorValues.bodyFont,
                      lineHeight: editorValues.leading,
                      letterSpacing: `${editorValues.tracking / 2}px`,
                    }}>{current.body}</p>
                    <div className="preview-rule" />
                    <span className="preview-meta">PAIRING 0{current.id} · {current.category.toUpperCase()}</span>
                  </div>
                </div>

                <StyleLibraryPanel
                  styles={styles}
                  pairs={pairs}
                  currentPair={current}
                  editingStyleId={editingStyleId}
                  onSaveCurrent={() => setShowSaveStyle(true)}
                  onApply={styleId => applyStyle(current.id, styleId)}
                  onEdit={styleId => setEditingStyleId(id => (id === styleId ? null : styleId))}
                  onDelete={requestDeleteStyle}
                />

                <TypeControls
                  mode={
                    editingStyle
                      ? {kind: 'style', styleName: editingStyle.name, usedByCount: pairs.filter(p => p.styleId === editingStyle.id).length}
                      : {kind: 'pairing', pair: current, boundStyleName: styles.find(s => s.id === current.styleId)?.name ?? null}
                  }
                  values={editorValues}
                  onChange={onParamChange}
                  onResetOverrides={() => resetOverrides(current.id)}
                  onExitStyleMode={() => setEditingStyleId(null)}
                />

                <div className="studio-foot">
                  <button className="delete" onClick={() => removePair(current.id)}><Trash2 size={15} />Delete pairing</button>
                  <button className="save"><CheckIcon />Saved locally</button>
                </div>
              </>
            ) : (
              <div className="empty-studio">
                <p>No pairings yet.</p>
                <button className="primary" onClick={() => setShowAdd(true)}><Plus size={16} />New pairing</button>
              </div>
            )}
          </section>
        </div>
      </main>

      {showAdd && (
        <NewPairingModal
          onCreate={title => { addPair(title); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}
      {showSaveStyle && (
        <SaveStyleModal onSave={saveCurrentAsStyle} onClose={() => setShowSaveStyle(false)} />
      )}
      {deletingStyle && (
        <DeleteStyleModal
          style={deletingStyle}
          affectedCount={pairs.filter(p => p.styleId === deletingStyle.id).length}
          others={styles.filter(s => s.id !== deletingStyle.id)}
          onConfirm={confirmDeleteStyle}
          onClose={() => setDeletingStyle(null)}
        />
      )}
    </div>
  );
}

function CheckIcon() {
  return <span className="check">✓</span>;
}
